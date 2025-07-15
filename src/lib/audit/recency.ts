import * as cheerio from 'cheerio';

interface RecencyScores {
  lastModified: number;    // Last-Modified header & on-page timestamp < 90 days (+5)
  stableCanonical: number; // Stable canonical URL (no querystring variants) (+5)
}

interface Headers {
  [key: string]: string;
}

/**
 * Audit module for the Recency pillar (10 points max)
 * Checks: Content freshness, URL stability
 */
export async function run(html: string, headers: Headers): Promise<RecencyScores> {
  const scores: RecencyScores = {
    lastModified: 0,
    stableCanonical: 0,
  };

  const $ = cheerio.load(html);

  // Check Last-Modified header and on-page timestamps
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  let isFresh = false;

  // Check Last-Modified header
  const lastModifiedHeader = headers['last-modified'] || headers['Last-Modified'];
  if (lastModifiedHeader) {
    const lastModifiedDate = new Date(lastModifiedHeader);
    if (!isNaN(lastModifiedDate.getTime()) && lastModifiedDate > ninetyDaysAgo) {
      isFresh = true;
    }
  }

  // Check for on-page timestamps if header not fresh
  if (!isFresh) {
    // Look for various date formats in meta tags
    const dateMetaTags = [
      $('meta[property="article:modified_time"]').attr('content'),
      $('meta[property="article:published_time"]').attr('content'),
      $('meta[name="last-modified"]').attr('content'),
      $('meta[name="date"]').attr('content'),
      $('meta[name="DC.date.modified"]').attr('content'),
      $('meta[name="DC.date.created"]').attr('content'),
    ].filter((date): date is string => Boolean(date));

    // Check structured data for dateModified/datePublished
    const structuredDataDates: string[] = [];
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const content = $(script).html();
        if (content) {
          const jsonData = JSON.parse(content);
          if (jsonData.dateModified) structuredDataDates.push(jsonData.dateModified);
          if (jsonData.datePublished) structuredDataDates.push(jsonData.datePublished);
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    });

    // Look for date patterns in content
    const datePatterns = [
      // Common date elements
      $('.date, .updated, .modified, .last-updated, .post-date, .article-date'),
      $('[class*="date"], [class*="updated"], [class*="modified"]'),
      $('time[datetime]'),
      
      // Date in text (look for "Updated:", "Last modified:", etc.)
      $('p, span, div').filter((_, el) => {
        const text = $(el).text();
        return /(?:updated|modified|revised|published)[\s:]+/i.test(text);
      })
    ];

    // Check all found dates
    const allDates = [...dateMetaTags, ...structuredDataDates];
    
    datePatterns.forEach(elements => {
      elements.each((_, el) => {
        const datetime = $(el).attr('datetime');
        const text = $(el).text();
        if (datetime) allDates.push(datetime);
        if (text) allDates.push(text);
      });
    });

    // Parse and check dates
    for (const dateStr of allDates) {
      const parsedDate = parseFlexibleDate(dateStr);
      if (parsedDate && parsedDate > ninetyDaysAgo) {
        isFresh = true;
        break;
      }
    }
  }

  scores.lastModified = isFresh ? 5 : 0;

  // Check for stable canonical URL
  const canonicalLink = $('link[rel="canonical"]').attr('href');
  let hasStableCanonical = false;

  if (canonicalLink) {
    try {
      const canonicalUrl = new URL(canonicalLink);
      
      // Check if URL has minimal or no query parameters
      const queryParams = Array.from(canonicalUrl.searchParams.keys());
      const hasMinimalParams = queryParams.length === 0 || 
        (queryParams.length === 1 && ['utm_source', 'utm_medium', 'utm_campaign'].includes(queryParams[0]));
      
      // Check if URL structure is clean (no session IDs, timestamps, etc.)
      const urlPath = canonicalUrl.pathname;
      const hasCleanPath = !urlPath.match(/[?&](?:session|sid|token|timestamp|ts)=/i) &&
                          !urlPath.match(/\d{10,}/); // No unix timestamps
      
      hasStableCanonical = hasMinimalParams && hasCleanPath;
    } catch (e) {
      // Invalid URL
      hasStableCanonical = false;
    }
  }

  scores.stableCanonical = hasStableCanonical ? 5 : 0;

  return scores;
}

/**
 * Flexible date parser that handles various formats
 */
function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try standard date parsing first
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try to extract date patterns
  const patterns = [
    // ISO 8601
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // US format
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // European format
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
    // Written format
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
    // Reverse written format
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      // Try to construct a date from the match
      const constructedDate = new Date(dateStr);
      if (!isNaN(constructedDate.getTime())) {
        return constructedDate;
      }
    }
  }
  
  return null;
}