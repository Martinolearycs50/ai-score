import type { PillarResults, PillarBreakdown, PillarScores, PageType } from './types';
import type { ExtractedContent } from './contentExtractor';
import { PILLARS, DYNAMIC_SCORING_WEIGHTS, PAGE_TYPE_WEIGHT_MAP } from '@/utils/constants';
import { generateRecommendations } from './recommendations';

export interface ScoringResult {
  total: number;
  breakdown: PillarBreakdown[];
  pillarScores: PillarScores;
  recommendations: Array<{
    metric: string;
    why: string;
    fix: string;
    gain: number;
    pillar: string;
    example?: {
      before: string;
      after: string;
    };
  }>;
  // Dynamic scoring information
  dynamicScoring?: {
    pageType: PageType;
    appliedWeights: boolean;
    weights: Record<keyof PillarScores, number>;
    rawScores: PillarScores; // Original scores before weighting
    weightedScores: PillarScores; // Scores after applying weights
  };
}

/**
 * Score pillar results according to the new AI Search scoring model
 * Now supports dynamic scoring based on page type
 */
export function score(pillarResults: PillarResults, extractedContent?: ExtractedContent, enableDynamicScoring: boolean = true): ScoringResult {
  // Calculate raw scores first
  const breakdown: PillarBreakdown[] = Object.entries(pillarResults).map(([pillar, checks]) => {
    const earned = Object.values(checks as Record<string, number>).reduce((a, b) => a + b, 0);
    return {
      pillar: pillar as keyof PillarScores,
      earned,
      max: PILLARS[pillar as keyof typeof PILLARS],
      checks: checks as any,
    };
  });

  // Calculate raw pillar scores
  const rawPillarScores: PillarScores = {
    RETRIEVAL: 0,
    FACT_DENSITY: 0,
    STRUCTURE: 0,
    TRUST: 0,
    RECENCY: 0,
  };

  breakdown.forEach(({ pillar, earned }) => {
    rawPillarScores[pillar] = earned;
  });

  // Initialize result variables
  let total = breakdown.reduce((sum, { earned }) => sum + earned, 0);
  let pillarScores = { ...rawPillarScores };
  let dynamicScoringInfo = undefined;

  // Apply dynamic scoring if enabled and page type is available
  if (enableDynamicScoring && extractedContent?.pageType) {
    const pageType = extractedContent.pageType;
    const weightKey = PAGE_TYPE_WEIGHT_MAP[pageType] || 'default';
    const weights = DYNAMIC_SCORING_WEIGHTS[weightKey];

    // Calculate weighted scores
    const weightedScores: PillarScores = {
      RETRIEVAL: 0,
      FACT_DENSITY: 0,
      STRUCTURE: 0,
      TRUST: 0,
      RECENCY: 0,
    };

    // Apply weights to each pillar
    Object.keys(rawPillarScores).forEach((pillar) => {
      const key = pillar as keyof PillarScores;
      const rawScore = rawPillarScores[key];
      const maxScore = PILLARS[key];
      const weight = weights[key];
      
      // Calculate percentage of max score achieved
      const percentageAchieved = rawScore / maxScore;
      
      // Apply weight to get new max score, then calculate weighted score
      const weightedMaxScore = weight;
      weightedScores[key] = Math.round(percentageAchieved * weightedMaxScore);
    });

    // Update breakdown with weighted scores
    breakdown.forEach((item) => {
      const weight = weights[item.pillar];
      const percentageAchieved = item.earned / item.max;
      item.max = weight;
      item.earned = Math.round(percentageAchieved * weight);
    });

    // Calculate weighted total
    total = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);
    pillarScores = weightedScores;

    // Store dynamic scoring information
    dynamicScoringInfo = {
      pageType,
      appliedWeights: true,
      weights,
      rawScores: rawPillarScores,
      weightedScores: weightedScores
    };
  }

  // Generate recommendations for failed checks
  const recommendations = generateRecommendations(
    pillarResults as unknown as Record<string, Record<string, number>>,
    extractedContent
  ).map(rec => ({
    metric: rec.metric,
    why: rec.template.why,
    fix: rec.template.fix,
    gain: rec.template.gain,
    pillar: rec.pillar,
    example: rec.template.example,
  }));

  return {
    total,
    breakdown,
    pillarScores,
    recommendations,
    dynamicScoring: dynamicScoringInfo,
  };
}