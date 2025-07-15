import * as cheerio from 'cheerio';

interface StructureScores {
  headingFrequency: number;   // Headings every ≤ 300 words (+5)
  headingDepth: number;       // Heading depth ≤ 3 levels (+5)
  structuredData: number;     // Valid FAQPage/HowTo/Dataset JSON-LD (+5)
  rssFeed: number;           // RSS/Atom feed present (+5)
}

/**
 * Audit module for the Structure pillar (20 points max)
 * Checks: Heading frequency, heading depth, structured data, RSS feed
 */
export async function run(html: string): Promise<StructureScores> {
  const scores: StructureScores = {
    headingFrequency: 0,
    headingDepth: 0,
    structuredData: 0,
    rssFeed: 0,
  };

  const $ = cheerio.load(html);

  // Get main content area
  const mainContent = $('main, article, [role="main"], .content, #content').first();
  const contentElement = mainContent.length ? mainContent : $('body');
  
  // Get text content and word count
  const contentText = contentElement.text();
  const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;

  // Check heading frequency (should have headings every ≤ 300 words)
  const headings = contentElement.find('h1, h2, h3, h4, h5, h6');
  const headingCount = headings.length;
  
  if (wordCount > 0 && headingCount > 0) {
    const wordsPerHeading = wordCount / headingCount;
    scores.headingFrequency = wordsPerHeading <= 300 ? 5 : 0;
  }

  // Check heading depth (≤ 3 levels)
  const headingLevels = new Set<number>();
  headings.each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1));
    headingLevels.add(level);
  });
  
  // Convert to array and sort to find the depth
  const sortedLevels = Array.from(headingLevels).sort((a, b) => a - b);
  const maxDepth = sortedLevels.length;
  
  scores.headingDepth = maxDepth <= 3 && maxDepth > 0 ? 5 : 0;

  // Check for structured data (FAQPage, HowTo, Dataset)
  const structuredDataScripts = $('script[type="application/ld+json"]');
  let hasValuableStructuredData = false;
  
  structuredDataScripts.each((_, script) => {
    try {
      const content = $(script).html();
      if (content) {
        const jsonData = JSON.parse(content);
        
        // Check for valuable schema types
        const checkType = (obj: any): boolean => {
          if (!obj) return false;
          
          const type = obj['@type'];
          if (type === 'FAQPage' || type === 'HowTo' || type === 'Dataset') {
            return true;
          }
          
          // Check if it's an array of types
          if (Array.isArray(type)) {
            return type.some(t => t === 'FAQPage' || t === 'HowTo' || t === 'Dataset');
          }
          
          // Check nested @graph
          if (obj['@graph'] && Array.isArray(obj['@graph'])) {
            return obj['@graph'].some((item: any) => checkType(item));
          }
          
          return false;
        };
        
        if (checkType(jsonData)) {
          hasValuableStructuredData = true;
        }
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  });
  
  scores.structuredData = hasValuableStructuredData ? 5 : 0;

  // Check for RSS/Atom feed
  const rssFeedLinks = $('link[type="application/rss+xml"], link[type="application/atom+xml"]');
  const hasRssFeed = rssFeedLinks.length > 0;
  
  // Also check for common RSS link patterns in the HTML
  const rssTextLinks = $('a[href*="/rss"], a[href*="/feed"], a[href*=".rss"], a[href*=".atom"]');
  
  scores.rssFeed = (hasRssFeed || rssTextLinks.length > 0) ? 5 : 0;

  return scores;
}