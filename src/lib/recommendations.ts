import type { RecommendationTemplate } from './types';

/**
 * Recommendation templates for AI Search optimization
 * Each template includes why it matters, how to fix it, and points gained
 */
export const recTemplates: Record<string, RecommendationTemplate> = {
  // RETRIEVAL pillar recommendations
  ttfb: {
    why: 'AI engines skip slow pages.',
    fix: 'Optimize server response time with CDN or caching.',
    gain: 10,
  },
  paywall: {
    why: 'AI engines can\'t index paywalled content.',
    fix: 'Remove paywall or provide free preview sections.',
    gain: 5,
  },
  mainContent: {
    why: 'AI needs clear content structure.',
    fix: 'Wrap main content in <main> tag, aim for 70%+ ratio.',
    gain: 5,
  },
  htmlSize: {
    why: 'Large pages timeout for AI crawlers.',
    fix: 'Reduce HTML size below 2MB by optimizing content.',
    gain: 10,
  },

  // FACT_DENSITY pillar recommendations
  uniqueStats: {
    why: 'AI values data-rich content.',
    fix: 'Add specific stats, dates, and names throughout content.',
    gain: 10,
  },
  dataMarkup: {
    why: 'Tables and lists help AI extract facts.',
    fix: 'Structure data using <table>, <ul>, or <dl> tags.',
    gain: 5,
  },
  citations: {
    why: 'AI trusts content with primary sources.',
    fix: 'Add 2+ outbound links to authoritative sources.',
    gain: 5,
  },
  deduplication: {
    why: 'Repeated content dilutes AI understanding.',
    fix: 'Remove duplicate paragraphs, keep content under 10% repetition.',
    gain: 5,
  },

  // STRUCTURE pillar recommendations
  headingFrequency: {
    why: 'AI uses headings to understand topics.',
    fix: 'Add headings every 300 words or less.',
    gain: 5,
  },
  headingDepth: {
    why: 'Deep nesting confuses AI parsing.',
    fix: 'Limit heading hierarchy to 3 levels (H1-H3).',
    gain: 5,
  },
  structuredData: {
    why: 'Schema markup directly feeds AI engines.',
    fix: 'Add FAQPage, HowTo, or Dataset JSON-LD markup.',
    gain: 5,
  },
  rssFeed: {
    why: 'RSS helps AI discover new content.',
    fix: 'Create RSS/Atom feed at /feed or /rss.',
    gain: 5,
  },

  // TRUST pillar recommendations
  authorBio: {
    why: 'AI favors content with clear authorship.',
    fix: 'Add visible author bio with credentials.',
    gain: 5,
  },
  napConsistency: {
    why: 'Business info builds AI trust.',
    fix: 'Display consistent name, address, phone in footer.',
    gain: 5,
  },
  license: {
    why: 'AI engines skip pages without clear reuse rights.',
    fix: 'Add <meta property="og:license" content="CC-BY-4.0"> in <head>.',
    gain: 5,
  },

  // RECENCY pillar recommendations
  lastModified: {
    why: 'AI prioritizes fresh content.',
    fix: 'Update content quarterly, show modification date.',
    gain: 5,
  },
  stableCanonical: {
    why: 'URL parameters confuse AI indexing.',
    fix: 'Use clean canonical URLs without query strings.',
    gain: 5,
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