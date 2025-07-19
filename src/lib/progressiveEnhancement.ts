// Progressive enhancement for AI Search Score
// Provides instant results via Cloudflare Worker, then enhances with full API

interface QuickAnalysisResult {
  url: string;
  timestamp: number;
  quickScores: {
    retrieval: number;
    factDensity: number;
    structure: number;
    trust: number;
    recency: number;
  };
  pageType: string;
  basicMetrics: {
    title: string;
    metaDescription: string;
    headingCount: number;
    wordCount: number;
    hasHttps: boolean;
    hasRobotsTxt?: boolean;
    hasSitemap?: boolean;
  };
  fromCache?: boolean;
}

interface ProgressiveAnalysisCallbacks {
  onQuickResult: (result: QuickAnalysisResult) => void;
  onFullResult: (result: any) => void;
  onError: (error: Error, phase: 'quick' | 'full') => void;
}

// Worker URL - will be replaced with actual deployed URL
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 
  'https://ai-search-worker.your-subdomain.workers.dev';

export async function performProgressiveAnalysis(
  url: string,
  callbacks: ProgressiveAnalysisCallbacks
): Promise<void> {
  // Phase 1: Quick analysis via Cloudflare Worker
  try {
    const quickResult = await fetchQuickAnalysis(url);
    callbacks.onQuickResult(quickResult);
  } catch (error) {
    console.error('Quick analysis failed:', error);
    callbacks.onError(error as Error, 'quick');
    // Continue to full analysis even if quick fails
  }

  // Phase 2: Full analysis via Next.js API
  try {
    const fullResult = await fetchFullAnalysis(url);
    callbacks.onFullResult(fullResult);
  } catch (error) {
    console.error('Full analysis failed:', error);
    callbacks.onError(error as Error, 'full');
  }
}

async function fetchQuickAnalysis(url: string): Promise<QuickAnalysisResult> {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Quick analysis failed');
  }

  return response.json();
}

async function fetchFullAnalysis(url: string): Promise<any> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Analysis failed');
  }

  return response.json();
}

// Convert quick scores to match full analysis format
export function convertQuickToFullFormat(quickResult: QuickAnalysisResult): any {
  const { quickScores, pageType, basicMetrics } = quickResult;
  
  // Calculate total score
  const totalScore = Object.values(quickScores).reduce((sum, score) => sum + score, 0);

  return {
    success: true,
    url: quickResult.url,
    overallScore: totalScore,
    pageType,
    isQuickAnalysis: true,
    timestamp: quickResult.timestamp,
    
    scores: {
      raw: quickScores,
      weighted: quickScores, // Simplified for quick analysis
      weights: {
        retrieval: 0.25,
        factDensity: 0.25,
        structure: 0.20,
        trust: 0.15,
        recency: 0.15
      }
    },

    content: {
      title: basicMetrics.title,
      metaDescription: basicMetrics.metaDescription,
      headingCount: basicMetrics.headingCount,
      wordCount: basicMetrics.wordCount,
      url: quickResult.url,
      hasHttps: basicMetrics.hasHttps
    },

    // Simplified recommendations for quick analysis
    recommendations: generateQuickRecommendations(quickScores, pageType),
    
    // Indicate this is preliminary
    analysisType: 'quick',
    message: 'Initial analysis complete. Full analysis in progress...'
  };
}

function generateQuickRecommendations(scores: any, pageType: string): any[] {
  const recommendations = [];

  // Basic recommendations based on low scores
  if (scores.retrieval < 20) {
    recommendations.push({
      category: 'RETRIEVAL',
      priority: 'HIGH',
      title: 'Improve Site Performance',
      description: 'Your site may be loading slowly. Consider optimizing images and enabling caching.',
      impact: 'High'
    });
  }

  if (scores.factDensity < 10) {
    recommendations.push({
      category: 'FACT_DENSITY',
      priority: 'MEDIUM',
      title: 'Add More Valuable Content',
      description: 'Consider adding more detailed information, statistics, or examples to your content.',
      impact: 'Medium'
    });
  }

  if (scores.structure < 10) {
    recommendations.push({
      category: 'STRUCTURE',
      priority: 'MEDIUM',
      title: 'Improve Content Structure',
      description: 'Add clear headings and meta descriptions to help AI understand your content.',
      impact: 'Medium'
    });
  }

  if (!scores.trust) {
    recommendations.push({
      category: 'TRUST',
      priority: 'HIGH',
      title: 'Enable HTTPS',
      description: 'Secure your site with HTTPS to build trust with users and AI systems.',
      impact: 'High'
    });
  }

  return recommendations;
}