import type { ScoreWeights } from '@/lib/types';

// New AI Search pillars with max points
export const PILLARS = {
  RETRIEVAL: 30,
  FACT_DENSITY: 25,
  STRUCTURE: 20,
  TRUST: 15,
  RECENCY: 10,
} as const;

// Scoring weights for each category (total 25 points each)
export const SCORE_WEIGHTS: ScoreWeights = {
  crawler_accessibility: {
    https_enabled: 5,           // HTTPS is critical for modern AI crawlers
    robots_txt_accessible: 3,   // Should be accessible but not block AI bots
    ai_crawlers_allowed: 8,     // Critical - if blocked, AI can't see content
    mobile_friendly: 5,         // Mobile-first indexing is standard
    page_accessible: 4          // Basic accessibility (200 status)
  },
  content_structure: {
    proper_heading_hierarchy: 6,    // H1-H6 structure helps AI understand content
    sufficient_content_length: 5,   // Need enough content for AI to analyze
    has_lists: 4,                   // Lists are easy for AI to parse
    has_faq: 6,                     // FAQ sections are ideal for AI responses
    readability: 4                  // Clear, readable content
  },
  technical_seo: {
    meta_tags_complete: 5,      // Title, description, viewport
    schema_markup: 8,           // Structured data is crucial for AI understanding
    open_graph: 3,              // Social sharing metadata
    image_optimization: 4,      // Alt text, proper sizing
    performance: 5              // Page speed affects crawling
  },
  ai_optimization: {
    content_freshness: 6,       // Fresh content ranks higher
    multimedia_integration: 4,   // Images, videos enhance content
    credibility_signals: 8,     // Author info, contact, about page
    content_format: 7           // Comparison tables, data, citations
  }
};

// Minimum thresholds for scoring
export const THRESHOLDS = {
  content: {
    min_word_count: 300,
    ideal_word_count: 1000,
    max_title_length: 60,
    min_title_length: 30,
    max_description_length: 160,
    min_description_length: 120
  },
  performance: {
    max_response_time_ms: 3000,
    ideal_response_time_ms: 1500,
    max_page_size_kb: 2000,
    max_external_resources: 50
  },
  readability: {
    max_avg_sentence_length: 20,
    min_flesch_score: 60
  }
};

// AI Platform crawler user agents to check in robots.txt
export const AI_CRAWLERS = {
  chatgpt: [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot'
  ],
  claude: [
    'ClaudeBot',
    'Claude-User', 
    'Claude-SearchBot'
  ],
  perplexity: [
    'PerplexityBot'
  ],
  gemini: [
    'Googlebot',
    'Googlebot-News',
    'Googlebot-Image',
    'Googlebot-Video'
  ]
};

// Schema.org types that are particularly valuable for AI
export const VALUABLE_SCHEMA_TYPES = [
  'FAQPage',
  'Article',
  'NewsArticle',
  'BlogPosting',
  'HowTo',
  'Recipe',
  'Product',
  'Review',
  'Organization',
  'Person',
  'Event',
  'Place',
  'BreadcrumbList'
];

// Content patterns that AI platforms particularly value
export const AI_FRIENDLY_PATTERNS = {
  faq: [
    /frequently\s+asked\s+questions?/i,
    /f\.?a\.?q\.?s?/i,
    /common\s+questions?/i,
    /questions?\s+and\s+answers?/i
  ],
  comparison: [
    /vs\.?\s+/i,
    /versus/i,
    /compared?\s+to/i,
    /comparison/i,
    /differences?\s+between/i
  ],
  howTo: [
    /how\s+to/i,
    /step\s+by\s+step/i,
    /tutorial/i,
    /guide/i,
    /instructions?/i
  ],
  data: [
    /statistics?/i,
    /data/i,
    /research/i,
    /study/i,
    /survey/i,
    /report/i
  ]
};

// Meta tag requirements
export const META_TAG_REQUIREMENTS = {
  title: {
    required: true,
    min_length: 30,
    max_length: 60,
    unique: true
  },
  description: {
    required: true,
    min_length: 120,
    max_length: 160,
    unique: true
  },
  viewport: {
    required: true,
    content: 'width=device-width, initial-scale=1'
  }
};

// Open Graph requirements
export const OPEN_GRAPH_REQUIREMENTS = [
  'og:title',
  'og:description', 
  'og:url',
  'og:type',
  'og:image'
];

// Headers that indicate content freshness
export const FRESHNESS_INDICATORS = [
  'last-modified',
  'date',
  'expires',
  'cache-control'
];

// Timeout settings for analysis
export const TIMEOUTS = {
  page_fetch: 10000,      // 10 seconds max to fetch page
  robots_fetch: 5000,     // 5 seconds max to fetch robots.txt
  total_analysis: 30000   // 30 seconds max total analysis time
};

// Default headers for web requests
export const DEFAULT_HEADERS = {
  'User-Agent': 'AI-Search-Analyzer/1.0 (https://ai-search-analyzer.com)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'DNT': '1',
  'Connection': 'keep-alive'
};

// Error messages for different failure scenarios
export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid URL',
  TIMEOUT: 'Analysis timed out. The website may be slow to respond.',
  NOT_FOUND: 'The requested page could not be found (404 error)',
  FORBIDDEN: 'Access to this page is forbidden (403 error)',
  SERVER_ERROR: 'The website returned a server error (5xx error)',
  NETWORK_ERROR: 'Unable to connect to the website. Please check the URL and try again.',
  ROBOTS_BLOCKED: 'This website blocks our analyzer in robots.txt',
  JAVASCRIPT_REQUIRED: 'This page requires JavaScript and cannot be fully analyzed',
  TOO_LARGE: 'The page is too large to analyze efficiently',
  INVALID_CONTENT: 'The page does not contain valid HTML content'
};

// Success messages for good practices found
export const SUCCESS_MESSAGES = {
  HTTPS_ENABLED: 'HTTPS is properly configured',
  ROBOTS_ACCESSIBLE: 'robots.txt is accessible and allows AI crawlers',
  GOOD_PERFORMANCE: 'Page loads quickly',
  MOBILE_FRIENDLY: 'Page is mobile-friendly',
  SCHEMA_PRESENT: 'Structured data markup detected',
  FAQ_SCHEMA: 'FAQ schema markup found - excellent for AI!',
  GOOD_CONTENT_LENGTH: 'Content has sufficient depth',
  PROPER_HEADINGS: 'Heading structure is well-organized',
  META_COMPLETE: 'Meta tags are properly configured',
  IMAGES_OPTIMIZED: 'Images have descriptive alt text'
};

// Recommendation templates
export const RECOMMENDATION_TEMPLATES = {
  ENABLE_HTTPS: {
    title: 'Enable HTTPS',
    description: 'Switch to HTTPS to ensure secure connections and improve trust with AI crawlers.',
    difficulty: 'medium' as const,
    estimated_time: '1-2 hours',
    platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
    code_example: `
<!-- Redirect HTTP to HTTPS in .htaccess -->
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    `.trim()
  },
  ADD_FAQ_SCHEMA: {
    title: 'Add FAQ Schema Markup',
    description: 'Implement FAQPage schema to help AI platforms understand your Q&A content.',
    difficulty: 'easy' as const,
    estimated_time: '15-30 minutes',
    platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
    code_example: `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AI search optimization?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AI search optimization involves..."
    }
  }]
}
</script>
    `.trim()
  },
  IMPROVE_HEADINGS: {
    title: 'Improve Heading Structure',
    description: 'Use proper H1-H6 hierarchy to help AI understand your content structure.',
    difficulty: 'easy' as const,
    estimated_time: '10-20 minutes',
    platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
    code_example: `
<!-- Good heading structure -->
<h1>Main Topic</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<h3>Subsection 1.2</h3>
<h2>Section 2</h2>
    `.trim()
  }
};