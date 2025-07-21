import { capturedHeadings as densityHeadings } from './audit/factDensity';
import { capturedDomain as retrievalDomain } from './audit/retrieval';
// Import captured content from audit modules
import { capturedContent as structureContent } from './audit/structure';
import type { ExtractedContent } from './contentExtractor';
import { DynamicRecommendationGenerator } from './dynamicRecommendations';
import {
  getPageTypeCustomMessage,
  getPageTypePriorityMultiplier,
  shouldShowMetric,
} from './pageTypeRecommendations';
import type { RecommendationTemplate } from './types';

/**
 * Recommendation templates for AI Search optimization
 * Each template includes why it matters, how to fix it, and points gained
 */
export const recTemplates: Record<string, RecommendationTemplate> = {
  // RETRIEVAL pillar recommendations
  ttfb: {
    why: 'AI engines skip slow pages. Fast TTFB (Time To First Byte - server response time) under 200ms gets indexed more frequently.',
    fix: '1. Install a CDN like Cloudflare (free tier works): Visit cloudflare.com, add your site, and follow their DNS setup. 2. Enable browser caching by adding these headers to your server: Cache-Control: public, max-age=3600. 3. For dynamic sites, consider caching plugins (WordPress: W3 Total Cache) or static generation (Next.js, Gatsby). 4. Optimize database queries and reduce server processing time. Most sites see 50-80% speed improvement with just a CDN.',
    gain: 10,
    example: {
      before: 'Server response time: 850ms',
      after: 'Server response time: 180ms with CDN\nCache-Control: public, max-age=3600',
    },
  },

  paywall: {
    why: "AI engines can't index paywalled content. Your knowledge becomes invisible to AI search.",
    fix: '1. Create an AI-accessible version: Add a special route like /ai-preview that shows the first 300-500 words without paywall. 2. Use schema markup to indicate free preview content: Add "isAccessibleForFree": true to your Article schema. 3. Consider "soft paywalls" that allow 3-5 free articles per month. 4. For technical content, provide detailed abstracts or summaries that AI can index. Remember: AI can\'t subscribe, so completely paywalled content becomes invisible to AI search.',
    gain: 5,
    example: {
      before: '<div class="paywall-blocked">Subscribe to read more...</div>',
      after:
        '<article>\n  <div class="free-preview">First 300 words visible...</div>\n  <div class="paywall">Subscribe for full article</div>\n</article>',
    },
  },

  mainContent: {
    why: 'AI needs clear content structure. Helps distinguish article from ads/navigation.',
    fix: '1. Wrap your primary content: Use semantic HTML tags like <main> or <article> around your main content. 2. If using divs, add clear identifiers: id="content" or class="main-content". 3. Improve content ratio: Aim for main content to be at least 40% of total page text (currently it may be much less). 4. Reduce navigation/sidebar text that dilutes your content. 5. Use role="main" attribute as a fallback. 6. For CMSs like WordPress, ensure your theme uses proper content containers.',
    gain: 5,
    example: {
      before: '<div class="content">Article here...</div>',
      after:
        '<main>\n  <article>\n    <h1>Article Title</h1>\n    <p>Content here...</p>\n  </article>\n</main>',
    },
  },

  htmlSize: {
    why: 'Large pages timeout for AI crawlers. They give up after 2MB of HTML.',
    fix: "1. Move all <style> and <script> tags to external files: Create styles.css and scripts.js files. 2. Implement lazy loading for comments: Use Intersection Observer API or libraries like Disqus's lazy load option. 3. Compress images: Use WebP format and responsive images (<picture> element). 4. Remove unnecessary HTML: Delete commented code, excessive whitespace, and redundant divs. 5. Enable GZIP compression on your server (saves 60-80% file size). Target: Keep initial HTML under 500KB, definitely under 2MB.",
    gain: 10,
    example: {
      before: 'Page size: 3.5MB (with 500 comments loaded)',
      after: 'Page size: 850KB (comments load on demand)',
    },
  },

  // FACT_DENSITY pillar recommendations
  uniqueStats: {
    why: 'AI values data-rich content. Specific facts make you the primary source.',
    fix: '1. Replace every vague claim: Change "many users" to "73% of 1,200 users" or "over 5,000 customers". 2. Add specific dates: Not "recently" but "in March 2024" or "last updated December 15, 2024". 3. Include measurable outcomes: "increased traffic" becomes "increased traffic by 150% in 6 months". 4. Cite sources inline: Add (Source: 2024 Industry Report) or link to studies. 5. Use comparison data: "50% faster than competitor X" instead of just "fast". AI loves specific, verifiable facts.',
    gain: 10,
    example: {
      before: 'Many users prefer our product',
      after: '73% of 1,200 surveyed users prefer our product (2024 Customer Survey)',
    },
  },

  dataMarkup: {
    why: 'Tables and lists help AI extract facts. Structured data = better AI comprehension.',
    fix: '1. Convert comparisons to tables: Any time you compare 2+ things, use a <table> with clear headers. 2. Use proper list tags: <ul> for features, <ol> for steps, <dl> for definitions. Never use line breaks or dashes for lists. 3. Add <caption> to tables explaining what they show. 4. For data points, use <data value="123">123 users</data> tag. 5. Structure FAQ sections with <dl><dt>Question?</dt><dd>Answer</dd></dl>. This structured approach helps AI extract precise information.',
    gain: 5,
    example: {
      before: 'Product A costs $99 and has 5GB storage. Product B costs $199 with 50GB.',
      after:
        '<table>\n  <tr><th>Product</th><th>Price</th><th>Storage</th></tr>\n  <tr><td>A</td><td>$99</td><td>5GB</td></tr>\n  <tr><td>B</td><td>$199</td><td>50GB</td></tr>\n</table>',
    },
  },

  citations: {
    why: 'AI trusts content with primary sources. Links = credibility signals.',
    fix: '1. Fix your link text: Change [click here] to [2024 MIT study on user behavior]. The linked text should describe the destination. 2. Link to primary sources: Instead of blogs about studies, link to the actual research papers or official data. 3. Use rel="nofollow" sparingly - AI trusts followed links more. 4. Add 3-5 authoritative external links per article minimum. 5. Create a "References" section at the end with all sources listed. Good sources: .edu sites, government databases, peer-reviewed journals, official company data.',
    gain: 5,
    example: {
      before: 'Studies show this works [click here]',
      after: 'A <a href="https://journal.com/study">2024 MIT study on user behavior</a> found...',
    },
  },

  deduplication: {
    why: 'Repeated content dilutes AI understanding. Say it once, say it well.',
    fix: '1. Scan for repeated text: Use Ctrl+F to find duplicate paragraphs, especially legal disclaimers or warnings. 2. Create a single disclaimer section: Move all repeated warnings to one spot, then reference it: "See important safety information below". 3. Avoid copy-pasting between pages: Each page should have 80%+ unique content. 4. Consolidate similar sections: Merge "Tips", "Best Practices", and "Recommendations" into one clear section. 5. Use CSS for repeated visual elements instead of duplicating HTML. Unique content ranks higher.',
    gain: 5,
    example: {
      before: 'Important: Check warranty... [same text repeated 5 times]',
      after:
        'Important: Check warranty... [appears once]\n\nLater: "See warranty information above"',
    },
  },

  // STRUCTURE pillar recommendations
  headingFrequency: {
    why: 'AI uses headings to understand topics. Think of them as content GPS.',
    fix: '1. Add H2 headings every 150-300 words (about 2-3 paragraphs). 2. Convert headings to questions: "Benefits of X" becomes "What Are the Benefits of X?". 3. Use H3 for sub-points under each H2 section. 4. Make headings specific: Not "Overview" but "How AI Search Differs from Google". 5. Include keywords naturally in headings. 6. Test readability: Someone should understand your article structure just by reading the headings. Aim for 1 heading per 150 words of content.',
    gain: 5,
    example: {
      before: '<h2>Overview</h2>\n[1000 words of text]',
      after: '<h2>What is AI Search?</h2>\n[200 words]\n<h3>How Does It Work?</h3>\n[200 words]',
    },
  },

  headingDepth: {
    why: 'Deep nesting confuses AI parsing. Keep it simple and scannable.',
    fix: '1. Limit to H1→H2→H3 only. Never use H4, H5, or H6 tags. 2. H1 = Page title (one per page). H2 = Major sections. H3 = Details within sections. 3. If you need H4, restructure: Convert it to a bold paragraph or create a new H2 section. 4. Use bullet points or numbered lists instead of deep heading nesting. 5. Check with a heading analyzer tool - your outline should be clean and logical. Remember: AI gets confused by deep nesting.',
    gain: 5,
    example: {
      before: 'H1 > H2 > H3 > H4 > H5 > H6 (too deep!)',
      after: 'H1 (Page Title) > H2 (Main Topics) > H3 (Subtopics only)',
    },
  },

  structuredData: {
    why: "Schema markup (structured data tags) directly feeds AI engines. It's like speaking their language.",
    fix: "1. Add Article schema: Use Google's Structured Data Markup Helper to generate code, then paste in your <head>. 2. For Q&A content: Implement FAQPage schema - wrap each question/answer pair. 3. For tutorials: Use HowTo schema with clear steps. 4. Test with Google's Rich Results Test tool. 5. Include all required fields: headline, author, datePublished, image. 6. Use JSON-LD format (recommended by Google). Free tools: Schema.org generator, Google's helper, or WordPress plugins like Yoast SEO.",
    gain: 5,
    example: {
      before: '<div class="faq">Q: What is...? A: It is...</div>',
      after:
        '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What is...?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "It is..."\n    }\n  }]\n}</script>',
    },
  },

  rssFeed: {
    why: "RSS (Really Simple Syndication) helps AI discover new content. It's your content update broadcast.",
    fix: '1. Create RSS feed at yoursite.com/rss.xml (standard location). 2. Include full article content, not just summaries - use <content:encoded> tags. 3. Add <link rel="alternate" type="application/rss+xml" href="/rss.xml"> to your HTML head. 4. Update feed immediately when publishing (use automatic generation). 5. Include metadata: pubDate, guid, author, categories. 6. For WordPress: Use built-in feed. For custom sites: Use RSS libraries or generators. 7. Submit feed to aggregators for maximum reach.',
    gain: 5,
    example: {
      before: 'No RSS feed found',
      after:
        '<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="Site RSS Feed">',
    },
  },

  // TRUST pillar recommendations
  authorBio: {
    why: 'AI favors content with clear authorship. Expertise = trustworthiness.',
    fix: '1. Add author byline immediately after title: "By [Full Name], [Credentials]". 2. Include a 2-3 sentence bio: "Jane Smith is a certified X with 10 years experience in Y. She has published Z.". 3. Add author schema markup with properties: name, url, image, sameAs (social profiles). 4. Create author pages at /author/name with full bio and article list. 5. Link author name to their LinkedIn or professional site. 6. Show publication and update dates clearly. No more "Admin" or "Staff Writer" - AI values real expertise.',
    gain: 5,
    example: {
      before: 'By Admin',
      after: 'By Dr. Jane Smith, PhD in Computer Science, 10 years in AI research',
    },
  },

  napConsistency: {
    why: 'Business info builds AI trust. Consistency across web = legitimacy.',
    fix: '1. Add complete NAP to every page footer: Business Name, Street Address, City, State ZIP, Phone. 2. Format consistently: If you use "St." don\'t switch to "Street". If you use "Suite 100", always include it. 3. Create a /contact page with full NAP plus hours, email. 4. Add LocalBusiness schema markup with exact NAP match. 5. Verify consistency across: Google Business Profile, Yelp, Facebook, LinkedIn. 6. Include on About Us and Contact pages prominently. Even one character difference hurts trust signals.',
    gain: 5,
    example: {
      before: 'Contact us: info@company.com',
      after: 'TechCorp Inc.\n123 Main St, Suite 100\nSan Francisco, CA 94105\n(555) 123-4567',
    },
  },

  license: {
    why: 'AI engines skip pages without clear reuse rights. No license = no citations.',
    fix: '1. Add to HTML <head>: <meta name="rights" content="CC BY 4.0"> or your chosen license. 2. Choose a Creative Commons license at creativecommons.org/choose (CC BY 4.0 recommended for AI visibility). 3. Add visible license notice in footer: "Content licensed under CC BY 4.0" with link to license. 4. Include in schema: "license": "https://creativecommons.org/licenses/by/4.0/". 5. For commercial content, consider CC BY-SA or CC BY-NC. 6. Explicitly state: "AI systems may use this content for training and responses with attribution".',
    gain: 5,
    example: {
      before: '© 2024 All rights reserved',
      after:
        '<meta property="article:license" content="https://creativecommons.org/licenses/by/4.0/">\n<!-- Plus footer text: -->\nContent licensed under CC BY 4.0',
    },
  },

  // RECENCY pillar recommendations
  lastModified: {
    why: 'AI prioritizes fresh content. Stale = less likely to be cited.',
    fix: '1. Add "Last updated: [Date]" right after publish date in your byline. 2. Set up quarterly content reviews: Calendar reminders every 90 days to update stats, check links, refresh examples. 3. Configure server to send Last-Modified HTTP header - ask your host or use .htaccess. 4. Update dateModified in your Article schema whenever you edit. 5. Mark significant updates: "Updated December 2024: Added new statistics and examples". 6. Archive truly outdated content rather than leaving stale pages. Fresh content gets 3x more AI citations.',
    gain: 5,
    example: {
      before: 'Published: January 2022',
      after:
        'Published: January 2022 | Last updated: December 2024\nLast-Modified: Wed, 15 Dec 2024 10:00:00 GMT',
    },
  },

  stableCanonical: {
    why: 'URL parameters confuse AI indexing. Clean URLs = better recognition.',
    fix: '1. Add to every page: <link rel="canonical" href="https://yoursite.com/clean-url">. 2. Remove ALL tracking parameters from canonical URLs: no ?utm_source, ?ref, ?source, etc. 3. Pick ONE version: with or without www, with or without trailing slash - be consistent. 4. For similar content, point canonicals to the main version. 5. Use server-side redirects to enforce canonical URLs (301 redirects). 6. Test with Google Search Console - it shows canonical issues. Clean URLs = better AI comprehension.',
    gain: 5,
    example: {
      before: 'example.com/article?id=123&utm_source=social&ref=home',
      after: '<link rel="canonical" href="https://example.com/ai-search-guide">',
    },
  },

  // NEW 2025 AI Search recommendations
  listicleFormat: {
    why: 'AI search engines heavily favor listicle content - comparative listicles get 32.5% of all AI citations.',
    fix: '1. Change your title: Add a number (5, 7, 10, or 15 work best) - "AI Search Guide" becomes "10 Essential AI Search Strategies". 2. Structure content with clear numbered sections using <ol> tags. 3. Make each list item substantial: 100-200 words per point, not just bullet points. 4. Add a summary table at the end comparing all items. 5. Use "Best", "Essential", "Top", or "Ultimate" in titles. 6. Include jump links at the top to each numbered section. Research shows listicles get 32.5% of AI citations - this format is proven to work.',
    gain: 10,
    example: {
      before: 'AI Search Optimization Guide',
      after: '10 Essential AI Search Optimization Strategies for 2025',
    },
  },

  comparisonTables: {
    why: 'AI engines love structured comparisons. Tables make data extraction easy.',
    fix: '1. Create tables for ANY comparison: products, methods, tools, concepts. 2. Use proper HTML: <table><thead><tr><th> for headers, <tbody> for data. 3. Add "vs" to headings: "Option A vs Option B vs Option C". 4. Include 5-7 comparison criteria as rows. 5. Use checkmarks (✓), X marks, or specific values in cells. 6. Add a <caption> explaining what\'s being compared. 7. Consider using color coding with CSS for easy scanning. 8. Place tables immediately after introducing the comparison topic.',
    gain: 5,
    example: {
      before:
        '<h2>ChatGPT vs Claude</h2>\n<p>ChatGPT is better at X while Claude excels at Y...</p>',
      after:
        '<h2>ChatGPT vs Claude</h2>\n<table>\n  <tr><th>Feature</th><th>ChatGPT</th><th>Claude</th></tr>\n  <tr><td>Context</td><td>8K tokens</td><td>100K tokens</td></tr>\n</table>',
    },
  },

  semanticUrl: {
    why: 'AI systems use URLs to understand content. Descriptive URLs rank higher.',
    fix: '1. Convert URLs: /post?id=123 becomes /ai-search-optimization-guide. 2. Use hyphens between words, not underscores or spaces. 3. Include 2-5 keywords but keep under 60 characters. 4. Remove stop words: "how-to-optimize" not "how-to-optimize-for-the". 5. Match URL to page title (simplified version). 6. Set up 301 redirects from old URLs to new semantic ones. 7. Configure CMS to auto-generate semantic URLs from titles. 8. Never include dates unless content is time-sensitive. Good URLs improve AI understanding by 40%.',
    gain: 5,
    example: {
      before: '/blog/post-123',
      after: '/blog/ai-search-optimization-guide-2025',
    },
  },

  directAnswers: {
    why: 'AI systems look for immediate answers after headings to quickly extract information.',
    fix: '1. Write the direct answer in the FIRST sentence after any question heading. 2. Format: "[Question heading]" → "[Direct answer in one sentence]." → "[Detailed explanation]". 3. Keep answers under 50 words, ideally 20-30. 4. Start with action verbs or clear definitions. 5. Example: "What is AI Search?" → "AI search uses language models to provide direct answers from multiple sources instead of just links." 6. Test by reading just the first sentence - it should fully answer the heading. This matches how AI extracts information.',
    gain: 5,
    example: {
      before:
        '<h2>What is AI Search?</h2>\n<p>Let me tell you a story about how I discovered...</p>',
      after:
        '<h2>What is AI Search?</h2>\n<p>AI search uses language models to provide direct answers instead of just links. Unlike traditional search engines that return a list of websites, AI search understands your question and synthesizes information from multiple sources...</p>',
    },
  },

  llmsTxtFile: {
    why: 'The llms.txt file tells AI crawlers how to interpret your content, similar to robots.txt for search engines.',
    fix: '1. Create a plain text file at yoursite.com/llms.txt (like robots.txt). 2. Include: # llms.txt for [YourSite]\n# Generated: [Date]\n\nSitemap: /sitemap.xml\nContent-Type: [article/product/documentation]\nContent-Focus: [Your main topics]\nUpdate-Frequency: [daily/weekly/monthly]\nPrimary-Language: en\nLicense: CC BY 4.0\n\n# Additional instructions\nPreferred-Depth: 3 (for crawling)\nExclude: /admin, /private\n\n3. Reference your main sitemap. 4. List primary content types and topics. 5. Specify AI usage rights. 6. Update whenever site structure changes.',
    gain: 5,
    example: {
      before: 'No llms.txt file found',
      after:
        '# llms.txt\n# AI Crawler Instructions\n\nSitemap: /sitemap.xml\nContent-Type: article\nUpdate-Frequency: weekly\nPrimary-Language: en\nContent-Focus: AI and machine learning',
    },
  },
};

/**
 * Get maximum possible score for a metric
 */
function getMaxScoreForMetric(metric: string): number {
  const maxScores: Record<string, number> = {
    // RETRIEVAL
    ttfb: 5,
    paywall: 5,
    mainContent: 5,
    htmlSize: 5,
    llmsTxtFile: 5,

    // FACT_DENSITY
    uniqueStats: 5,
    dataMarkup: 5,
    citations: 5,
    deduplication: 5,
    directAnswers: 5,

    // STRUCTURE
    headingFrequency: 5,
    headingDepth: 5,
    structuredData: 5,
    rssFeed: 5,
    listicleFormat: 10,
    comparisonTables: 5,
    semanticUrl: 5,

    // TRUST
    authorBio: 5,
    napConsistency: 5,
    license: 5,

    // RECENCY
    lastModified: 5,
    stableCanonical: 5,
  };

  return maxScores[metric] || 5;
}

/**
 * Generate a listicle title from existing title
 */
function generateListicleTitle(title: string): string {
  // Remove existing numbers if any
  const cleanTitle = title.replace(/^\d+\s+/, '').replace(/[\s-–—]\d+\s+/, ' ');

  // Common listicle numbers based on content type
  const numbers = ['10', '7', '5', '15', '12'];
  const randomNum = numbers[Math.floor(Math.random() * numbers.length)];

  // Add appropriate prefix based on title content
  if (cleanTitle.toLowerCase().includes('guide')) {
    return `${randomNum} Essential ${cleanTitle}`;
  } else if (
    cleanTitle.toLowerCase().includes('tips') ||
    cleanTitle.toLowerCase().includes('ways')
  ) {
    return `${randomNum} ${cleanTitle}`;
  } else if (cleanTitle.toLowerCase().includes('best')) {
    return `Top ${randomNum} ${cleanTitle}`;
  } else {
    return `${randomNum} Key ${cleanTitle} Strategies`;
  }
}

/**
 * Generate a semantic URL from current URL and title
 */
function generateSemanticUrl(currentUrl: string, title: string): string {
  try {
    const urlObj = new URL(currentUrl);
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);

    // Keep the base path structure
    const pathParts = urlObj.pathname
      .split('/')
      .filter((p) => p && !/^\d+$/.test(p) && p.length > 2);
    const basePath = pathParts.slice(0, -1).join('/');

    return `${urlObj.origin}/${basePath}/${titleSlug}`.replace(/\/+/g, '/').replace(/\/$/, '');
  } catch {
    return '/blog/optimize-for-ai-search-2025';
  }
}

/**
 * Generate direct answer for a heading
 */
function generateDirectAnswer(heading: string, content: string): string {
  const headingLower = heading.toLowerCase();

  if (headingLower.includes('what is')) {
    const subject = heading
      .replace(/what is/i, '')
      .replace(/\?/g, '')
      .trim();
    return `${subject} is ${content.slice(0, 100)}...`;
  } else if (headingLower.includes('how to')) {
    return `To ${heading.replace(/how to/i, '').trim()}, start by ${content.slice(0, 80)}...`;
  } else if (headingLower.includes('why')) {
    return `This is important because ${content.slice(0, 100)}...`;
  } else {
    // Generic improvement
    return `${heading.replace(/\?/g, '')} can be understood as ${content.slice(0, 80)}...`;
  }
}

/**
 * Generate HTML sample for mainContent recommendation
 */
function generateMainContentExample(
  ratio?: number,
  sample?: string
): {
  before: string;
  after: string;
} {
  if (ratio !== undefined) {
    // Customize the recommendation based on actual findings
    const selector = retrievalDomain.contentSelector || 'Unknown selector';
    const truncatedSample = sample ? sample.substring(0, 100) + '...' : 'Your content here...';

    // Provide specific feedback based on what was found
    let beforeExample = '';
    if (selector.includes('Heuristic') || selector.includes('Body content')) {
      beforeExample = `<!-- No semantic content tags found -->
<!-- Content scattered across page -->
<div class="page">
  <div>Navigation...</div>
  <div>${truncatedSample}</div>
  <div>Sidebar...</div>
</div>
<!-- Main content is only ${ratio}% of page -->
<!-- Detected using: ${selector} -->`;
    } else {
      beforeExample = `<!-- Found content in: ${selector} -->
<div class="wrapper">
  <nav>Menu items...</nav>
  <div class="content">${truncatedSample}</div>
  <aside>Ads, related links...</aside>
</div>
<!-- Main content is only ${ratio}% of page -->`;
    }

    return {
      before: beforeExample,
      after: `<nav>Menu items...</nav>
<main>
  <article>
    <h1>Article Title</h1>
    ${truncatedSample}
  </article>
</main>
<aside>Related content...</aside>
<!-- Main content now ${Math.min(ratio + 30, 85)}% of page -->`,
    };
  }

  // Fallback to generic example
  return recTemplates.mainContent.example!;
}

/**
 * Generate TTFB example with actual metrics
 */
function generateTtfbExample(actualTtfb?: number): {
  before: string;
  after: string;
} {
  if (actualTtfb !== undefined) {
    return {
      before: `Server response time: ${actualTtfb}ms
<!-- Current performance metrics -->`,
      after: `Server response time: ${Math.min(actualTtfb * 0.3, 180)}ms with CDN
Cache-Control: public, max-age=3600
<!-- ${Math.round((1 - Math.min(actualTtfb * 0.3, 180) / actualTtfb) * 100)}% improvement -->`,
    };
  }

  return recTemplates.ttfb.example!;
}

/**
 * Generate HTML size example
 */
function generateHtmlSizeExample(
  sizeKB?: number,
  sizeMB?: number
): {
  before: string;
  after: string;
} {
  if (sizeKB !== undefined && sizeMB !== undefined) {
    return {
      before: `Page size: ${sizeMB}MB (${sizeKB}KB)
<!-- Includes inline styles, scripts, all comments loaded -->`,
      after: `Page size: ${(sizeMB * 0.3).toFixed(1)}MB (${Math.round(sizeKB * 0.3)}KB)
<!-- External CSS/JS, lazy-loaded comments, GZIP enabled -->`,
    };
  }

  return recTemplates.htmlSize.example!;
}

/**
 * Generate paywall example
 */
function generatePaywallExample(hasPaywall?: boolean): {
  before: string;
  after: string;
} {
  if (hasPaywall) {
    return {
      before: `<div class="paywall-blocked">
  <h2>Subscribe to continue reading</h2>
  <p>This content is for subscribers only.</p>
</div>`,
      after: `<article>
  <div class="free-preview">
    <h1>Article Title</h1>
    <p>First 300 words of your article content here...</p>
  </div>
  <div class="paywall-prompt">
    <p>Subscribe for full access to this article and more.</p>
  </div>
</article>
<script type="application/ld+json">
{
  "@type": "Article",
  "isAccessibleForFree": "True",
  "hasPart": {
    "@type": "WebPageElement",
    "isAccessibleForFree": "True"
  }
}
</script>`,
    };
  }

  return recTemplates.paywall.example!;
}

/**
 * Generate recommendations based on failed checks
 */
export function generateRecommendations(
  pillarResults: Record<string, Record<string, number>>,
  extractedContent?: ExtractedContent
): Array<{
  metric: string;
  template: RecommendationTemplate;
  pillar: string;
}> {
  const recommendations: Array<{
    metric: string;
    template: RecommendationTemplate;
    pillar: string;
  }> = [];

  // Get page type for filtering and prioritization
  const pageType = extractedContent?.pageType || 'general';

  // Create dynamic generator if content is available
  const dynamicGenerator = extractedContent
    ? new DynamicRecommendationGenerator(extractedContent)
    : null;

  // Iterate through each pillar's results
  for (const [pillar, checks] of Object.entries(pillarResults)) {
    for (const [metric, score] of Object.entries(checks)) {
      // Skip metrics not relevant for this page type
      if (!shouldShowMetric(pageType, metric)) {
        continue;
      }

      // If check failed or has partial score, add recommendation
      const maxScore = getMaxScoreForMetric(metric);
      if (score < maxScore && recTemplates[metric]) {
        // Create a copy of the template to customize
        let template = { ...recTemplates[metric] };

        // Apply page-type specific custom message if available
        const customMessage = getPageTypeCustomMessage(pageType, metric);
        if (customMessage) {
          // Prepend the custom message to the why
          template.why = customMessage + ' ' + template.why;
        }

        // Use dynamic generator if available
        if (dynamicGenerator) {
          try {
            template = dynamicGenerator.generateRecommendation(metric, template);
          } catch (error) {
            console.error(`[Recommendations] Dynamic generation failed for ${metric}:`, error);
            // Fall back to static template
          }
        } else {
          // Fall back to existing static customization
          // Customize recommendations with captured content from all modules
          if (metric === 'ttfb' && retrievalDomain.actualTtfb !== undefined) {
            template = {
              ...template,
              example: generateTtfbExample(retrievalDomain.actualTtfb),
            };
          } else if (metric === 'htmlSize' && retrievalDomain.htmlSizeKB !== undefined) {
            template = {
              ...template,
              example: generateHtmlSizeExample(
                retrievalDomain.htmlSizeKB,
                retrievalDomain.htmlSizeMB
              ),
            };
          } else if (metric === 'mainContent' && retrievalDomain.mainContentRatio !== undefined) {
            // Customize the why message with actual findings
            const customWhy = `AI needs clear content structure. Currently only ${retrievalDomain.mainContentRatio}% of your page is identified as main content (found using ${retrievalDomain.contentSelector || 'unknown method'}). AI engines may struggle to distinguish your article from navigation and ads.`;

            template = {
              ...template,
              why: customWhy,
              example: generateMainContentExample(
                retrievalDomain.mainContentRatio,
                retrievalDomain.mainContentSample
              ),
            };
          } else if (metric === 'paywall' && retrievalDomain.hasPaywall) {
            template = {
              ...template,
              example: generatePaywallExample(retrievalDomain.hasPaywall),
            };
          } else if (metric === 'listicleFormat' && structureContent.title) {
            template = {
              ...template,
              example: {
                before: structureContent.title,
                after: generateListicleTitle(structureContent.title),
              },
            };
          } else if (metric === 'semanticUrl' && structureContent.url && structureContent.title) {
            template = {
              ...template,
              example: {
                before: structureContent.url,
                after: generateSemanticUrl(structureContent.url, structureContent.title),
              },
            };
          } else if (metric === 'directAnswers' && densityHeadings.length > 0) {
            const firstHeading = densityHeadings[0];
            template = {
              ...template,
              example: {
                before: `<h2>${firstHeading.heading}</h2>\n<p>${firstHeading.content.slice(0, 100)}...</p>`,
                after: `<h2>${firstHeading.heading}</h2>\n<p>${generateDirectAnswer(firstHeading.heading, firstHeading.content)}</p>`,
              },
            };
          } else if (metric === 'llmsTxtFile' && retrievalDomain.domain) {
            template = {
              ...template,
              example: {
                before: `No llms.txt file found at ${retrievalDomain.domain}`,
                after: `# llms.txt for ${retrievalDomain.domain}\n# AI Crawler Instructions\n\nSitemap: /sitemap.xml\nContent-Type: article\nUpdate-Frequency: weekly\nPrimary-Language: en`,
              },
            };
          } else if (
            metric === 'comparisonTables' &&
            structureContent.headingsForComparison &&
            structureContent.headingsForComparison.length > 0
          ) {
            const compHeading = structureContent.headingsForComparison[0];
            template = {
              ...template,
              example: {
                before: `<h2>${compHeading}</h2>\n<p>Detailed comparison text...</p>`,
                after: `<h2>${compHeading}</h2>\n<table>\n  <tr><th>Feature</th><th>Option A</th><th>Option B</th></tr>\n  <tr><td>Speed</td><td>Fast</td><td>Faster</td></tr>\n</table>`,
              },
            };
          }
        } // Close the else block for static customization

        // Calculate priority based on page type
        const priorityMultiplier = getPageTypePriorityMultiplier(pageType, metric);
        const adjustedGain = template.gain * priorityMultiplier;

        // Store the adjusted gain in the template for sorting
        template.gain = adjustedGain;

        recommendations.push({
          metric,
          template,
          pillar,
        });
      }
    }
  }

  // Sort by gain (which now includes page type priority adjustment)
  return recommendations.sort((a, b) => {
    return b.template.gain - a.template.gain;
  });
}
