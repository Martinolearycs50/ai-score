'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { cssVars, getScoreColor } from '@/lib/design-system/colors';
import {
  PILLAR_DISPLAY_NAMES,
  getPerformanceRating,
  getRatingColor,
  getRatingEmoji,
} from '@/lib/performanceRatings';

interface PillarScoreDisplayProps {
  result: AnalysisResultNew;
  compact?: boolean;
  tier?: 'free' | 'pro';
}

// Pillar metadata with plain language explanations
const PILLAR_INFO = {
  RETRIEVAL: {
    name: 'Retrieval & Access',
    icon: '⚡',
    description: 'How fast AI can access your content',
    tooltip:
      'AI systems need quick access to your content. This measures page speed, accessibility, llms.txt presence, and whether content is behind paywalls.',
    maxScore: 25, // UPDATED for 2025
  },
  FACT_DENSITY: {
    name: 'Fact Density',
    icon: '📊',
    description: 'How much useful information per section',
    tooltip:
      'AI prioritizes content with facts, data, specific examples, and direct answers after headings. Generic content ranks lower.',
    maxScore: 25, // UPDATED for 2025 - same as base
  },
  STRUCTURE: {
    name: 'Answer Architecture',
    icon: '📋',
    description: 'Most important for 2025 AI search!',
    tooltip:
      '🔥 MOST IMPORTANT: Listicles get 32.5% of AI citations! Use numbered titles, lists, comparison tables, and semantic URLs for maximum AI visibility.',
    maxScore: 40, // INCREASED for 2025 - Most important!
  },
  TRUST: {
    name: 'Trust & Authority',
    icon: '✓',
    description: 'Credibility signals AI looks for',
    tooltip:
      'AI needs to verify credibility through author info, citations, domain authority, and HTTPS usage.',
    maxScore: 20, // INCREASED from 15 (+5) - Added HTTPS check
  },
  RECENCY: {
    name: 'Freshness',
    icon: '🔄',
    description: 'How up-to-date your content is',
    tooltip:
      'Recent content is preferred for current topics. Shows last updated dates and content freshness.',
    maxScore: 10,
  },
};

export default function PillarScoreDisplay({
  result,
  compact = false,
  tier = 'pro',
}: PillarScoreDisplayProps) {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const { scoringResult } = result;

  const getPillarColor = (earned: number, max: number) => {
    const percentage = (earned / max) * 100;
    return getScoreColor(percentage);
  };

  const getScoreStatus = (earned: number, max: number) => {
    const percentage = (earned / max) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Needs Work';
    return 'Poor';
  };

  // Compact mode for comparison view
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Score Display */}
        <div className="text-center">
          <div className="mb-2 text-4xl font-medium" style={{ color: 'var(--accent)' }}>
            {result.aiSearchScore}
          </div>
          <div className="text-muted text-sm">AI Search Score</div>
        </div>

        {/* Compact Pillar Bars */}
        <div className="space-y-2">
          {scoringResult.breakdown.map((pillar) => {
            const info = PILLAR_INFO[pillar.pillar];
            const percentage = (pillar.earned / pillar.max) * 100;

            return (
              <div key={pillar.pillar} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span style={{ color: 'var(--foreground)' }}>{info.name}</span>
                  </span>
                  <span className="text-muted">
                    {pillar.earned}/{pillar.max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getPillarColor(pillar.earned, pillar.max),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Free tier - simplified rating display
  if (tier === 'free') {
    return (
      <div className="space-y-8">
        {/* Overall Score Only */}
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
            Your AI Search Score
          </h2>

          {/* Big Score Display */}
          <motion.div
            className="mb-2 text-8xl font-bold"
            style={{ color: getScoreColor(result.aiSearchScore) }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            {result.aiSearchScore}
          </motion.div>
          <div className="text-muted mb-8 text-lg">out of 100</div>

          {/* Simple Rating Summary */}
          <div className="mb-8">
            <p className="text-xl" style={{ color: 'var(--foreground)' }}>
              {result.aiSearchScore >= 70
                ? 'Great job! Your content is well-optimized for AI search.'
                : result.aiSearchScore >= 40
                  ? "Good start! There's room to improve your AI visibility."
                  : 'Your content needs optimization for AI search engines.'}
            </p>
          </div>
        </div>

        {/* Simple Ratings Grid */}
        <div className="mx-auto grid max-w-md grid-cols-1 gap-3 md:grid-cols-2">
          {scoringResult.breakdown.map((pillar) => {
            const rating = getPerformanceRating(pillar.earned, pillar.max);
            const displayName = PILLAR_DISPLAY_NAMES[pillar.pillar];

            return (
              <div key={pillar.pillar} className="p-3 text-center">
                <div className="text-muted mb-1 text-sm">{displayName}</div>
                <div className={`font-medium ${getRatingColor(rating)}`}>{rating}</div>
              </div>
            );
          })}
        </div>

        {/* Large CTA */}
        <motion.div
          className="mx-auto max-w-lg rounded-lg p-8 text-center"
          style={{ backgroundColor: `${cssVars.accent}10` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-3 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Get Your Full Analysis
          </h3>
          <p className="text-muted mb-6 text-lg">
            Unlock detailed recommendations, specific fixes, and actionable insights to improve your
            AI search ranking
          </p>
          <button
            className="rounded-lg px-8 py-4 text-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: cssVars.accent }}
            onClick={() => (window.location.href = '/pricing')}
          >
            Upgrade to Pro - $29/month
          </button>
          <p className="text-muted mt-4 text-sm">
            30 analyses per month • Full recommendations • Priority support
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <p className="text-muted mono mb-2 text-sm">{result.url}</p>
        <h2 className="mb-4 text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
          AI Search Readiness Score
        </h2>

        {/* Main Score Circle with Achievement Badge */}
        <div className="relative inline-flex items-center justify-center">
          <svg className="h-48 w-48 -rotate-90 transform">
            <circle cx="96" cy="96" r="88" stroke="var(--border)" strokeWidth="8" fill="none" />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(result.aiSearchScore / 100) * 553} 553`}
              initial={{ strokeDashoffset: 553 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-6xl font-medium"
              style={{ color: 'var(--accent)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              {result.aiSearchScore}
            </motion.div>
            <div className="text-muted text-sm">out of 100</div>
          </div>

          {/* Achievement Badge */}
          {result.aiSearchScore >= 80 && (
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, type: 'spring' }}
            >
              <div className="text-3xl">🏆</div>
            </motion.div>
          )}
        </div>

        <motion.p
          className="text-muted mx-auto mt-4 max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {result.aiSearchScore >= 80
            ? '🌟 Your content is brilliantly optimized for AI search!'
            : result.aiSearchScore >= 60
              ? "💪 Strong foundation - let's polish it to perfection!"
              : '🚀 Exciting journey ahead - huge potential for growth!'}
        </motion.p>
      </div>

      {/* Pillar Breakdown */}
      <div className="space-y-4">
        <motion.h3
          className="mb-6 text-center text-2xl font-medium"
          style={{ color: 'var(--foreground)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Your Strengths & Opportunities 📊
        </motion.h3>

        {scoringResult.breakdown.map((pillar, index) => {
          const info = PILLAR_INFO[pillar.pillar];
          const percentage = (pillar.earned / pillar.max) * 100;

          return (
            <motion.div
              key={pillar.pillar}
              className="card cursor-pointer p-6 transition-all"
              onMouseEnter={() => setHoveredPillar(pillar.pillar)}
              onMouseLeave={() => setHoveredPillar(null)}
              style={{
                borderColor: hoveredPillar === pillar.pillar ? 'var(--accent)' : 'transparent',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{info.icon}</div>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {info.name}
                      </h4>
                      <p className="text-muted text-sm">{info.description}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className="mono text-2xl font-medium"
                        style={{ color: getPillarColor(pillar.earned, pillar.max) }}
                      >
                        {pillar.earned}/{pillar.max}
                      </div>
                      <div className="text-muted text-xs">
                        {getScoreStatus(pillar.earned, pillar.max)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="mt-3 h-2 w-full rounded-full"
                    style={{ backgroundColor: 'var(--gray-200)' }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getPillarColor(pillar.earned, pillar.max),
                      }}
                    />
                  </div>

                  {/* Tooltip on hover */}
                  {hoveredPillar === pillar.pillar && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-muted text-sm">{info.tooltip}</p>

                      {/* Show failed checks */}
                      {Object.entries(pillar.checks).filter(([_, score]) => score === 0).length >
                        0 && (
                        <div className="mt-2">
                          <p className="mb-1 text-xs font-medium">Areas to improve:</p>
                          <ul className="text-muted space-y-1 text-xs">
                            {Object.entries(pillar.checks)
                              .filter(([_, score]) => score === 0)
                              .map(([check]) => (
                                <li key={check}>• {check.replace(/([A-Z])/g, ' $1').trim()}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Readiness - Updated */}
      <motion.div
        className="card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="mb-6 text-center text-lg font-medium" style={{ color: 'var(--foreground)' }}>
          AI Platform Insights
        </h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            {
              name: 'ChatGPT',
              insight:
                result.aiSearchScore >= 70
                  ? 'Likely to cite for how-to queries'
                  : 'Needs better structure for citations',
            },
            {
              name: 'Claude',
              insight:
                result.aiSearchScore >= 75
                  ? 'Strong factual content alignment'
                  : 'Add more primary sources',
            },
            {
              name: 'Perplexity',
              insight:
                scoringResult.pillarScores.FACT_DENSITY >= 20
                  ? 'Good data density for ranking'
                  : 'Add charts, data, and visuals',
            },
            {
              name: 'Gemini',
              insight:
                scoringResult.pillarScores.RETRIEVAL >= 25
                  ? 'Fast access for indexing'
                  : 'Improve page speed & access',
            },
          ].map((platform) => (
            <div key={platform.name} className="text-center">
              <div className="mb-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {platform.name}
              </div>
              <div className="text-muted text-xs">{platform.insight}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
