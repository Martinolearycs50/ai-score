import axios from 'axios';
import * as cheerio from 'cheerio';
import { DEFAULT_HEADERS } from '../../utils/constants';
import { fetchCrUXData, calculateCrUXScore } from '../chromeUxReport';
import { logChromeUxUsage } from '@/utils/apiUsageVerification';

interface RetrievalScores {
  ttfb: number;           // Time to first byte < 200ms (+5) - REDUCED
  paywall: number;        // No paywall/auth wall (+5)
  mainContent: number;    // <main> content ratio ≥ 70% (+5)
  htmlSize: number;       // HTML ≤ 2MB (+5) - REDUCED
  llmsTxtFile: number;    // /llms.txt file present (+5) - NEW for 2025
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

  // Check for paywall/auth wall indicators
  const paywallIndicators = [
    'paywall',
    'subscribe',
    'subscription',
    'premium',
    'member-only',
    'login-required',
    'signin-required',
    'register-to-read'
  ];

  const hasPaywall = paywallIndicators.some(indicator => {
    return $(`[class*="${indicator}"], [id*="${indicator}"], [data-${indicator}]`).length > 0 ||
           html.toLowerCase().includes(`"${indicator}"`);
  });

  // Also check for meta tags that indicate paywall
  const metaPaywall = $('meta[name="robots"][content*="noindex"]').length > 0 ||
                      $('meta[property="article:content_tier"]').attr('content') === 'locked';

  scores.paywall = (!hasPaywall && !metaPaywall) ? 5 : 0;
  
  // Capture paywall status
  capturedDomain.hasPaywall = hasPaywall || metaPaywall;

  // Check main content ratio with comprehensive fallbacks
  const totalContent = $('body').text().trim();
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
    { selector: '.container > div', name: 'Container content' }
  ];
  
  // Try each selector, but keep looking for better content
  let bestContent = '';
  let bestSelector = '';
  let bestRatio = 0;
  
  for (const { selector, name } of contentSelectors) {
    const elements = $(selector);
    
    if (elements.length > 0) {
      let content = '';
      let selectorName = name;
      
      // For multiple elements of the same type, aggregate content
      if (elements.length > 1 && (selector === 'article' || selector.includes('section') || selector.includes('container'))) {
        let aggregated = '';
        elements.each((_, elem) => {
          const elemText = $(elem).text().trim();
          // Skip empty or skeleton elements
          if (elemText.length > 50 && !$(elem).attr('aria-label')?.includes('skeleton')) {
            aggregated += ' ' + elemText;
          }
        });
        content = aggregated.trim();
        selectorName = `${name} (aggregated)`;
      } else {
        // Single element
        content = elements.first().text().trim();
      }
      
      // Calculate ratio for this selector
      if (content && content.length > 100) {
        const ratio = content.length / totalContent.length;
        
        // Keep the best content found so far
        if (ratio > bestRatio) {
          bestContent = content;
          bestSelector = selectorName;
          bestRatio = ratio;
          
          // If we found content that's more than 30% of the page, use it
          if (ratio > 0.3) {
            break;
          }
        }
      }
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
    
    // Find the largest text block, excluding known navigation/footer elements
    const excludeSelectors = 'nav, header, footer, aside, .sidebar, .navigation, .menu, .breadcrumb, .advertisement, .ads, [aria-label="card-skeleton"]';
    const bodyClone = $('body').clone();
    bodyClone.find(excludeSelectors).remove();
    
    // For React/Next.js sites, try aggregating content from sections and articles
    const sections = bodyClone.find('section[aria-label], section.container, article[aria-label]');
    if (sections.length > 0) {
      let aggregatedContent = '';
      sections.each((_, elem) => {
        const sectionText = $(elem).text().trim();
        // Skip skeleton/placeholder sections
        if (sectionText.length > 50 && !sectionText.includes('filter:grayscale')) {
          aggregatedContent += ' ' + sectionText;
        }
      });
      
      if (aggregatedContent.length > 100) {
        mainContentText = aggregatedContent.trim();
        contentSelector = 'Aggregated sections/articles';
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
        // Last resort: use body content minus navigation
        mainContentText = bodyClone.text().trim();
        contentSelector = 'Body content (minus navigation)';
      }
    }
  }
  
  // Calculate content ratio and score
  if (mainContentText && totalContent) {
    const contentRatio = mainContentText.length / totalContent.length;
    
    // Log what we found
    console.log(`📊 [Retrieval] Main content detection:
      - Selector used: ${contentSelector}
      - Content length: ${mainContentText.length} chars
      - Total page length: ${totalContent.length} chars
      - Content ratio: ${(contentRatio * 100).toFixed(1)}%`);
    
    // Partial scoring based on content ratio
    if (contentRatio >= 0.6) {
      scores.mainContent = 5; // Excellent - 60%+ is main content
    } else if (contentRatio >= 0.4) {
      scores.mainContent = 3; // Good - 40-60% is main content
    } else if (contentRatio >= 0.2) {
      scores.mainContent = 1; // Poor - 20-40% is main content
    } else {
      scores.mainContent = 0; // Very poor - less than 20% is main content
    }
    
    capturedDomain.mainContentRatio = Math.round(contentRatio * 100);
    capturedDomain.mainContentSample = mainContentText.substring(0, 200) + '...';
    capturedDomain.contentSelector = contentSelector;
  } else {
    console.log('❌ [Retrieval] No content found on page');
    scores.mainContent = 0;
    capturedDomain.mainContentRatio = 0;
    capturedDomain.contentSelector = 'None found';
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
        rating: cruxData.metrics.ttfbRating
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
        hasData: false
      };
    }
  } catch (error) {
    console.log('⚠️ [Retrieval] CrUX error, falling back to synthetic measurement:', error);
    capturedDomain.cruxData = {
      hasData: false
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
            console.warn('⚠️ [Retrieval] Synthetic measurement available but CrUX data already used');
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
        const hasAICrawlerRules = /User-agent:\s*(GPTBot|ChatGPT|ClaudeBot|PerplexityBot|anthropic-ai)/i.test(robotsContent);
        
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