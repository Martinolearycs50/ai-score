// Types and interfaces for the AI Search Optimizer

// API Request
export interface AnalysisRequest {
  url: string;
}

// New pillar-based scoring for AI Search
export interface PillarScores {
  RETRIEVAL: number;     // 0-30 points
  FACT_DENSITY: number;  // 0-25 points
  STRUCTURE: number;     // 0-20 points
  TRUST: number;         // 0-15 points
  RECENCY: number;       // 0-10 points
}

export interface PillarBreakdown {
  pillar: keyof PillarScores;
  earned: number;
  max: number;
  checks: Record<string, number>;
}

export interface PillarResults {
  RETRIEVAL: {
    ttfb: number;
    paywall: number;
    mainContent: number;
    htmlSize: number;
  };
  FACT_DENSITY: {
    uniqueStats: number;
    dataMarkup: number;
    citations: number;
    deduplication: number;
  };
  STRUCTURE: {
    headingFrequency: number;
    headingDepth: number;
    structuredData: number;
    rssFeed: number;
  };
  TRUST: {
    authorBio: number;
    napConsistency: number;
    license: number;
  };
  RECENCY: {
    lastModified: number;
    stableCanonical: number;
  };
}

// Recommendation template for AI Search
export interface RecommendationTemplate {
  why: string;  // Why it matters (clear explanation)
  fix: string;  // How to fix (actionable steps)
  gain: number; // Points gained if fixed
  example?: {   // Optional before/after example
    before: string;
    after: string;
  };
}

// Form validation types
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

// UI State types - kept for compatibility
export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: any | null;
  error: string | null;
}

// Platform thresholds
export interface PlatformThreshold {
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
    min: 70,
    max: 89,
    label: "AI Ready", 
    description: "Strong performance with minor improvements needed",
    color: "blue"
  },
  {
    min: 50,
    max: 69,
    label: "Needs Optimization",
    description: "Significant room for AI search improvements",
    color: "yellow"
  },
  {
    min: 30,
    max: 49,
    label: "Poor AI Visibility",
    description: "Major changes needed for AI platform visibility",
    color: "orange"
  },
  {
    min: 0,
    max: 29,
    label: "AI Invisible",
    description: "Content is not optimized for AI search",
    color: "red"
  }
];

// Website profile for personalization
export interface WebsiteProfile {
  domain: string;
  title: string;
  description: string;
  language?: string;
  contentType?: 'blog' | 'ecommerce' | 'news' | 'corporate' | 'documentation' | 'other';
  primaryTopics?: string[];
  wordCount?: number;
  hasImages?: boolean;
  hasFavicon?: boolean;
  ogImage?: string;
}