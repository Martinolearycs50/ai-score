import axios from 'axios';
import * as cheerio from 'cheerio';

import { logChromeUxUsage } from '@/utils/apiUsageVerification';

import { DEFAULT_HEADERS } from '../../utils/constants';
import { calculateCrUXScore, fetchCrUXData } from '../chromeUxReport';

interface RetrievalScores {
  ttfb: number; // Time to first byte < 200ms (+5) - REDUCED
  paywall: number; // No paywall/auth wall (+5)
  mainContent: number; // <main> content ratio ≥ 70% (+5)
  htmlSize: number; // HTML ≤ 2MB (+5) - REDUCED
  llmsTxtFile: number; // /llms.txt file present (+5) - NEW for 2025
}

// Store captured content for dynamic recommendations
export interface CapturedDomain {
  domain?: string;
  hasLlmsTxt?: boolean;
  actualTtfb?: number;
  htmlSizeMB?: number;
  htmlSizeKB?: number;
  mainContentSample?: string;
  hasPaywall?: boolean;
  mainContentRatio?: number;
  contentSelector?: string;
  cruxData?: {
    hasData: boolean;
    ttfb?: number;
    lcp?: number;
    ttfbRating?: string;
  };
}

export let capturedDomain: CapturedDomain = {};

/**
 * Audit module for the Retrieval pillar (25 points max) - UPDATED for 2025
 * Checks: TTFB, paywall presence, main content ratio, HTML size, llms.txt
 */
export async function run(html: string, url: string): Promise<RetrievalScores> {
  // Reset captured content for this analysis
  capturedDomain = {};

  // Capture URL domain for examples
  try {
    const urlObj = new URL(url);
    capturedDomain.domain = urlObj.hostname;
  } catch {}

  const scores: RetrievalScores = {
    ttfb: 0,
    paywall: 0,
    mainContent: 0,
    htmlSize: 0,
    llmsTxtFile: 0,
  };

  // Check HTML size (≤ 2MB)
  const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
  scores.htmlSize = htmlSizeKB <= 2048 ? 5 : 0; // Reduced from 10 to 5

  // Capture actual size for recommendations
  capturedDomain.htmlSizeKB = Math.round(htmlSizeKB);
  capturedDomain.htmlSizeMB = Number((htmlSizeKB / 1024).toFixed(2));

  // Parse HTML
  const $ = cheerio.load(html);

  // IMPROVED PAYWALL DETECTION - Smarter about corporate sites
  const pageContent = $('body').text().toLowerCase();
  const title = $('title').text().toLowerCase();

  // Check if this appears to be a corporate/product page
  const corporateIndicators = [
    'payment',
    'payments',
    'checkout',
    'merchant',
    'api',
    'sdk',
    'enterprise',
    'business',
    'company',
    'about us',
    'careers',
    'contact us',
    'our team',
    'our mission',
    'products',
    'services',
    'solutions',
    'platform',
    'features',
    'pricing',
    'customers',
  ];

  const isCorporatePage = corporateIndicators.some(
    (indicator) => pageContent.includes(indicator) || title.includes(indicator)
  );

  // Check for actual content restriction indicators
  const contentRestrictionIndicators = [
    'to continue reading',
    'subscribers only',
    'members only',
    'sign in to view',
    'create account to read',
    'premium content',
    'unlock this article',
    'already a subscriber',
    'subscribe to read more',
    'limited articles remaining',
  ];

  // Only check for paywall if we find actual content restriction text
  let hasPaywall = false;

  if (!isCorporatePage) {
    // For non-corporate pages, check for paywall more strictly
    hasPaywall = contentRestrictionIndicators.some((indicator) => pageContent.includes(indicator));

    // Also check for paywall-specific classes/IDs but only if content restriction text exists
    if (hasPaywall) {
      const paywallSelectors = [
        '.paywall',
        '#paywall',
        '[data-paywall]',
        '.subscription-required',
        '.members-only',
        '.premium-content',
        '.locked-content',
      ];

      hasPaywall = paywallSelectors.some((selector) => $(selector).length > 0);
    }

    // Check meta tags that specifically indicate locked content
    const metaPaywall =
      $('meta[property="article:content_tier"]').attr('content') === 'locked' ||
      $('meta[name="access"]').attr('content') === 'subscription';

    hasPaywall = hasPaywall || metaPaywall;
  }

  scores.paywall = !hasPaywall ? 5 : 0;

  // Capture paywall status
  capturedDomain.hasPaywall = hasPaywall;

  // Remove noise elements first
  const $clone = $.html();
  const $clean = cheerio.load($clone);

  // Remove all noise elements
  $clean(
    'script, style, noscript, nav, header, footer, aside, .nav, .navigation, .menu, .sidebar, .footer, .header, [aria-hidden="true"], [hidden], .ads, .advertisement'
  ).remove();

  // Get clean body text for comparison
  const totalWords = $clean('body')
    .text()
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  let mainContentText = '';
  let contentSelector = '';

  // Try various content selectors in order of preference
  const contentSelectors = [
    { selector: 'main', name: '<main> tag' },
    { selector: 'article', name: '<article> tag' },
    { selector: '[role="main"]', name: 'role="main"' },
    { selector: '[aria-label*="main"]', name: 'aria-label main' },
    { selector: '#content, .content', name: '#content or .content' },
    { selector: '#main-content, .main-content', name: 'main-content' },
    { selector: '#main, .main', name: '#main or .main' },
    { selector: '.post-content, .entry-content', name: 'post/entry content' },
    { selector: '.article-body, .story-body', name: 'article/story body' },
    { selector: 'section[aria-label*="section"]', name: 'aria-labeled sections' },
    { selector: 'section.container', name: 'section containers' },
    { selector: '.mw-parser-output', name: 'Wikipedia content' },
    { selector: '#mw-content-text', name: 'MediaWiki content' },
    { selector: '.markdown-body', name: 'Markdown content' },
    { selector: '.container > div', name: 'Container content' },
    { selector: 'div[class*="hero"], div[class*="Hero"]', name: 'Hero sections' },
    { selector: 'section[class*="feature"], section[class*="Feature"]', name: 'Feature sections' },
    { selector: '.page-content, .site-content', name: 'Page/site content' },
    { selector: '[data-testid*="content"], [data-testid*="Content"]', name: 'data-testid content' },
    { selector: 'div#__next main, div#__next > div > main', name: 'Next.js main' },
    { selector: 'div#__next section', name: 'Next.js sections' },
    {
      selector: 'div[class*="wrapper"] section, div[class*="Wrapper"] section',
      name: 'Wrapper sections',
    },
    {
      selector: 'div[class*="layout"] > section, div[class*="Layout"] > section',
      name: 'Layout sections',
    },
    { selector: '.prose', name: 'Prose content' },
    { selector: 'div[class*="container"] > div[class*="content"]', name: 'Container > content' },
    { selector: 'body > div > div > section', name: 'Nested sections' },
  ];

  // Try each selector, but keep looking for better content
  let bestContent = '';
  let bestSelector = '';
  let bestRatio = 0;

  console.log(
    `🔍 [Retrieval] Trying ${contentSelectors.length} selectors for content detection...`
  );

  for (const { selector, name } of contentSelectors) {
    try {
      const elements = $clean(selector);

      if (elements.length > 0) {
        console.log(`  ✓ Found ${elements.length} element(s) with selector: ${name}`);
        let extractedText = '';
        let selectorName = name;

        // For multiple elements, check if we should aggregate
        const shouldAggregate =
          elements.length > 1 &&
          (selector.includes('section') ||
            selector.includes('article') ||
            selector.includes('div') ||
            selector.includes('container') ||
            selector.includes('hero') ||
            selector.includes('feature') ||
            name.includes('sections') ||
            name.includes('content'));

        if (shouldAggregate) {
          let aggregatedParts: string[] = [];
          elements.each((_, elem) => {
            const $elem = $clean(elem);
            // Extract paragraphs and headings separately
            const textParts: string[] = [];
            $elem.find('p, h1, h2, h3, h4, h5, h6, li').each((_, textElem) => {
              const text = $clean(textElem).text().trim();
              if (text.length > 20) {
                textParts.push(text);
              }
            });

            // If no structured text found, get all text
            if (textParts.length === 0) {
              const elemText = $elem.text().trim();
              if (elemText.length > 50 && !$elem.attr('aria-label')?.includes('skeleton')) {
                textParts.push(elemText);
              }
            }

            if (textParts.length > 0) {
              aggregatedParts.push(...textParts);
            }
          });
          extractedText = aggregatedParts.join(' ');
          selectorName = `${name} (aggregated)`;
        } else {
          // Single element - extract structured text
          const $elem = elements.first();
          const textParts: string[] = [];
          $elem.find('p, h1, h2, h3, h4, h5, h6, li').each((_, textElem) => {
            const text = $clean(textElem).text().trim();
            if (text.length > 20) {
              textParts.push(text);
            }
          });

          if (textParts.length > 0) {
            extractedText = textParts.join(' ');
          } else {
            extractedText = $elem.text().trim();
          }
        }

        // Calculate word count and ratio
        const wordCount = extractedText.split(/\s+/).filter((w) => w.length > 0).length;
        if (wordCount > 50) {
          const ratio = wordCount / totalWords;

          // Keep the best content found so far
          if (ratio > bestRatio) {
            bestContent = extractedText;
            bestSelector = selectorName;
            bestRatio = ratio;

            // If we found content that's more than 30% of the page, use it
            if (ratio > 0.3) {
              break;
            }
          }
        }
      }
    } catch (error) {
      console.log(
        `  ❌ Error with selector ${name}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Use the best content found
  if (bestContent) {
    mainContentText = bestContent;
    contentSelector = bestSelector;
  }

  // If no specific content area found, use heuristic approach
  if (!mainContentText) {
    console.log('⚠️ [Retrieval] No standard content container found, using heuristic approach');

    // Use the already cleaned DOM
    const bodyClone = $clean('body');

    // For React/Next.js sites, try aggregating content from sections and articles
    const contentElements = bodyClone.find(
      'section, article, div[class*="content"], div[class*="Content"], div[class*="hero"], div[class*="Hero"], div[class*="feature"], div[class*="Feature"]'
    );
    if (contentElements.length > 0) {
      let aggregatedContent = '';
      let elementCount = 0;

      contentElements.each((_, elem) => {
        const $elem = $(elem);
        const elemText = $elem.text().trim();

        // Skip if element is too small or contains skeleton/placeholder indicators
        if (elemText.length < 50) return;
        if ($elem.attr('aria-label')?.includes('skeleton')) return;
        if ($elem.find('[class*="skeleton" i]').length > 0) return;
        if (elemText.includes('filter:grayscale')) return;

        // Skip if this is clearly navigation or footer content
        const classAttr = $elem.attr('class') || '';
        const idAttr = $elem.attr('id') || '';
        if (/nav|footer|header|sidebar|menu/i.test(classAttr + idAttr)) return;

        // Add to aggregated content
        aggregatedContent += ' ' + elemText;
        elementCount++;
      });

      if (aggregatedContent.length > 100) {
        mainContentText = aggregatedContent.trim();
        contentSelector = `Aggregated content (${elementCount} elements)`;
      }
    }

    // If still no content, try the original heuristic
    if (!mainContentText) {
      // Get all divs and find the one with most text
      let largestDiv: any = null;
      let largestTextLength = 0;

      bodyClone.find('div').each((_, elem) => {
        const div = $(elem);
        // Only count direct text, not nested
        const directText = div.clone().children().remove().end().text().trim();
        if (directText.length > largestTextLength) {
          largestTextLength = directText.length;
          largestDiv = div;
        }
      });

      if (largestDiv && largestTextLength > 100) {
        mainContentText = largestDiv.text().trim();
        contentSelector = 'Heuristic (largest content block)';
      } else {
        // Try a simpler approach - find any divs with substantial text
        const allDivs = bodyClone.find('div');
        let combinedText = '';
        let divCount = 0;

        allDivs.each((_, elem) => {
          const $div = $(elem);
          // Get only direct text content (not from children)
          const directText = $div.clone().children().remove().end().text().trim();

          if (directText.length > 100) {
            combinedText += ' ' + directText;
            divCount++;
          }
        });

        if (combinedText.length > 200) {
          mainContentText = combinedText.trim();
          contentSelector = `Combined text from ${divCount} divs`;
        } else {
          // Last resort: use body content minus navigation
          mainContentText = bodyClone.text().trim();
          contentSelector = 'Body content (minus navigation)';
        }
      }
    }
  }

  // Calculate content ratio and score
  if (mainContentText && totalWords > 0) {
    const mainWords = mainContentText.split(/\s+/).filter((w) => w.length > 0).length;
    const contentRatio = mainWords / totalWords;

    // Log what we found
    console.log(`📊 [Retrieval] Main content detection:
      - URL: ${url}
      - Selector used: ${contentSelector}
      - Content words: ${mainWords} words
      - Total page words: ${totalWords} words
      - Content ratio: ${(contentRatio * 100).toFixed(1)}%
      - Score: ${contentRatio >= 0.3 ? 5 : contentRatio >= 0.15 ? 4 : contentRatio >= 0.05 ? 3 : contentRatio >= 0.02 ? 2 : contentRatio >= 0.01 ? 1 : 0}/5`);

    // Partial scoring based on content ratio
    // Adjusted for modern sites that have lots of JS/CSS in the DOM
    if (contentRatio >= 0.3) {
      scores.mainContent = 5; // Excellent - 30%+ is main content
    } else if (contentRatio >= 0.15) {
      scores.mainContent = 4; // Good - 15-30% is main content
    } else if (contentRatio >= 0.05) {
      scores.mainContent = 3; // Fair - 5-15% is main content
    } else if (contentRatio >= 0.02) {
      scores.mainContent = 2; // Poor - 2-5% is main content
    } else if (contentRatio >= 0.01) {
      scores.mainContent = 1; // Very poor - 1-2% is main content
    } else {
      scores.mainContent = 0; // Terrible - less than 1% is main content
    }

    capturedDomain.mainContentRatio = Math.round(contentRatio * 100);
    capturedDomain.mainContentSample = mainContentText.substring(0, 200) + '...';
    capturedDomain.contentSelector = contentSelector;
  } else {
    console.log('❌ [Retrieval] No content found on page');
    // Give partial credit if the page has some text at all
    if (totalWords > 50) {
      scores.mainContent = 1; // Minimal score for having some content
      capturedDomain.mainContentRatio = 100; // Assume all content is "main" if we can't identify structure
      capturedDomain.contentSelector = 'Unstructured content';
      console.log('ℹ️ [Retrieval] Giving minimal score for unstructured content');
    } else {
      scores.mainContent = 0;
      capturedDomain.mainContentRatio = 0;
      capturedDomain.contentSelector = 'None found';
    }
  }

  // Time to First Byte (TTFB) - Try CrUX data first, fallback to synthetic measurement
  let ttfbMeasured = false;

  // Attempt to get real-world TTFB from Chrome UX Report
  try {
    console.log('🌐 [Retrieval] Attempting to fetch Chrome UX Report data...');
    const cruxData = await fetchCrUXData(url);
    if (cruxData.hasData && cruxData.metrics?.ttfb) {
      // Use CrUX TTFB data (p75 - what 75% of users experience)
      const cruxTtfb = cruxData.metrics.ttfb;

      console.log('📊 [Retrieval] Using CrUX data:', {
        ttfb: cruxTtfb,
        rating: cruxData.metrics.ttfbRating,
      });

      // Score based on CrUX rating with granular scoring
      if (cruxData.metrics.ttfbRating === 'good') {
        scores.ttfb = 5; // Full points for good rating (< 800ms)
      } else if (cruxData.metrics.ttfbRating === 'needs-improvement') {
        // More granular scoring within needs-improvement range (800-1800ms)
        if (cruxTtfb < 1200) {
          scores.ttfb = 3; // Better end of needs-improvement
        } else {
          scores.ttfb = 2; // Worse end of needs-improvement
        }
      } else if (cruxTtfb < 3000) {
        scores.ttfb = 1; // Poor but not terrible (1800-3000ms)
      } else {
        scores.ttfb = 0; // Very poor (> 3000ms)
      }

      console.log(`✅ [Retrieval] CrUX TTFB score: ${scores.ttfb}/5 (WILL BE USED)`);

      // Log that CrUX data is being used for scoring
      logChromeUxUsage('ttfb', { score: scores.ttfb, value: cruxTtfb });

      capturedDomain.actualTtfb = cruxTtfb;
      capturedDomain.cruxData = {
        hasData: true,
        ttfb: cruxTtfb,
        lcp: cruxData.metrics.lcp,
        ttfbRating: cruxData.metrics.ttfbRating,
      };
      ttfbMeasured = true;
    } else {
      console.log('ℹ️ [Retrieval] No CrUX data available for this URL');
      capturedDomain.cruxData = {
        hasData: false,
      };
    }
  } catch (error) {
    console.log('⚠️ [Retrieval] CrUX error, falling back to synthetic measurement:', error);
    capturedDomain.cruxData = {
      hasData: false,
    };
  }

  // Fallback to synthetic measurement if CrUX data not available
  if (!ttfbMeasured) {
    console.log('🔄 [Retrieval] Falling back to synthetic TTFB measurement...');
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        headers: DEFAULT_HEADERS,
        timeout: 5000,
        maxRedirects: 2,
        validateStatus: (status) => status === 200,
        responseType: 'stream',
      });

      // Measure time to first byte with granular scoring
      await new Promise((resolve) => {
        response.data.once('data', () => {
          const ttfb = Date.now() - startTime;

          console.log(`⏱️ [Retrieval] Synthetic TTFB: ${ttfb}ms`);

          // Granular TTFB scoring for synthetic measurement
          if (ttfb < 200) {
            scores.ttfb = 5; // Excellent
          } else if (ttfb < 500) {
            scores.ttfb = 4; // Good
          } else if (ttfb < 1000) {
            scores.ttfb = 2; // Needs improvement
          } else if (ttfb < 2000) {
            scores.ttfb = 1; // Poor
          } else {
            scores.ttfb = 0; // Very poor
          }

          console.log(`✅ [Retrieval] Synthetic TTFB score: ${scores.ttfb}/5`);

          // Only override if we don't already have CrUX data
          if (!capturedDomain.cruxData?.hasData) {
            capturedDomain.actualTtfb = ttfb; // Capture actual TTFB
          } else {
            console.warn(
              '⚠️ [Retrieval] Synthetic measurement available but CrUX data already used'
            );
          }

          response.data.destroy(); // Clean up stream
          resolve(true);
        });
      });
    } catch (error) {
      console.error('❌ [Retrieval] Failed to measure TTFB:', error);
      // If we can't measure TTFB, give partial credit if page loaded at all
      scores.ttfb = 0;
    }
  }

  // NEW for 2025: Check for llms.txt file (5 points)
  try {
    const urlObj = new URL(url);

    // Try to fetch /llms.txt
    const llmsTxtUrl = new URL('/llms.txt', url).toString();

    try {
      const response = await axios.get(llmsTxtUrl, {
        headers: DEFAULT_HEADERS,
        timeout: 3000,
        maxRedirects: 0,
        validateStatus: (status) => status === 200,
      });

      // Check if we got a valid response
      if (response.status === 200 && response.data) {
        scores.llmsTxtFile = 5;
        capturedDomain.hasLlmsTxt = true;
      } else {
        scores.llmsTxtFile = 0;
        capturedDomain.hasLlmsTxt = false;
      }
    } catch {
      // Also try robots.txt to see if AI-specific rules exist there
      try {
        const robotsTxtUrl = new URL('/robots.txt', url).toString();
        const robotsResponse = await axios.get(robotsTxtUrl, {
          headers: DEFAULT_HEADERS,
          timeout: 3000,
          maxRedirects: 0,
          validateStatus: (status) => status === 200,
        });

        // Check if robots.txt mentions AI crawlers
        const robotsContent = robotsResponse.data?.toString() || '';
        const hasAICrawlerRules =
          /User-agent:\s*(GPTBot|ChatGPT|ClaudeBot|PerplexityBot|anthropic-ai)/i.test(
            robotsContent
          );

        scores.llmsTxtFile = hasAICrawlerRules ? 2 : 0; // Partial credit for AI rules in robots.txt
        capturedDomain.hasLlmsTxt = false;
      } catch {
        scores.llmsTxtFile = 0;
        capturedDomain.hasLlmsTxt = false;
      }
    }
  } catch {
    scores.llmsTxtFile = 0;
    capturedDomain.hasLlmsTxt = false;
  }

  return scores;
}
