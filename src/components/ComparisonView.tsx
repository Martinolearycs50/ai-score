'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import { useTier } from '@/hooks/useTier';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { cssVars } from '@/lib/design-system/colors';
import { borders, gradients, typography } from '@/lib/design-system/styles';

import PillarScoreDisplay from './PillarScoreDisplay';
import ScoreDifference from './ScoreDifference';

interface ComparisonViewProps {
  results: [AnalysisResultNew, AnalysisResultNew];
}

// Pillar information
const PILLAR_INFO: Record<string, { name: string; tip: string }> = {
  RETRIEVAL: {
    name: 'Speed & Access',
    tip: 'Optimization for AI crawler access and speed',
  },
  FACT_DENSITY: {
    name: 'Rich Content',
    tip: 'Density of facts and structured data',
  },
  STRUCTURE: {
    name: 'Smart Organization',
    tip: 'Content structure and formatting quality',
  },
  TRUST: {
    name: 'Credibility',
    tip: 'Authority and trust signals',
  },
  RECENCY: {
    name: 'Freshness',
    tip: 'Content recency and update frequency',
  },
};

export default function ComparisonView({ results }: ComparisonViewProps) {
  const { features, tier } = useTier();
  const [result1, result2] = results;

  // Calculate score differences
  const totalScoreDiff = result1.aiSearchScore - result2.aiSearchScore;

  return (
    <div className="space-y-8">
      {/* Overall comparison header */}
      <motion.div
        className="space-y-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-medium" style={{ color: cssVars.foreground }}>
          Analysis Complete
        </h2>

        {/* Winner announcement with sophisticated design */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {totalScoreDiff !== 0 && (
            <div
              className="inline-flex items-center gap-3 rounded-full border px-6 py-3"
              style={{
                background: gradients.success.light,
                borderColor: `${cssVars.success}30`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z"
                  fill={cssVars.outstanding}
                  stroke={cssVars.outstanding}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-lg font-medium" style={{ color: cssVars.winner }}>
                {totalScoreDiff > 0
                  ? `${result1.websiteProfile?.title || new URL(result1.url).hostname} leads by ${Math.abs(totalScoreDiff)} points`
                  : `${result2.websiteProfile?.title || new URL(result2.url).hostname} leads by ${Math.abs(totalScoreDiff)} points`}
              </span>
            </div>
          )}

          {totalScoreDiff === 0 && (
            <div className="border-default inline-flex items-center gap-3 rounded-full border bg-gray-50 px-6 py-3">
              <span className="text-body text-lg">
                Perfect tie - Both sites score {result1.aiSearchScore} points
              </span>
            </div>
          )}
        </motion.div>

        {/* Insight message */}
        <p className="text-muted mt-4 text-lg">
          {totalScoreDiff === 0
            ? 'Both sites are equally optimized for AI search engines'
            : Math.abs(totalScoreDiff) > 20
              ? 'A significant gap that can be closed with targeted improvements'
              : 'Small optimizations could change the rankings'}
        </p>

        {/* Different page type notice */}
        {result1.extractedContent?.pageType &&
          result2.extractedContent?.pageType &&
          result1.extractedContent.pageType !== result2.extractedContent.pageType && (
            <motion.p
              className="warning-text mt-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Note: Comparing different page types ({result1.extractedContent.pageType} vs{' '}
              {result2.extractedContent.pageType}). Scoring weights are adjusted for each page type.
            </motion.p>
          )}
      </motion.div>

      {/* Side-by-side comparison */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Website 1 */}
        <motion.div
          className={`space-y-4 rounded-lg border-2 p-6 transition-all ${
            totalScoreDiff > 0
              ? 'shadow-lg'
              : totalScoreDiff < 0
                ? 'border-default bg-gray-50'
                : 'border-default'
          }`}
          style={
            totalScoreDiff > 0
              ? {
                  borderColor: `${cssVars.success}40`,
                  background: `linear-gradient(to bottom right, ${cssVars.success}05, ${cssVars.success}10)`,
                }
              : {}
          }
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-medium" style={typography.heading}>
                {result1.websiteProfile?.title ||
                  result1.pageTitle ||
                  new URL(result1.url).hostname}
              </h3>
              <p className="text-muted truncate text-sm">{new URL(result1.url).hostname}</p>
              {result1.extractedContent?.pageType && (
                <p className="text-muted mt-1 text-xs">
                  {result1.extractedContent.pageType.charAt(0).toUpperCase() +
                    result1.extractedContent.pageType.slice(1)}{' '}
                  page
                </p>
              )}
            </div>
            {totalScoreDiff > 0 && (
              <div className="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L7 7L12 3L17 7L19 12L12 19L5 12Z"
                    fill={cssVars.outstanding}
                    fillOpacity="0.2"
                    stroke={cssVars.outstanding}
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="8" r="2" fill={cssVars.outstanding} />
                </svg>
                <span className="text-sm font-medium" style={{ color: cssVars.winner }}>
                  Winner
                </span>
              </div>
            )}
          </div>

          {/* Pillar breakdown for comparison */}
          <div className="mt-4">
            <PillarScoreDisplay result={result1} compact />
          </div>
        </motion.div>

        {/* Website 2 */}
        <motion.div
          className={`space-y-4 rounded-lg border-2 p-6 transition-all ${
            totalScoreDiff < 0
              ? 'shadow-lg'
              : totalScoreDiff > 0
                ? 'border-default bg-gray-50'
                : 'border-default'
          }`}
          style={
            totalScoreDiff < 0
              ? {
                  borderColor: `${cssVars.success}40`,
                  background: `linear-gradient(to bottom right, ${cssVars.success}05, ${cssVars.success}10)`,
                }
              : {}
          }
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-medium" style={typography.heading}>
                {result2.websiteProfile?.title ||
                  result2.pageTitle ||
                  new URL(result2.url).hostname}
              </h3>
              <p className="text-muted truncate text-sm">{new URL(result2.url).hostname}</p>
              {result2.extractedContent?.pageType && (
                <p className="text-muted mt-1 text-xs">
                  {result2.extractedContent.pageType.charAt(0).toUpperCase() +
                    result2.extractedContent.pageType.slice(1)}{' '}
                  page
                </p>
              )}
            </div>
            {totalScoreDiff < 0 && (
              <div className="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L7 7L12 3L17 7L19 12L12 19L5 12Z"
                    fill={cssVars.outstanding}
                    fillOpacity="0.2"
                    stroke={cssVars.outstanding}
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="8" r="2" fill={cssVars.outstanding} />
                </svg>
                <span className="text-sm font-medium" style={{ color: cssVars.winner }}>
                  Winner
                </span>
              </div>
            )}
          </div>

          {/* Pillar breakdown for comparison */}
          <div className="mt-4">
            <PillarScoreDisplay result={result2} compact />
          </div>
        </motion.div>
      </div>

      {/* Detailed pillar comparison - only for pro users */}
      {tier === 'pro' && features.showPillarBreakdown && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-2 text-center text-2xl font-medium" style={typography.heading}>
            Detailed Breakdown
          </h3>
          <p className="text-muted mb-8 text-center">Category-by-category performance comparison</p>

          <div className="space-y-4">
            {result1.scoringResult.breakdown.map((pillar1, index) => {
              // Find the matching pillar in result2
              const pillar2 = result2.scoringResult.breakdown.find(
                (p) => p.pillar === pillar1.pillar
              );

              if (!pillar2) return null;

              const diff = pillar1.earned - pillar2.earned;

              return (
                <motion.div
                  key={pillar1.pillar}
                  className="card p-6 transition-all hover:shadow-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div>
                        <h4 className="text-lg font-medium" style={typography.heading}>
                          {PILLAR_INFO[pillar1.pillar]?.name || pillar1.pillar}
                        </h4>
                        <p className="text-muted text-sm">{PILLAR_INFO[pillar1.pillar]?.tip}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Website 1 score */}
                      <div className="text-right">
                        <div className="text-muted text-sm">{new URL(result1.url).hostname}</div>
                        <div
                          className="text-lg font-medium"
                          style={{
                            color:
                              diff > 0
                                ? cssVars.success
                                : diff < 0
                                  ? cssVars.error
                                  : cssVars.foreground,
                          }}
                        >
                          {pillar1.earned}/{pillar1.max}
                        </div>
                      </div>

                      {/* Difference */}
                      <div className="w-20 text-center">
                        <ScoreDifference difference={diff} />
                      </div>

                      {/* Website 2 score */}
                      <div className="text-left">
                        <div className="text-muted text-sm">{new URL(result2.url).hostname}</div>
                        <div
                          className="text-lg font-medium"
                          style={{
                            color:
                              diff < 0
                                ? cssVars.success
                                : diff > 0
                                  ? cssVars.error
                                  : cssVars.foreground,
                          }}
                        >
                          {pillar2.earned}/{pillar2.max}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Wins Section for the losing site */}
          {totalScoreDiff !== 0 && (
            <motion.div
              className="mt-12 rounded-lg p-6"
              style={{
                background: gradients.primary.light,
                border: borders.primaryLight,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="mb-3 flex items-center gap-2 text-lg font-medium">
                <span className="text-2xl">💡</span>
                <span style={{ color: cssVars.foreground }}>
                  Quick Wins for{' '}
                  {totalScoreDiff > 0
                    ? new URL(result2.url).hostname
                    : new URL(result1.url).hostname}
                </span>
              </h4>
              <p className="text-muted mb-4 text-sm">
                Focus on these areas to close the gap and boost your AI visibility:
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {(totalScoreDiff > 0 ? result2 : result1).scoringResult.breakdown
                  .filter((pillar) => {
                    const otherPillar = (
                      totalScoreDiff > 0 ? result1 : result2
                    ).scoringResult.breakdown.find((p) => p.pillar === pillar.pillar);
                    return otherPillar && pillar.earned < otherPillar.earned;
                  })
                  .slice(0, 4)
                  .map((pillar, idx) => (
                    <motion.div
                      key={pillar.pillar}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{ backgroundColor: cssVars.card }}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: cssVars.foreground }}>
                          Improve {PILLAR_INFO[pillar.pillar]?.name}
                        </p>
                        <p className="text-muted text-xs">
                          Potential gain: +{pillar.max - pillar.earned} points
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Upgrade CTA for free tier users */}
      {features.showUpgradeCTA && (
        <motion.div
          className="mt-12 rounded-lg p-8 text-center"
          style={{
            background: gradients.accent.light,
            border: borders.accentLight,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-3 text-2xl font-medium" style={typography.heading}>
            Want the Full Battle Analysis? ⚔️
          </h3>
          <p className="text-muted mb-6 text-lg">
            Unlock detailed pillar breakdowns, strategic recommendations, and quick wins to dominate
            the AI search game!
          </p>
          <Link
            href="/pricing"
            className="btn-primary inline-block rounded-lg px-8 py-3 font-medium"
          >
            Upgrade to Pro →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
