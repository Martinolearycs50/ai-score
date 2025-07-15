import type { RecommendationTemplate } from './types';

/**
 * Recommendation templates for AI Search optimization
 * Each template includes why it matters, how to fix it, and points gained
 */
export const recTemplates: Record<string, RecommendationTemplate> = {
  // RETRIEVAL pillar recommendations
  ttfb: {
    why: 'AI engines skip slow pages. Fast TTFB (Time To First Byte - server response time) under 200ms gets indexed more frequently.',
    fix: 'Speed up server response time. Use a CDN (Content Delivery Network) like Cloudflare. Add browser caching. Consider static site generation.',
    gain: 10,
    example: {
      before: 'Server response time: 850ms',
      after: 'Server response time: 180ms with CDN\nCache-Control: public, max-age=3600',
    },
  },
  paywall: {
    why: 'AI engines can\'t index paywalled content. Your knowledge becomes invisible to AI search.',
    fix: 'Make some content accessible to AI crawlers. Offer free previews of at least 300 words. Create summary pages for premium content. Consider metered access.',
    gain: 5,
    example: {
      before: '<div class="paywall-blocked">Subscribe to read more...</div>',
      after: '<article>\n  <div class="free-preview">First 300 words visible...</div>\n  <div class="paywall">Subscribe for full article</div>\n</article>',
    },
  },
  mainContent: {
    why: 'AI needs clear content structure. Helps distinguish article from ads/navigation.',
    fix: 'Structure your page with semantic HTML. Wrap main content in a <main> tag. Move sidebars and ads outside this area. Ensure article text is 70%+ of total page text.',
    gain: 5,
    example: {
      before: '<div class="content">Article here...</div>',
      after: '<main>\n  <article>\n    <h1>Article Title</h1>\n    <p>Content here...</p>\n  </article>\n</main>',
    },
  },
  htmlSize: {
    why: 'Large pages timeout for AI crawlers. They give up after 2MB of HTML.',
    fix: 'Shrink your HTML size below 2MB. Remove inline styles and scripts. Use lazy-loading (load content when needed) for comments. Move CSS and JavaScript to external files.',
    gain: 10,
    example: {
      before: 'Page size: 3.5MB (with 500 comments loaded)',
      after: 'Page size: 850KB (comments load on demand)',
    },
  },

  // FACT_DENSITY pillar recommendations
  uniqueStats: {
    why: 'AI values data-rich content. Specific facts make you the primary source.',
    fix: 'Pack your content with concrete data. Replace vague claims with specific numbers. Include percentages, dates, and statistics. Always cite your data sources.',
    gain: 10,
    example: {
      before: 'Many users prefer our product',
      after: '73% of 1,200 surveyed users prefer our product (2024 Customer Survey)',
    },
  },
  dataMarkup: {
    why: 'Tables and lists help AI extract facts. Structured data = better AI comprehension.',
    fix: 'Structure your data for easy scanning. Convert text comparisons into tables. Turn feature lists into bullet points. Use definition lists for glossaries.',
    gain: 5,
    example: {
      before: 'Product A costs $99 and has 5GB storage. Product B costs $199 with 50GB.',
      after: '<table>\n  <tr><th>Product</th><th>Price</th><th>Storage</th></tr>\n  <tr><td>A</td><td>$99</td><td>5GB</td></tr>\n  <tr><td>B</td><td>$199</td><td>50GB</td></tr>\n</table>',
    },
  },
  citations: {
    why: 'AI trusts content with primary sources. Links = credibility signals.',
    fix: 'Add links to credible sources. Use descriptive anchor text (the clickable words) instead of "click here". Link to research papers, official statistics, or expert sources.',
    gain: 5,
    example: {
      before: 'Studies show this works [click here]',
      after: 'A <a href="https://journal.com/study">2024 MIT study on user behavior</a> found...',
    },
  },
  deduplication: {
    why: 'Repeated content dilutes AI understanding. Say it once, say it well.',
    fix: 'Eliminate duplicate content from your pages. Consolidate repeated warnings or disclaimers. Use "see above" references instead of copy-pasting. Keep each point unique.',
    gain: 5,
    example: {
      before: 'Important: Check warranty... [same text repeated 5 times]',
      after: 'Important: Check warranty... [appears once]\n\nLater: "See warranty information above"',
    },
  },

  // STRUCTURE pillar recommendations
  headingFrequency: {
    why: 'AI uses headings to understand topics. Think of them as content GPS.',
    fix: 'Add more headings to break up content. Insert H2 (section headings) every 2-3 paragraphs. Use H3 (subsection headings) for details. Make headings descriptive questions when possible.',
    gain: 5,
    example: {
      before: '<h2>Overview</h2>\n[1000 words of text]',
      after: '<h2>What is AI Search?</h2>\n[200 words]\n<h3>How Does It Work?</h3>\n[200 words]',
    },
  },
  headingDepth: {
    why: 'Deep nesting confuses AI parsing. Keep it simple and scannable.',
    fix: 'Flatten your heading structure to 3 levels maximum. Use H1 (main title), H2 (major sections), and H3 (subsections) only. Restructure content that needs deeper levels.',
    gain: 5,
    example: {
      before: 'H1 > H2 > H3 > H4 > H5 > H6 (too deep!)',
      after: 'H1 (Page Title) > H2 (Main Topics) > H3 (Subtopics only)',
    },
  },
  structuredData: {
    why: 'Schema markup (structured data tags) directly feeds AI engines. It\'s like speaking their language.',
    fix: 'Add structured data to your pages. Use FAQ schema for Q&A sections. Apply HowTo schema for tutorials. Include Article schema for blog posts.',
    gain: 5,
    example: {
      before: '<div class="faq">Q: What is...? A: It is...</div>',
      after: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What is...?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "It is..."\n    }\n  }]\n}</script>',
    },
  },
  rssFeed: {
    why: 'RSS (Really Simple Syndication) helps AI discover new content. It\'s your content update broadcast.',
    fix: 'Create an RSS feed for your site. Place it at /rss.xml. Include full article text in the feed. Update it within an hour of publishing new content.',
    gain: 5,
    example: {
      before: 'No RSS feed found',
      after: '<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="Site RSS Feed">',
    },
  },

  // TRUST pillar recommendations
  authorBio: {
    why: 'AI favors content with clear authorship. Expertise = trustworthiness.',
    fix: 'Show who wrote your content. Add the author\'s name and credentials. Include a brief bio highlighting relevant expertise. Link to their professional profile.',
    gain: 5,
    example: {
      before: 'By Admin',
      after: 'By Dr. Jane Smith, PhD in Computer Science, 10 years in AI research',
    },
  },
  napConsistency: {
    why: 'Business info builds AI trust. Consistency across web = legitimacy.',
    fix: 'Display your business name, address, and phone (NAP) consistently. Add this information to your website footer. Match it exactly with your Google Business profile and other listings.',
    gain: 5,
    example: {
      before: 'Contact us: info@company.com',
      after: 'TechCorp Inc.\n123 Main St, Suite 100\nSan Francisco, CA 94105\n(555) 123-4567',
    },
  },
  license: {
    why: 'AI engines skip pages without clear reuse rights. No license = no citations.',
    fix: 'Specify content reuse rights clearly. Add a license meta tag (HTML metadata) to your page head. Use Creative Commons licensing. Also display the license in your footer.',
    gain: 5,
    example: {
      before: '© 2024 All rights reserved',
      after: '<meta property="article:license" content="https://creativecommons.org/licenses/by/4.0/">\n<!-- Plus footer text: -->\nContent licensed under CC BY 4.0',
    },
  },

  // RECENCY pillar recommendations
  lastModified: {
    why: 'AI prioritizes fresh content. Stale = less likely to be cited.',
    fix: 'Keep content current. Update articles every 90 days. Display "Last updated" date prominently. Add Last-Modified HTTP header (server response information) to your pages.',
    gain: 5,
    example: {
      before: 'Published: January 2022',
      after: 'Published: January 2022 | Last updated: December 2024\nLast-Modified: Wed, 15 Dec 2024 10:00:00 GMT',
    },
  },
  stableCanonical: {
    why: 'URL parameters confuse AI indexing. Clean URLs = better recognition.',
    fix: 'Set a canonical (preferred version) URL for each page. Remove tracking parameters like utm_source. Add the canonical tag to your HTML head section.',
    gain: 5,
    example: {
      before: 'example.com/article?id=123&utm_source=social&ref=home',
      after: '<link rel="canonical" href="https://example.com/ai-search-guide">',
    },
  },
};

/**
 * Generate recommendations based on failed checks
 */
export function generateRecommendations(
  pillarResults: Record<string, Record<string, number>>
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

  // Iterate through each pillar's results
  for (const [pillar, checks] of Object.entries(pillarResults)) {
    for (const [metric, score] of Object.entries(checks)) {
      // If check failed (score is 0), add recommendation
      if (score === 0 && recTemplates[metric]) {
        recommendations.push({
          metric,
          template: recTemplates[metric],
          pillar,
        });
      }
    }
  }

  // Sort by potential gain (highest first)
  return recommendations.sort((a, b) => b.template.gain - a.template.gain);
}