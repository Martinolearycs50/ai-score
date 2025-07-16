// AI Search Optimizer Constants

// New AI Search pillars with max points - Updated for 2025 AI trends
// Structure is now most important due to listicles getting 32.5% of AI citations
export const PILLARS = {
  RETRIEVAL: 25,    // Reduced from 30 (-5)
  FACT_DENSITY: 20, // Reduced from 25 (-5)
  STRUCTURE: 30,    // Increased from 20 (+10) - Most important for 2025!
  TRUST: 15,        // Unchanged
  RECENCY: 10,      // Unchanged
} as const;

// Minimum thresholds for scoring
export const THRESHOLDS = {
  content: {
    min_word_count: 300,
    ideal_word_count: 1000,
    max_title_length: 60,
    min_title_length: 30,
    max_description_length: 160,
    min_description_length: 50,
    max_h1_count: 1,
    min_heading_depth: 2,
    max_heading_depth: 4
  },
  performance: {
    max_response_time_ms: 3000,
    ideal_response_time_ms: 1000,
    max_page_size_kb: 5000,
    ideal_page_size_kb: 1000
  },
  freshness: {
    max_age_days: 365,
    ideal_age_days: 90
  }
};

// AI Platform crawlers
export const AI_CRAWLERS = {
  chatgpt: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot'],
  claude: ['ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Claude-Web-User'],
  perplexity: ['PerplexityBot'],
  gemini: ['Googlebot', 'APIs-Google', 'AdsBot-Google'],
  you: ['YouBot'],
  meta: ['FacebookBot', 'facebookexternalhit']
} as const;

// Schema types that AI platforms value
export const VALUABLE_SCHEMA_TYPES = [
  'Article',
  'NewsArticle', 
  'BlogPosting',
  'FAQPage',
  'HowTo',
  'Recipe',
  'Product',
  'Organization',
  'Person',
  'Event',
  'Course',
  'Dataset'
];

// Content freshness indicators
export const FRESHNESS_INDICATORS = [
  'last updated',
  'modified',
  'published',
  'dateModified',
  'datePublished',
  'updated on',
  'revised'
];

// Timeout settings
export const TIMEOUTS = {
  page_fetch: 10000, // 10 seconds
  robots_txt: 5000,  // 5 seconds
  ttfb_check: 5000   // 5 seconds for TTFB measurement
};

// HTTP Headers
export const DEFAULT_HEADERS = {
  'User-Agent': 'AI-Search-Analyzer/1.0 (compatible; analysis bot)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Cache-Control': 'no-cache'
};