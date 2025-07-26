/**
 * SEO Compatibility Scoring System
 * Calculates how well AI optimizations align with traditional SEO
 */
// Note: Simplified version without external dependencies
// TODO: Add back detailed checks when available
import type { PillarResults, PillarScores } from './types';

export interface SEOCompatibilityScore {
  overall: number; // 0-100
  breakdown: {
    technicalSEO: number; // Core Web Vitals, crawlability
    contentSEO: number; // E-E-A-T, freshness, structure
    richResults: number; // Schema markup, featured snippets
    userSignals: number; // Accessibility, user experience
  };
  strengths: string[];
  improvements: string[];
  conflictWarnings: string[]; // Where AI and SEO goals conflict
}

/**
 * Calculate comprehensive SEO compatibility score
 * Accepts either detailed PillarResults or simplified PillarScores
 */
export function calculateSEOCompatibility(
  pillarData: PillarResults | PillarScores
): SEOCompatibilityScore {
  // Convert PillarScores to a format we can work with
  const pillarResults = isPillarScores(pillarData)
    ? convertScoresToResults(pillarData)
    : pillarData;
  const breakdown = {
    technicalSEO: calculateTechnicalSEO(pillarResults),
    contentSEO: calculateContentSEO(pillarResults),
    richResults: calculateRichResults(pillarResults),
    userSignals: calculateUserSignals(pillarResults),
  };

  // Weight the categories
  const overall = Math.round(
    breakdown.technicalSEO * 0.3 +
      breakdown.contentSEO * 0.35 +
      breakdown.richResults * 0.2 +
      breakdown.userSignals * 0.15
  );

  const strengths = identifyStrengths(breakdown, pillarResults);
  const improvements = identifyImprovements(breakdown, pillarResults);
  const conflictWarnings = identifyConflicts(pillarResults);

  return {
    overall,
    breakdown,
    strengths,
    improvements,
    conflictWarnings,
  };
}

/**
 * Calculate technical SEO score
 */
function calculateTechnicalSEO(pillarResults: PillarResults): number {
  let score = 0;
  const retrieval = pillarResults?.RETRIEVAL || {};

  // Core Web Vitals (TTFB)
  if (retrieval.ttfb && retrieval.ttfb >= 4)
    score += 30; // <200ms excellent
  else if (retrieval.ttfb && retrieval.ttfb >= 2)
    score += 20; // <600ms good
  else if (retrieval.ttfb && retrieval.ttfb >= 1) score += 10; // <1800ms needs improvement

  // Page size and crawlability
  if (retrieval.htmlSize && retrieval.htmlSize >= 4)
    score += 20; // <2MB
  else if (retrieval.htmlSize && retrieval.htmlSize >= 2) score += 10; // <5MB

  // HTTPS (simplified - assume secure if other trust signals are strong)
  const trust = pillarResults?.TRUST || {};
  if (trust.license && trust.license >= 3) score += 20; // License info suggests professional site

  // URL structure - using headingFrequency as proxy for good structure
  const structure = pillarResults?.STRUCTURE || {};
  if (structure.headingFrequency && structure.headingFrequency >= 4) score += 15;
  else if (structure.headingFrequency && structure.headingFrequency >= 2) score += 8;

  // Mobile responsiveness (simplified)
  // TODO: Add proper mobile responsiveness check
  score += 10; // Assume basic mobile support

  return Math.min(100, score);
}

/**
 * Calculate content SEO score
 */
function calculateContentSEO(pillarResults: PillarResults): number {
  let score = 0;

  // E-E-A-T signals (simplified based on trust scores)
  const trust = pillarResults?.TRUST || {};
  if (trust.authorBio && trust.authorBio >= 4) score += 25;
  else if (trust.authorBio && trust.authorBio >= 2) score += 15;
  else score += 5;

  // Content structure
  const structure = pillarResults?.STRUCTURE || {};
  if (structure.headingFrequency && structure.headingFrequency >= 4) score += 15;
  if (structure.headingDepth && structure.headingDepth === 5) score += 10;

  // Content freshness
  const recency = pillarResults?.RECENCY || {};
  if (recency.lastModified && recency.lastModified >= 5) score += 15;
  else if (recency.lastModified && recency.lastModified >= 3) score += 8;

  // Unique content (no duplication)
  const factDensity = pillarResults?.FACT_DENSITY || {};
  if (factDensity.deduplication && factDensity.deduplication === 5) score += 15;

  // Authority links (simplified)
  // TODO: Check for actual authority links
  score += 5;

  return Math.min(100, score);
}

/**
 * Calculate rich results potential
 */
function calculateRichResults(pillarResults: PillarResults): number {
  let score = 0;
  const structure = pillarResults?.STRUCTURE || {};

  // Featured snippet potential (based on structure)
  if (structure.headingFrequency && structure.headingFrequency >= 4) {
    score += 20; // Good heading structure suggests snippet potential
  }

  // Structured data
  if (structure.structuredData && structure.structuredData === 5) score += 30;

  // Schema markup
  if (structure.structuredData && structure.structuredData >= 4) score += 20;
  else if (structure.structuredData && structure.structuredData >= 2) score += 10;

  // Direct answers (using uniqueStats as proxy for featured snippets)
  const factDensity = pillarResults?.FACT_DENSITY || {};
  if (factDensity.uniqueStats && factDensity.uniqueStats >= 4) score += 20;
  else if (factDensity.uniqueStats && factDensity.uniqueStats >= 2) score += 10;

  // Tables and lists (often featured)
  if (factDensity.dataMarkup && factDensity.dataMarkup === 5) score += 10;

  return Math.min(100, score);
}

/**
 * Calculate user signal score
 */
function calculateUserSignals(pillarResults: PillarResults): number {
  let score = 0;
  const retrieval = pillarResults?.RETRIEVAL || {};

  // Page speed (affects bounce rate)
  if (retrieval.ttfb && retrieval.ttfb >= 3) score += 30;
  else if (retrieval.ttfb && retrieval.ttfb >= 1) score += 15;

  // Content accessibility
  if (!retrieval.paywall || retrieval.paywall === 5) score += 25;

  // Content quality (affects dwell time)
  const factDensity = pillarResults?.FACT_DENSITY || {};
  if (factDensity.uniqueStats && factDensity.uniqueStats >= 4) score += 20;
  else if (factDensity.uniqueStats && factDensity.uniqueStats >= 2) score += 10;

  // Mobile-friendly content structure (using htmlSize as proxy)
  if (retrieval.htmlSize && retrieval.htmlSize >= 4) score += 25;
  else if (retrieval.htmlSize && retrieval.htmlSize >= 2) score += 15;

  return Math.min(100, score);
}

/**
 * Identify SEO strengths
 */
function identifyStrengths(
  breakdown: SEOCompatibilityScore['breakdown'],
  pillarResults: PillarResults
): string[] {
  const strengths: string[] = [];

  if (breakdown.technicalSEO >= 80) {
    strengths.push('Excellent technical SEO foundation');
  }
  if (breakdown.contentSEO >= 80) {
    strengths.push('Strong E-E-A-T signals and content quality');
  }
  if (breakdown.richResults >= 70) {
    strengths.push('High potential for rich results and featured snippets');
  }
  if (breakdown.userSignals >= 80) {
    strengths.push('Great user experience signals');
  }

  // Specific strengths based on scores
  const retrieval = pillarResults?.RETRIEVAL || {};
  if (retrieval.ttfb && retrieval.ttfb >= 4) {
    strengths.push('Fast page speed (Core Web Vitals)');
  }
  const structure = pillarResults?.STRUCTURE || {};
  if (structure.structuredData && structure.structuredData >= 4) {
    strengths.push('Rich schema markup implemented');
  }

  return strengths;
}

/**
 * Identify SEO improvements needed
 */
function identifyImprovements(
  breakdown: SEOCompatibilityScore['breakdown'],
  pillarResults: PillarResults
): string[] {
  const improvements: string[] = [];

  if (breakdown.technicalSEO < 60) {
    improvements.push('Improve technical SEO (page speed, crawlability)');
  }
  if (breakdown.contentSEO < 60) {
    improvements.push('Enhance E-E-A-T signals and content structure');
  }
  if (breakdown.richResults < 50) {
    improvements.push('Add structured data for rich results');
  }
  if (breakdown.userSignals < 60) {
    improvements.push('Optimize for better user experience');
  }

  // Specific improvements based on scores
  const retrieval = pillarResults?.RETRIEVAL || {};
  if (!retrieval.ttfb || retrieval.ttfb < 3) {
    improvements.push('Reduce Time to First Byte to <600ms');
  }
  const recency = pillarResults?.RECENCY || {};
  if (!recency.lastModified || recency.lastModified < 3) {
    improvements.push('Update content with recent data');
  }
  const structure = pillarResults?.STRUCTURE || {};
  if (!structure.structuredData || structure.structuredData < 2) {
    improvements.push('Implement schema.org structured data');
  }

  return improvements;
}

/**
 * Identify potential conflicts between AI and SEO optimization
 */
function identifyConflicts(pillarResults: PillarResults): string[] {
  const conflicts: string[] = [];

  // llms.txt file - helps AI but irrelevant for SEO
  // TODO: Add check for llms.txt when available

  // Very long content might help AI but hurt user experience
  const retrieval = pillarResults.RETRIEVAL || {};
  if (retrieval.htmlSize <= 2) {
    conflicts.push('Large page size may provide more AI context but hurt page speed');
  }

  // Direct answers help AI but might reduce click-through from search
  const factDensity = pillarResults.FACT_DENSITY || {};
  if (factDensity.uniqueStats >= 4) {
    conflicts.push('High data density helps AI but may reduce organic click-through rates');
  }

  return conflicts;
}

/**
 * Type guard to check if data is PillarScores
 */
function isPillarScores(data: PillarResults | PillarScores): data is PillarScores {
  // PillarScores should have numeric values for pillars
  return typeof data.RETRIEVAL === 'number';
}

/**
 * Convert simplified PillarScores to PillarResults format
 */
function convertScoresToResults(scores: PillarScores): PillarResults {
  return {
    RETRIEVAL: {
      // Estimate sub-scores based on overall score
      ttfb: scores.RETRIEVAL >= 80 ? 4 : scores.RETRIEVAL >= 60 ? 3 : 2,
      paywall: scores.RETRIEVAL >= 90 ? 5 : scores.RETRIEVAL >= 70 ? 3 : 1,
      mainContent: scores.RETRIEVAL >= 75 ? 4 : scores.RETRIEVAL >= 55 ? 3 : 2,
      htmlSize: scores.RETRIEVAL >= 70 ? 4 : scores.RETRIEVAL >= 50 ? 3 : 2,
    },
    FACT_DENSITY: {
      uniqueStats: scores.FACT_DENSITY >= 80 ? 4 : scores.FACT_DENSITY >= 60 ? 3 : 2,
      dataMarkup: scores.FACT_DENSITY >= 85 ? 5 : scores.FACT_DENSITY >= 60 ? 3 : 1,
      citations: scores.FACT_DENSITY >= 75 ? 4 : scores.FACT_DENSITY >= 50 ? 3 : 1,
      deduplication: scores.FACT_DENSITY >= 75 ? 5 : scores.FACT_DENSITY >= 50 ? 3 : 2,
    },
    STRUCTURE: {
      headingFrequency: scores.STRUCTURE >= 80 ? 4 : scores.STRUCTURE >= 60 ? 3 : 2,
      headingDepth: scores.STRUCTURE >= 85 ? 5 : scores.STRUCTURE >= 65 ? 3 : 2,
      structuredData: scores.STRUCTURE >= 90 ? 5 : scores.STRUCTURE >= 70 ? 3 : 0,
      rssFeed: scores.STRUCTURE >= 70 ? 3 : scores.STRUCTURE >= 50 ? 2 : 0,
    },
    TRUST: {
      authorBio: scores.TRUST >= 75 ? 5 : scores.TRUST >= 50 ? 3 : 1,
      napConsistency: scores.TRUST >= 70 ? 4 : scores.TRUST >= 50 ? 2 : 1,
      license: scores.TRUST >= 60 ? 3 : scores.TRUST >= 40 ? 2 : 0,
    },
    RECENCY: {
      lastModified: scores.RECENCY >= 80 ? 5 : scores.RECENCY >= 60 ? 3 : 1,
      stableCanonical: scores.RECENCY >= 70 ? 4 : scores.RECENCY >= 50 ? 2 : 0,
    },
  };
}

/**
 * Generate SEO compatibility summary
 */
export function generateSEOSummary(score: SEOCompatibilityScore): string {
  let summary = `## SEO Compatibility: ${score.overall}/100\n\n`;

  if (score.overall >= 80) {
    summary += '✅ **Excellent**: Your AI optimizations align well with SEO best practices.\n\n';
  } else if (score.overall >= 60) {
    summary +=
      '⚠️ **Good**: Most optimizations benefit both channels, with some room for improvement.\n\n';
  } else {
    summary += '❌ **Needs Work**: Significant improvements needed for SEO compatibility.\n\n';
  }

  summary += '### Breakdown:\n';
  summary += `- Technical SEO: ${score.breakdown.technicalSEO}/100\n`;
  summary += `- Content SEO: ${score.breakdown.contentSEO}/100\n`;
  summary += `- Rich Results: ${score.breakdown.richResults}/100\n`;
  summary += `- User Signals: ${score.breakdown.userSignals}/100\n`;

  if (score.strengths.length > 0) {
    summary += '\n### Strengths:\n';
    score.strengths.forEach((s) => (summary += `- ${s}\n`));
  }

  if (score.improvements.length > 0) {
    summary += '\n### Improvements Needed:\n';
    score.improvements.forEach((i) => (summary += `- ${i}\n`));
  }

  if (score.conflictWarnings.length > 0) {
    summary += '\n### ⚠️ Optimization Conflicts:\n';
    score.conflictWarnings.forEach((c) => (summary += `- ${c}\n`));
  }

  return summary;
}
