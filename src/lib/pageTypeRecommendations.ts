import type { PageType } from './types';

/**
 * Page-type specific recommendation priorities and customizations
 */
export const pageTypeRecommendations: Record<PageType, {
  priority: string[];
  customMessages: Record<string, string>;
  skipMetrics?: string[];
}> = {
  homepage: {
    priority: [
      'structuredData', // Organization schema is critical
      'mainContent',    // Clear value proposition
      'uniqueStats',    // Company metrics
      'ttfb',          // First impressions matter
      'authorBio',     // About the company
    ],
    customMessages: {
      structuredData: 'Organization schema is essential for homepages to establish your brand identity in AI search.',
      uniqueStats: 'Homepages need trust signals like customer counts, years in business, or success metrics.',
      mainContent: 'Your homepage must clearly state what you do within the first 100 words.',
      authorBio: 'Include a brief "About Us" section to establish credibility.',
    },
  },
  
  article: {
    priority: [
      'lastModified',   // Freshness is key
      'authorBio',      // Author credibility
      'uniqueStats',    // Data and citations
      'directAnswers',  // Quick insights
      'structuredData', // Article schema
    ],
    customMessages: {
      lastModified: 'AI prioritizes recent content. Always show publish and update dates on articles.',
      authorBio: 'Articles need clear author attribution with credentials for AI to trust the content.',
      uniqueStats: 'Back up claims with data. AI favors articles with specific statistics and sources.',
      directAnswers: 'Start articles with a brief answer to the main question, then elaborate.',
    },
  },
  
  blog: {
    priority: [
      'lastModified',   // Freshness is key
      'authorBio',      // Author credibility
      'uniqueStats',    // Data and citations
      'directAnswers',  // Quick insights
      'structuredData', // Article/BlogPosting schema
    ],
    customMessages: {
      lastModified: 'AI prioritizes recent content. Always show publish and update dates on blog posts.',
      authorBio: 'Blog posts need clear author attribution with credentials for AI to trust the content.',
      uniqueStats: 'Back up claims with data. AI favors posts with specific statistics and sources.',
      directAnswers: 'Start posts with a brief answer or summary, then elaborate.',
      structuredData: 'Use BlogPosting schema to help AI understand your content structure.',
    },
  },
  
  product: {
    priority: [
      'structuredData', // Product schema
      'uniqueStats',    // Specifications
      'comparisonTables', // VS competitors
      'dataMarkup',     // Features lists
      'mainContent',    // Product description
    ],
    customMessages: {
      structuredData: 'Product schema with price, availability, and reviews is crucial for AI shopping queries.',
      uniqueStats: 'Include all specifications: dimensions, weight, materials, compatibility, etc.',
      comparisonTables: 'Add comparison tables showing how your product differs from alternatives.',
      dataMarkup: 'Use structured lists for features, benefits, and technical specifications.',
    },
  },
  
  category: {
    priority: [
      'mainContent',    // Product grid clarity
      'structuredData', // BreadcrumbList schema
      'semanticUrl',    // Clear URL structure
      'htmlSize',       // Fast loading lists
      'listicleFormat', // Organized listings
    ],
    customMessages: {
      mainContent: 'Ensure product grids and filters are within <main> tags for clear content hierarchy.',
      structuredData: 'Use BreadcrumbList schema to help AI understand your site structure.',
      semanticUrl: 'Category URLs should be descriptive: /electronics/laptops not /cat/123.',
      htmlSize: 'Paginate or lazy-load products to keep page size manageable for AI crawlers.',
    },
  },
  
  documentation: {
    priority: [
      'directAnswers',  // Quick solutions
      'structuredData', // HowTo schema
      'headingDepth',   // Clear hierarchy
      'semanticUrl',    // Versioned URLs
      'llmsTxtFile',    // AI instructions
    ],
    customMessages: {
      directAnswers: 'Each doc section should start with what it does in one sentence.',
      structuredData: 'Use HowTo or TechArticle schema for step-by-step instructions.',
      headingDepth: 'Use proper heading hierarchy (h1 > h2 > h3) for navigable docs.',
      semanticUrl: 'Include version numbers in URLs: /docs/v2/api/authentication.',
      llmsTxtFile: 'Especially important for docs - tell AI how to navigate your documentation.',
    },
  },
  
  about: {
    priority: [
      'authorBio',      // Team information
      'uniqueStats',    // Company achievements
      'structuredData', // Organization schema
      'napConsistency', // Contact details
      'mainContent',    // Company story
    ],
    customMessages: {
      authorBio: 'Showcase your team with names, roles, and expertise to build trust.',
      uniqueStats: 'Include founding year, team size, clients served, and key achievements.',
      napConsistency: 'Ensure Name, Address, Phone (NAP) data matches across all mentions.',
      mainContent: 'Tell your story concisely - what problem you solve and why you exist.',
    },
  },
  
  contact: {
    priority: [
      'napConsistency', // Consistent contact info
      'structuredData', // ContactPoint schema
      'mainContent',    // Clear contact options
      'semanticUrl',    // Easy-to-find URL
      'ttfb',          // Quick loading
    ],
    customMessages: {
      napConsistency: 'Contact information must be identical everywhere it appears.',
      structuredData: 'Use ContactPoint schema to help AI direct users to you correctly.',
      mainContent: 'List all contact methods clearly: email, phone, address, hours.',
      semanticUrl: 'Use standard URLs like /contact or /contact-us for easy discovery.',
    },
  },
  
  search: {
    priority: [
      'mainContent',    // Results clarity
      'htmlSize',       // Pagination
      'semanticUrl',    // Query parameters
      'structuredData', // SearchResultsPage
      'ttfb',          // Fast results
    ],
    customMessages: {
      mainContent: 'Search results must be clearly separated from navigation and ads.',
      htmlSize: 'Paginate results to avoid huge pages that AI crawlers might skip.',
      semanticUrl: 'Use clean query parameters: /search?q=term not /s?x=abc123.',
      structuredData: 'Mark up with SearchResultsPage schema when available.',
    },
    skipMetrics: ['listicleFormat', 'authorBio'], // Not relevant for search pages
  },
  
  general: {
    priority: [], // Use default priority
    customMessages: {}, // Use default messages
  },
};

/**
 * Get priority score adjustment for a metric based on page type
 */
export function getPageTypePriorityMultiplier(pageType: PageType, metric: string): number {
  const config = pageTypeRecommendations[pageType];
  
  // Skip this metric for this page type
  if (config.skipMetrics?.includes(metric)) {
    return 0;
  }
  
  const priorityIndex = config.priority.indexOf(metric);
  
  // High priority metrics get a boost
  if (priorityIndex === 0) return 1.5;
  if (priorityIndex === 1) return 1.3;
  if (priorityIndex === 2) return 1.2;
  if (priorityIndex >= 3 && priorityIndex <= 4) return 1.1;
  
  // Not in priority list = normal priority
  return 1.0;
}

/**
 * Get custom message for a metric on a specific page type
 */
export function getPageTypeCustomMessage(pageType: PageType, metric: string): string | null {
  return pageTypeRecommendations[pageType].customMessages[metric] || null;
}

/**
 * Check if a metric should be shown for a page type
 */
export function shouldShowMetric(pageType: PageType, metric: string): boolean {
  const config = pageTypeRecommendations[pageType];
  return !config.skipMetrics?.includes(metric);
}