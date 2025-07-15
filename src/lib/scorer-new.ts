import type { PillarResults, PillarBreakdown, PillarScores } from './types';
import { PILLARS } from '@/utils/constants';
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
  }>;
}

/**
 * Score pillar results according to the new AI Search scoring model
 */
export function score(pillarResults: PillarResults): ScoringResult {
  const breakdown: PillarBreakdown[] = Object.entries(pillarResults).map(([pillar, checks]) => {
    const earned = Object.values(checks as Record<string, number>).reduce((a, b) => a + b, 0);
    return {
      pillar: pillar as keyof PillarScores,
      earned,
      max: PILLARS[pillar as keyof typeof PILLARS],
      checks: checks as any,
    };
  });

  // Calculate pillar scores
  const pillarScores: PillarScores = {
    RETRIEVAL: 0,
    FACT_DENSITY: 0,
    STRUCTURE: 0,
    TRUST: 0,
    RECENCY: 0,
  };

  breakdown.forEach(({ pillar, earned }) => {
    pillarScores[pillar] = earned;
  });

  // Calculate total score
  const total = breakdown.reduce((sum, { earned }) => sum + earned, 0);

  // Generate recommendations for failed checks
  const recommendations = generateRecommendations(pillarResults as unknown as Record<string, Record<string, number>>).map(rec => ({
    metric: rec.metric,
    why: rec.template.why,
    fix: rec.template.fix,
    gain: rec.template.gain,
    pillar: rec.pillar,
  }));

  return {
    total,
    breakdown,
    pillarScores,
    recommendations,
  };
}