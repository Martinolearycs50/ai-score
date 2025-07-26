import * as cheerio from 'cheerio';

interface StructureScores {
  headingFrequency: number; // Headings every ≤ 300 words (+5)
  headingDepth: number; // Heading depth ≤ 3 levels (+5)
  structuredData: number; // Valid FAQPage/HowTo/Dataset JSON-LD (+5)
  rssFeed: number; // RSS/Atom feed present (+5)
  listicleFormat: number; // Numbered title + list content (+10) - NEW for 2025
  comparisonTables: number; // Comparison tables present (+5) - NEW for 2025
  semanticUrl: number; // Readable, descriptive URL (+5) - NEW for 2025
}

// Store captured content for dynamic recommendations
export interface CapturedContent {
  title?: string;
  firstParagraph?: string;
  url?: string;
  headingsForComparison?: string[];
  // SEO-specific captures
  structuredDataTypes?: string[]; // Types of schema found
  hasFAQSchema?: boolean; // FAQ schema can trigger rich results
  hasHowToSchema?: boolean; // HowTo schema for featured snippets
  featuredSnippetPotential?: number; // 0-100 score
}

export let capturedContent: CapturedContent = {};

/**
 * Audit module for the Structure pillar (30 points max) - UPDATED for 2025
 * Checks: Heading frequency, heading depth, structured data, RSS feed,
 * listicle format, comparison tables, semantic URLs
 */
export async function run(html: string, url?: string): Promise<StructureScores> {
  // Reset captured content for this analysis
  capturedContent = {};

  const scores: StructureScores = {
    headingFrequency: 0,
    headingDepth: 0,
    structuredData: 0,
    rssFeed: 0,
    listicleFormat: 0,
    comparisonTables: 0,
    semanticUrl: 0,
  };

  const $ = cheerio.load(html);

  // Get main content area
  const mainContent = $('main, article, [role="main"], .content, #content').first();
  const contentElement = mainContent.length ? mainContent : $('body');

  // Get text content and word count
  const contentText = contentElement.text();
  const wordCount = contentText.split(/\s+/).filter((w) => w.length > 0).length;

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
  const foundSchemaTypes: string[] = [];

  structuredDataScripts.each((_, script) => {
    try {
      const content = $(script).html();
      if (content) {
        const jsonData = JSON.parse(content);

        // Check for valuable schema types and track for SEO
        const checkType = (obj: any): boolean => {
          if (!obj) return false;
          const type = obj['@type'];

          // Track all schema types found
          if (type) {
            if (Array.isArray(type)) {
              foundSchemaTypes.push(...type);
            } else {
              foundSchemaTypes.push(type);
            }
          }

          // Check for AI-valuable schemas
          if (type === 'FAQPage' || type === 'HowTo' || type === 'Dataset') {
            // Track SEO-specific benefits
            if (type === 'FAQPage') capturedContent.hasFAQSchema = true;
            if (type === 'HowTo') capturedContent.hasHowToSchema = true;
            return true;
          }
          // Check if it's an array of types
          if (Array.isArray(type)) {
            const hasValuable = type.some((t) => {
              if (t === 'FAQPage') capturedContent.hasFAQSchema = true;
              if (t === 'HowTo') capturedContent.hasHowToSchema = true;
              return t === 'FAQPage' || t === 'HowTo' || t === 'Dataset';
            });
            return hasValuable;
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
  capturedContent.structuredDataTypes = [...new Set(foundSchemaTypes)]; // Remove duplicates

  // Check for RSS/Atom feed
  const rssFeedLinks = $('link[type="application/rss+xml"], link[type="application/atom+xml"]');
  const hasRssFeed = rssFeedLinks.length > 0;

  // Also check for common RSS link patterns in the HTML
  const rssTextLinks = $('a[href*="/rss"], a[href*="/feed"], a[href*=".rss"], a[href*=".atom"]');
  scores.rssFeed = hasRssFeed || rssTextLinks.length > 0 ? 5 : 0;

  // NEW for 2025: Check for listicle format (10 points)
  const pageTitle = $('title').text() || $('h1').first().text() || '';
  capturedContent.title = pageTitle; // Capture for recommendations

  // Check if title contains numbers (common listicle patterns)
  const listicleRegex = /^\d+\s+|[\s-–—]\d+\s+/;
  const hasNumberInTitle = listicleRegex.test(pageTitle);

  // Count lists in content
  const orderedLists = contentElement.find('ol').length;
  const unorderedLists = contentElement.find('ul').length;
  const totalLists = orderedLists + unorderedLists;

  // Count list items and check quality
  const listItems = contentElement.find('li').length;

  // Check for numbered headings (another listicle pattern)
  const numberedHeadings = headings.filter((_, h) => /^\d+\.?\s+/.test($(h).text())).length;

  // Check content density in list items (quality indicator)
  let substantialListItems = 0;
  contentElement.find('li').each((_, li) => {
    const text = $(li).text().trim();
    if (text.length > 50) {
      // At least 50 chars per item for substance
      substantialListItems++;
    }
  });

  // Capture first paragraph for recommendations
  const firstParagraph = contentElement.find('p').first().text();
  capturedContent.firstParagraph = firstParagraph;

  // Score based on actual listicle quality, not just format
  if (hasNumberInTitle && totalLists >= 1 && substantialListItems >= 5) {
    scores.listicleFormat = 10; // High-quality listicle with substantial items
  } else if ((totalLists >= 1 && substantialListItems >= 7) || numberedHeadings >= 5) {
    scores.listicleFormat = 7; // Good list structure with quality content
  } else if (hasNumberInTitle && (totalLists >= 1 || numberedHeadings >= 3)) {
    scores.listicleFormat = 4; // Basic listicle structure
  } else if (totalLists >= 1 && listItems >= 5) {
    scores.listicleFormat = 2; // Has lists but not really a listicle
  } else {
    scores.listicleFormat = 0; // Not a listicle
  }

  // NEW for 2025: Check for comparison tables (5 points)
  const tables = contentElement.find('table').length;
  const comparisonKeywords = /\b(vs|versus|compared|comparison|compare)\b/i;

  // Check headings for comparison language
  const headingsText = headings
    .map((_, el) => $(el).text())
    .get()
    .join(' ');
  const hasComparisonHeading = comparisonKeywords.test(headingsText);

  // Capture headings that could benefit from comparison tables
  if (!tables && hasComparisonHeading) {
    capturedContent.headingsForComparison = headings
      .map((_, el) => $(el).text())
      .get()
      .filter((h) => comparisonKeywords.test(h))
      .slice(0, 3);
  }

  scores.comparisonTables = tables > 0 && hasComparisonHeading ? 5 : 0;

  // NEW for 2025: Check for semantic URL (5 points)
  if (url) {
    capturedContent.url = url;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove trailing slash and split
      const pathParts = pathname
        .replace(/\/$/, '')
        .split('/')
        .filter((p) => p);

      // Check for semantic quality
      let semanticScore = 0;

      // Check if URL contains readable words (not just IDs)
      const lastPart = pathParts[pathParts.length - 1] || '';
      const hasReadableSlug =
        lastPart.length > 3 && !/^\d+$/.test(lastPart) && !/^[a-f0-9]{8,}$/i.test(lastPart);

      // Check if URL reflects content (title keywords in URL)
      const titleKeywords = pageTitle
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const urlLower = pathname.toLowerCase();
      const keywordMatches = titleKeywords.filter((kw) => urlLower.includes(kw)).length;

      // Check for clean structure (no excessive parameters)
      const hasCleanStructure = urlObj.search === '' || urlObj.searchParams.toString().length < 50;

      if (hasReadableSlug && keywordMatches >= 2 && hasCleanStructure) {
        semanticScore = 5; // Excellent semantic URL
      } else if (hasReadableSlug && keywordMatches >= 1) {
        semanticScore = 3; // Good semantic URL
      } else if (hasReadableSlug) {
        semanticScore = 1; // Basic semantic URL
      }

      scores.semanticUrl = semanticScore;
    } catch (e) {
      scores.semanticUrl = 0;
    }
  }

  // Calculate featured snippet potential for SEO
  let featuredSnippetScore = 0;

  // FAQ schema is highly correlated with FAQ rich results
  if (capturedContent.hasFAQSchema) featuredSnippetScore += 30;

  // HowTo schema often triggers how-to rich results
  if (capturedContent.hasHowToSchema) featuredSnippetScore += 30;

  // Listicles often get featured snippets
  if (scores.listicleFormat >= 7) featuredSnippetScore += 20;

  // Tables are great for featured snippets
  if (tables > 0) featuredSnippetScore += 10;

  // Good heading structure helps
  if (scores.headingFrequency >= 4 && scores.headingDepth === 5) featuredSnippetScore += 10;

  capturedContent.featuredSnippetPotential = Math.min(100, featuredSnippetScore);

  return scores;
}
