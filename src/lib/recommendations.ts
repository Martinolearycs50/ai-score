import type { RecommendationTemplate } from './types';

/**
 * Recommendation templates for AI Search optimization
 * Each template includes why it matters, how to fix it, and points gained
 */
export const recTemplates: Record<string, RecommendationTemplate> = {
  // RETRIEVAL pillar recommendations
  ttfb: {
    why: 'AI engines skip slow pages. Fast pages (under 0.2 seconds) get indexed more frequently.',
    fix: 'Use a CDN like Cloudflare (free tier available). Add caching headers: Cache-Control: public, max-age=3600. Consider static site generation for content pages.',
    gain: 10,
    example: {
      before: 'Server response time: 850ms',
      after: 'Server response time: 180ms with CDN',
    },
  },
  paywall: {
    why: 'AI engines can\'t index paywalled content. Your knowledge becomes invisible to AI search.',
    fix: 'Offer a free preview (first 3 paragraphs) or create a separate summary page. Many sites use metered paywalls (5 free articles/month).',
    gain: 5,
    example: {
      before: '<div class="paywall-blocked">Subscribe to read more...</div>',
      after: '<article>\n  <div class="free-preview">First 300 words visible...</div>\n  <div class="paywall">Subscribe for full article</div>\n</article>',
    },
  },
  mainContent: {
    why: 'AI needs clear content structure. Helps distinguish article from ads/navigation.',
    fix: 'Wrap your main article in <main> tag. Move sidebars and ads outside. Content should be 70%+ of total text.',
    gain: 5,
    example: {
      before: '<div class="content">Article here...</div>',
      after: '<main>\n  <article>\n    <h1>Article Title</h1>\n    <p>Content here...</p>\n  </article>\n</main>',
    },
  },
  htmlSize: {
    why: 'Large pages timeout for AI crawlers. They give up after 2MB of HTML.',
    fix: 'Remove inline styles/scripts. Lazy-load comments. Paginate long articles. Use external CSS/JS files.',
    gain: 10,
    example: {
      before: 'Page size: 3.5MB (with 500 comments loaded)',
      after: 'Page size: 850KB (comments load on demand)',
    },
  },

  // FACT_DENSITY pillar recommendations
  uniqueStats: {
    why: 'AI values data-rich content. Specific facts make you the primary source.',
    fix: 'Replace vague claims with specific data. Add percentages, dates, names, and numbers. Cite sources.',
    gain: 10,
    example: {
      before: 'Many users prefer our product',
      after: '73% of 1,200 surveyed users prefer our product (2024 Customer Survey)',
    },
  },
  dataMarkup: {
    why: 'Tables and lists help AI extract facts. Structured data = better AI comprehension.',
    fix: 'Convert paragraph comparisons to tables. Use bullet lists for features. Add definition lists for terms.',
    gain: 5,
    example: {
      before: 'Product A costs $99 and has 5GB storage. Product B costs $199 with 50GB.',
      after: '<table>\n  <tr><th>Product</th><th>Price</th><th>Storage</th></tr>\n  <tr><td>A</td><td>$99</td><td>5GB</td></tr>\n  <tr><td>B</td><td>$199</td><td>50GB</td></tr>\n</table>',
    },
  },
  citations: {
    why: 'AI trusts content with primary sources. Links = credibility signals.',
    fix: 'Link to research papers, official stats, or expert sources. Use descriptive anchor text, not "click here".',
    gain: 5,
    example: {
      before: 'Studies show this works [click here]',
      after: 'A <a href="https://journal.com/study">2024 MIT study on user behavior</a> found...',
    },
  },
  deduplication: {
    why: 'Repeated content dilutes AI understanding. Say it once, say it well.',
    fix: 'Remove copy-pasted sections. Consolidate repeated information. Use cross-references instead of duplicating.',
    gain: 5,
    example: {
      before: 'Same warning paragraph appears 5 times in article',
      after: 'Warning appears once prominently, with "See safety note above" references',
    },
  },

  // STRUCTURE pillar recommendations
  headingFrequency: {
    why: 'AI uses headings to understand topics. Think of them as content GPS.',
    fix: 'Break up long sections. Add descriptive H2/H3 headings every 2-3 paragraphs. Use question-style headings.',
    gain: 5,
    example: {
      before: '<h2>Overview</h2>\n[1000 words of text]',
      after: '<h2>What is AI Search?</h2>\n[200 words]\n<h3>How Does It Work?</h3>\n[200 words]',
    },
  },
  headingDepth: {
    why: 'Deep nesting confuses AI parsing. Keep it simple and scannable.',
    fix: 'Use H1 for title, H2 for main sections, H3 for subsections. Avoid H4-H6. Restructure if needed.',
    gain: 5,
    example: {
      before: 'H1 > H2 > H3 > H4 > H5 > H6 (too deep!)',
      after: 'H1 (Title) > H2 (Main Topics) > H3 (Subtopics only)',
    },
  },
  structuredData: {
    why: 'Schema markup directly feeds AI engines. It\'s like speaking their language.',
    fix: 'Add FAQ schema for Q&A content. Use HowTo schema for tutorials. Include Article schema for blogs.',
    gain: 5,
    example: {
      before: '<div class="faq">Q: What is...? A: It is...</div>',
      after: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "What is...?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "It is..."\n    }\n  }]\n}</script>',
    },
  },
  rssFeed: {
    why: 'RSS helps AI discover new content. It\'s your content update broadcast.',
    fix: 'Create RSS feed at /rss.xml. Include full article text, not just summaries. Update within 1 hour of publishing.',
    gain: 5,
    example: {
      before: 'No RSS feed found',
      after: '<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="Site RSS Feed">',
    },
  },

  // TRUST pillar recommendations
  authorBio: {
    why: 'AI favors content with clear authorship. Expertise = trustworthiness.',
    fix: 'Add author name, credentials, and brief bio at article top or bottom. Link to author page or LinkedIn.',
    gain: 5,
    example: {
      before: 'By Admin',
      after: 'By Dr. Jane Smith, PhD in Computer Science, 10 years in AI research',
    },
  },
  napConsistency: {
    why: 'Business info builds AI trust. Consistency across web = legitimacy.',
    fix: 'Add company name, address, and phone (NAP) to footer. Match exactly with Google Business listing.',
    gain: 5,
    example: {
      before: 'Contact us: info@company.com',
      after: 'TechCorp Inc.\n123 Main St, Suite 100\nSan Francisco, CA 94105\n(555) 123-4567',
    },
  },
  license: {
    why: 'AI engines skip pages without clear reuse rights. No license = no citations.',
    fix: 'Add license meta tag in HTML head. Use Creative Commons for maximum AI visibility. Display license in footer too.',
    gain: 5,
    example: {
      before: '© 2024 All rights reserved',
      after: '<meta property="article:license" content="https://creativecommons.org/licenses/by/4.0/">\n<!-- Plus footer text: -->\nContent licensed under CC BY 4.0',
    },
  },

  // RECENCY pillar recommendations
  lastModified: {
    why: 'AI prioritizes fresh content. Stale = less likely to be cited.',
    fix: 'Update content every 90 days. Display "Last updated: [date]" prominently. Add Last-Modified HTTP header.',
    gain: 5,
    example: {
      before: 'Published: January 2022',
      after: 'Published: January 2022 | Last updated: December 2024',
    },
  },
  stableCanonical: {
    why: 'URL parameters confuse AI indexing. Clean URLs = better recognition.',
    fix: 'Set canonical URL without tracking parameters. Use rel="canonical" tag. Keep URLs short and descriptive.',
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