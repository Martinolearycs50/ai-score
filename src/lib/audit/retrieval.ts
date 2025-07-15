import axios from 'axios';
import * as cheerio from 'cheerio';
import { DEFAULT_HEADERS } from '@/utils/constants';

interface RetrievalScores {
  ttfb: number;           // Time to first byte < 200ms (+10)
  paywall: number;        // No paywall/auth wall (+5)
  mainContent: number;    // <main> content ratio ≥ 70% (+5)
  htmlSize: number;       // HTML ≤ 2MB (+10)
}

/**
 * Audit module for the Retrieval pillar (30 points max)
 * Checks: TTFB, paywall presence, main content ratio, HTML size
 */
export async function run(html: string, url: string): Promise<RetrievalScores> {
  const scores: RetrievalScores = {
    ttfb: 0,
    paywall: 0,
    mainContent: 0,
    htmlSize: 0,
  };

  // Check HTML size (≤ 2MB)
  const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
  scores.htmlSize = htmlSizeKB <= 2048 ? 10 : 0;

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

  // Check <main> content ratio
  const mainContent = $('main').text().trim();
  const totalContent = $('body').text().trim();
  
  if (mainContent && totalContent) {
    const contentRatio = mainContent.length / totalContent.length;
    scores.mainContent = contentRatio >= 0.7 ? 5 : 0;
  } else if ($('article').length > 0) {
    // Fallback to article tag if no main tag
    const articleContent = $('article').text().trim();
    if (articleContent && totalContent) {
      const contentRatio = articleContent.length / totalContent.length;
      scores.mainContent = contentRatio >= 0.7 ? 5 : 0;
    }
  }

  // Time to First Byte (TTFB) - needs actual measurement
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      headers: DEFAULT_HEADERS,
      timeout: 5000,
      maxRedirects: 2,
      validateStatus: (status) => status === 200,
      responseType: 'stream',
    });

    // Measure time to first byte
    await new Promise((resolve) => {
      response.data.once('data', () => {
        const ttfb = Date.now() - startTime;
        scores.ttfb = ttfb < 200 ? 10 : 0;
        response.data.destroy(); // Clean up stream
        resolve(true);
      });
    });
  } catch (error) {
    // If we can't measure TTFB, give partial credit if page loaded at all
    scores.ttfb = 0;
  }

  return scores;
}