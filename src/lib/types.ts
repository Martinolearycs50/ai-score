// Types and interfaces for the AI Search Readiness Analyzer

export interface AnalysisRequest {
  url: string;
}

export interface AnalysisResult {
  url: string;
  overall_score: number;
  category_scores: CategoryScores;
  recommendations: Recommendation[];
  analysis_details: AnalysisDetails;
  timestamp: string;
}

export interface CategoryScores {
  crawler_accessibility: number; // 0-25 points
  content_structure: number;     // 0-25 points
  technical_seo: number;         // 0-25 points
  ai_optimization: number;       // 0-25 points
}

export interface Recommendation {
  id: string;
  category: 'crawler_accessibility' | 'content_structure' | 'technical_seo' | 'ai_optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact_score: number; // How much this will improve the overall score
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string; // e.g., "5 minutes", "1 hour", "1 day"
  platform_benefits: string[]; // Which AI platforms benefit from this fix
  code_example?: string;
  documentation_link?: string;
}

export interface AnalysisDetails {
  crawler_accessibility: CrawlerAccessibilityDetails;
  content_structure: ContentStructureDetails;
  technical_seo: TechnicalSeoDetails;
  ai_optimization: AiOptimizationDetails;
  page_metadata: PageMetadata;
}

export interface CrawlerAccessibilityDetails {
  https_enabled: boolean;
  robots_txt_found: boolean;
  ai_crawlers_allowed: {
    chatgpt: boolean;     // GPTBot, ChatGPT-User, OAI-SearchBot
    claude: boolean;      // ClaudeBot, Claude-User, Claude-SearchBot
    perplexity: boolean;  // PerplexityBot
    gemini: boolean;      // Googlebot
  };
  mobile_friendly: boolean;
  page_accessible: boolean;
  response_time_ms: number;
}

export interface ContentStructureDetails {
  heading_structure: {
    h1_count: number;
    h2_count: number;
    h3_count: number;
    h4_count: number;
    h5_count: number;
    h6_count: number;
    proper_hierarchy: boolean;
  };
  content_metrics: {
    word_count: number;
    paragraph_count: number;
    list_count: number;
    has_faq_section: boolean;
    has_table_content: boolean;
  };
  readability: {
    avg_sentence_length: number;
    reading_level: string;
  };
}

export interface TechnicalSeoDetails {
  meta_tags: {
    title_present: boolean;
    title_length: number;
    description_present: boolean;
    description_length: number;
    viewport_present: boolean;
  };
  schema_markup: {
    has_schema: boolean;
    schema_types: string[];
    has_faq_schema: boolean;
    has_article_schema: boolean;
    has_organization_schema: boolean;
  };
  open_graph: {
    has_og_tags: boolean;
    og_title: boolean;
    og_description: boolean;
    og_image: boolean;
  };
  performance: {
    page_size_kb: number;
    external_resources: number;
    image_count: number;
    images_with_alt: number;
  };
}

export interface AiOptimizationDetails {
  content_freshness: {
    last_modified: string | null;
    has_date_indicators: boolean;
    estimated_freshness_score: number;
  };
  multimedia_integration: {
    image_count: number;
    video_count: number;
    images_with_descriptive_alt: number;
  };
  credibility_signals: {
    has_author_info: boolean;
    has_contact_info: boolean;
    has_about_page_link: boolean;
    external_links_count: number;
    internal_links_count: number;
  };
  content_format: {
    has_comparison_content: boolean;
    has_numbered_lists: boolean;
    has_bullet_points: boolean;
    has_data_statistics: boolean;
    has_source_citations: boolean;
  };
}

export interface PageMetadata {
  title: string;
  url: string;
  canonical_url: string | null;
  language: string | null;
  charset: string | null;
  status_code: number;
  final_url: string; // After redirects
}

// Score calculation weights
export interface ScoreWeights {
  crawler_accessibility: {
    https_enabled: number;
    robots_txt_accessible: number;
    ai_crawlers_allowed: number;
    mobile_friendly: number;
    page_accessible: number;
  };
  content_structure: {
    proper_heading_hierarchy: number;
    sufficient_content_length: number;
    has_lists: number;
    has_faq: number;
    readability: number;
  };
  technical_seo: {
    meta_tags_complete: number;
    schema_markup: number;
    open_graph: number;
    image_optimization: number;
    performance: number;
  };
  ai_optimization: {
    content_freshness: number;
    multimedia_integration: number;
    credibility_signals: number;
    content_format: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisApiResponse extends ApiResponse<AnalysisResult> {}

// Form validation types
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

// UI State types
export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: AnalysisResult | null;
  error: string | null;
}

// Platform-specific scoring
export interface PlatformScores {
  chatgpt: number;
  claude: number;
  perplexity: number;
  gemini: number;
}

// Constants for score ranges and labels
export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  description: string;
  color: string;
}

export const SCORE_RANGES: ScoreRange[] = [
  {
    min: 90,
    max: 100,
    label: "AI Search Elite",
    description: "Content is fully optimized for AI platforms",
    color: "green"
  },
  {
    min: 75,
    max: 89,
    label: "AI Ready",
    description: "Strong performance with minor improvements needed",
    color: "blue"
  },
  {
    min: 60,
    max: 74,
    label: "AI Visible",
    description: "Good foundation, needs optimization",
    color: "yellow"
  },
  {
    min: 40,
    max: 59,
    label: "AI Challenged",
    description: "Significant improvements needed",
    color: "orange"
  },
  {
    min: 0,
    max: 39,
    label: "AI Invisible",
    description: "Major overhaul required",
    color: "red"
  }
];

// AI Platform information
export interface AiPlatform {
  id: string;
  name: string;
  crawlers: string[];
  requirements: string[];
  color: string;
}

export const AI_PLATFORMS: AiPlatform[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    crawlers: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot'],
    requirements: ['Accessible robots.txt', 'Server-side rendering', 'Structured content'],
    color: 'emerald'
  },
  {
    id: 'claude',
    name: 'Claude',
    crawlers: ['ClaudeBot', 'Claude-User', 'Claude-SearchBot'],
    requirements: ['Clear content structure', 'Mobile-friendly', 'Fast loading'],
    color: 'orange'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    crawlers: ['PerplexityBot'],
    requirements: ['Citation-ready content', 'Source links', 'Fresh content'],
    color: 'blue'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    crawlers: ['Googlebot'],
    requirements: ['Google SEO best practices', 'Schema markup', 'E-E-A-T signals'],
    color: 'purple'
  }
];