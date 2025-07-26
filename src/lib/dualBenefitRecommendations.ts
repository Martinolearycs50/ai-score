/**
 * Dual-Benefit Recommendations System
 * Shows which optimizations help both AI search and traditional SEO
 */
import { seoIndicators } from './audit/factDensity';
import { capturedDomain } from './audit/retrieval';
import { capturedContent } from './audit/structure';
import type { RecommendationTemplate } from './types';

export type BenefitType = 'ai' | 'seo' | 'dual';

export interface DualBenefitRecommendation extends RecommendationTemplate {
  metric: string;
  pillar: string;
  benefitType: BenefitType;
  aiImpact: 'high' | 'medium' | 'low';
  seoImpact: 'high' | 'medium' | 'low' | 'neutral';
  icon: string; // 🤖 AI Only | 🔍 SEO Only | 🎯 Dual Benefit
}

/**
 * Enhance recommendations with dual-benefit indicators
 */
export function enhanceWithDualBenefits(
  recommendations: Array<{ metric: string; template: RecommendationTemplate; pillar: string }>
): DualBenefitRecommendation[] {
  return recommendations.map((rec) => {
    const enhanced = analyzeBenefit(rec.metric, rec.template);
    return {
      ...rec.template,
      metric: rec.metric,
      pillar: rec.pillar,
      ...enhanced,
    };
  });
}

/**
 * Analyze which channel(s) benefit from each optimization
 */
function analyzeBenefit(
  metric: string,
  template: RecommendationTemplate
): {
  benefitType: BenefitType;
  aiImpact: 'high' | 'medium' | 'low';
  seoImpact: 'high' | 'medium' | 'low' | 'neutral';
  icon: string;
} {
  // Define impact mappings for each metric
  const benefitMap: Record<
    string,
    {
      benefitType: BenefitType;
      aiImpact: 'high' | 'medium' | 'low';
      seoImpact: 'high' | 'medium' | 'low' | 'neutral';
    }
  > = {
    // RETRIEVAL metrics
    ttfb: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'high', // Core Web Vitals
    },
    paywall: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium',
    },
    mainContent: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium',
    },
    htmlSize: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'medium',
    },
    llmsTxtFile: {
      benefitType: 'ai',
      aiImpact: 'high',
      seoImpact: 'neutral',
    },

    // FACT_DENSITY metrics
    uniqueStats: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium', // E-E-A-T
    },
    dataMarkup: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'high', // Rich snippets
    },
    citations: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'high', // E-E-A-T
    },
    deduplication: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'high', // Duplicate content penalty
    },
    directAnswers: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium', // Featured snippets
    },

    // STRUCTURE metrics
    headingFrequency: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'high',
    },
    headingDepth: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'medium',
    },
    structuredData: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'high', // Rich results
    },
    rssFeed: {
      benefitType: 'seo',
      aiImpact: 'low',
      seoImpact: 'medium',
    },
    listicleFormat: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium', // Featured snippets
    },
    comparisonTables: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'medium',
    },
    semanticUrl: {
      benefitType: 'dual',
      aiImpact: 'low',
      seoImpact: 'high',
    },

    // TRUST metrics
    authorBio: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'high', // E-E-A-T
    },
    companyInfo: {
      benefitType: 'dual',
      aiImpact: 'medium',
      seoImpact: 'high', // Trust signals
    },
    contentLicense: {
      benefitType: 'ai',
      aiImpact: 'medium',
      seoImpact: 'neutral',
    },
    httpsProtocol: {
      benefitType: 'seo',
      aiImpact: 'low',
      seoImpact: 'high', // Ranking factor
    },

    // RECENCY metrics
    lastModified: {
      benefitType: 'dual',
      aiImpact: 'high',
      seoImpact: 'high', // Freshness
    },
    canonicalUrl: {
      benefitType: 'seo',
      aiImpact: 'low',
      seoImpact: 'high', // Duplicate content
    },
  };

  const benefit = benefitMap[metric] || {
    benefitType: 'ai' as BenefitType,
    aiImpact: 'medium' as const,
    seoImpact: 'neutral' as const,
  };

  // Determine icon based on benefit type
  const icon = benefit.benefitType === 'dual' ? '🎯' : benefit.benefitType === 'seo' ? '🔍' : '🤖';

  return {
    ...benefit,
    icon,
  };
}

/**
 * Generate SEO-specific insights based on captured data
 */
export function generateSEOInsights(): {
  overallScore: number;
  insights: string[];
  opportunities: string[];
} {
  const insights: string[] = [];
  const opportunities: string[] = [];

  // Analyze SEO compatibility from retrieval
  if (capturedDomain.seoCompatibility) {
    const seoScore = capturedDomain.seoCompatibility.overallScore;

    if (seoScore >= 80) {
      insights.push('✅ Strong SEO foundation with good Core Web Vitals');
    } else if (seoScore >= 60) {
      insights.push('⚠️ Moderate SEO compatibility - some improvements needed');
    } else {
      insights.push('❌ Poor SEO compatibility - significant improvements required');
    }

    if (!capturedDomain.seoCompatibility.ttfbGood) {
      opportunities.push('Improve Time to First Byte for better Core Web Vitals');
    }
    if (!capturedDomain.seoCompatibility.contentRatioGood) {
      opportunities.push('Increase main content ratio for better crawlability');
    }
  }

  // Analyze structured data opportunities
  if (capturedContent.featuredSnippetPotential) {
    if (capturedContent.featuredSnippetPotential >= 70) {
      insights.push('✅ High potential for featured snippets');
    } else if (capturedContent.featuredSnippetPotential >= 40) {
      insights.push('⚠️ Moderate featured snippet potential');
    }

    if (!capturedContent.hasFAQSchema && capturedContent.title?.includes('?')) {
      opportunities.push('Add FAQ schema markup for rich results');
    }
    if (!capturedContent.hasHowToSchema && capturedContent.title?.toLowerCase().includes('how')) {
      opportunities.push('Add HowTo schema for step-by-step rich results');
    }
  }

  // Analyze E-E-A-T signals
  if (seoIndicators.eeatScore >= 70) {
    insights.push("✅ Strong E-E-A-T signals for Google's quality guidelines");
  } else if (seoIndicators.eeatScore >= 40) {
    insights.push('⚠️ Moderate E-E-A-T signals - room for improvement');
  } else {
    insights.push('❌ Weak E-E-A-T signals - needs authority building');
  }

  if (!seoIndicators.hasAuthorityLinks) {
    opportunities.push('Add citations to .edu/.gov sites for authority');
  }
  if (!seoIndicators.contentFreshness) {
    opportunities.push('Update content with recent data (2023-2024)');
  }

  // Calculate overall SEO score
  const overallScore = Math.round(
    (capturedDomain.seoCompatibility?.overallScore || 0) * 0.4 +
      (capturedContent.featuredSnippetPotential || 0) * 0.3 +
      seoIndicators.eeatScore * 0.3
  );

  return {
    overallScore,
    insights,
    opportunities,
  };
}

/**
 * Format recommendation with dual-benefit information
 */
export function formatDualBenefitRecommendation(rec: DualBenefitRecommendation): string {
  const header = `${rec.icon} ${
    rec.benefitType === 'dual'
      ? 'Dual Benefit'
      : rec.benefitType === 'seo'
        ? 'SEO Benefit'
        : 'AI Benefit'
  }`;

  let impact = '\n\n**Impact:**\n';
  impact += `- AI Search: ${rec.aiImpact.toUpperCase()} impact\n`;
  if (rec.seoImpact !== 'neutral') {
    impact += `- Traditional SEO: ${rec.seoImpact.toUpperCase()} impact\n`;
  }

  return `${header}\n\n${rec.why}${impact}\n**How to fix:**\n${rec.fix}`;
}
