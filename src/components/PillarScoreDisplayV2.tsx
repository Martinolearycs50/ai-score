'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { getPerformanceRating, getRatingColor, getRatingEmoji, PILLAR_DISPLAY_NAMES } from '@/lib/performanceRatings';
import { useTier } from '@/hooks/useTier';

interface PillarScoreDisplayV2Props {
  result: AnalysisResultNew;
  compact?: boolean;
}

// This is the new version using feature flags instead of tier prop
export default function PillarScoreDisplayV2({ result, compact = false }: PillarScoreDisplayV2Props) {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const { scoringResult } = result;
  const { features } = useTier();

  const getScoreColor = (earned: number, max: number) => {
    const percentage = (earned / max) * 100;
    if (percentage >= 80) return 'var(--accent)';
    if (percentage >= 60) return '#FFA500';
    return '#FF4444';
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
          <div className="text-4xl font-medium mb-2" style={{ color: 'var(--accent)' }}>
            {result.aiSearchScore}
          </div>
          <div className="text-sm text-muted">AI Search Score</div>
        </div>
        
        {/* Show detailed breakdown only if feature is enabled */}
        {features.showPillarBreakdown && (
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
                    <span className="text-muted">{pillar.earned}/{pillar.max}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getScoreColor(pillar.earned, pillar.max),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Free tier - simplified rating display
  if (!features.showDetailedScores) {
    return (
      <div className="space-y-8">
        {/* Overall Score Only */}
        <div className="text-center">
          <h2 className="text-3xl font-medium mb-8" style={{ color: 'var(--foreground)' }}>
            Your AI Search Score
          </h2>
          
          {/* Score Meter Display */}
          <div className="relative max-w-md mx-auto mb-8">
            {/* Background Circle */}
            <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeDasharray="565.48"
                className="transform -rotate-90 origin-center"
              />
              {/* Score Arc */}
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={result.aiSearchScore >= 70 ? '#10B981' : result.aiSearchScore >= 40 ? '#F59E0B' : '#EF4444'}
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 565.48" }}
                animate={{ strokeDasharray: `${(result.aiSearchScore / 100) * 565.48} 565.48` }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="transform -rotate-90 origin-center"
              />
            </svg>
            
            {/* Score Number in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="text-6xl font-bold" 
                style={{ color: result.aiSearchScore >= 70 ? '#10B981' : result.aiSearchScore >= 40 ? '#F59E0B' : '#EF4444' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {result.aiSearchScore}
              </motion.div>
            </div>
          </div>
          <div className="text-lg text-muted mb-8">out of 100</div>
          
          {/* Simple Rating Summary */}
          <div className="mb-8">
            <p className="text-xl" style={{ color: 'var(--foreground)' }}>
              {result.aiSearchScore >= 70 
                ? "Great job! Your content is well-optimized for AI search."
                : result.aiSearchScore >= 40
                ? "Good start! There's room to improve your AI visibility."
                : "Your content needs optimization for AI search engines."}
            </p>
          </div>
        </div>

        {/* Simple Ratings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
          {scoringResult.breakdown.map((pillar) => {
            const rating = getPerformanceRating(pillar.earned, pillar.max);
            const displayName = PILLAR_DISPLAY_NAMES[pillar.pillar];
            
            return (
              <div
                key={pillar.pillar}
                className="text-center p-3"
              >
                <div className="text-sm text-muted mb-1">{displayName}</div>
                <div className={`font-medium ${getRatingColor(rating)}`}>
                  {rating}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA - only show if feature is enabled */}
        {features.showUpgradeCTA && (
          <motion.div 
            className="bg-blue-50 rounded-lg p-8 text-center max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
              Get Your Full Analysis
            </h3>
            <p className="text-lg text-muted mb-6">
              Unlock detailed recommendations, specific fixes, and actionable insights to improve your AI search ranking
            </p>
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              onClick={() => window.location.href = '/pricing?from=results'}
            >
              Upgrade to Pro - $39/month
            </button>
            <p className="text-sm text-muted mt-4">
              30 analyses per month • Full recommendations • Priority support
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // Pro tier - full detailed display
  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <p className="text-sm text-muted mono mb-2">{result.url}</p>
        <h2 className="text-3xl font-medium mb-6" style={{ color: 'var(--foreground)' }}>
          AI Search Readiness Score
        </h2>
        
        {/* Main Score Circle with Achievement Badge */}
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="var(--border)"
              strokeWidth="8"
              fill="none"
            />
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
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              className="text-6xl font-medium" 
              style={{ color: 'var(--accent)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              {result.aiSearchScore}
            </motion.div>
            <div className="text-sm text-muted">out of 100</div>
          </div>
          
          {/* Achievement Badge - only if particle effects are enabled */}
          {features.showParticleEffects && result.aiSearchScore >= 80 && (
            <motion.div 
              className="absolute -top-2 -right-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, type: "spring" }}
            >
              <div className="text-3xl">🏆</div>
            </motion.div>
          )}
        </div>
        
        <motion.p 
          className="text-lg text-muted mt-6 max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {result.aiSearchScore >= 80 
            ? "Your content is brilliantly optimized for AI search"
            : result.aiSearchScore >= 60
            ? "Strong foundation with room for improvement"
            : "Significant optimization opportunities available"}
        </motion.p>
      </div>

      {/* Pillar Breakdown - only if feature is enabled */}
      {features.showPillarBreakdown && (
        <div className="space-y-4">
          <motion.h3 
            className="text-2xl font-medium text-center mb-6" 
            style={{ color: 'var(--foreground)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your Strengths & Opportunities
          </motion.h3>
          
          {scoringResult.breakdown.map((pillar, index) => {
            const info = PILLAR_INFO[pillar.pillar];
            const percentage = (pillar.earned / pillar.max) * 100;
            
            return (
              <motion.div
                key={pillar.pillar}
                className="card p-6 transition-all cursor-pointer"
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {info.name}
                        </h4>
                        <p className="text-sm text-muted">{info.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-medium mono" style={{ 
                          color: getScoreColor(pillar.earned, pillar.max) 
                        }}>
                          {pillar.earned}/{pillar.max}
                        </div>
                        <div className="text-xs text-muted">
                          {getScoreStatus(pillar.earned, pillar.max)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getScoreColor(pillar.earned, pillar.max),
                        }}
                      />
                    </div>
                    
                    {/* Tooltip on hover */}
                    {hoveredPillar === pillar.pillar && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted">{info.tooltip}</p>
                        
                        {/* Show failed checks */}
                        {Object.entries(pillar.checks).filter(([_, score]) => score === 0).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Areas to improve:</p>
                            <ul className="text-xs text-muted space-y-1">
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
      )}

      {/* Platform Readiness - only if detailed scores are enabled */}
      {features.showDetailedScores && (
        <motion.div 
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium mb-6 text-center" style={{ color: 'var(--foreground)' }}>
            AI Platform Insights
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                name: 'ChatGPT', 
                insight: result.aiSearchScore >= 70 
                  ? 'Likely to cite for how-to queries' 
                  : 'Needs better structure for citations'
              },
              { 
                name: 'Claude', 
                insight: result.aiSearchScore >= 75 
                  ? 'Strong factual content alignment' 
                  : 'Add more primary sources'
              },
              { 
                name: 'Perplexity', 
                insight: scoringResult.pillarScores.FACT_DENSITY >= 20 
                  ? 'Good data density for ranking' 
                  : 'Add charts, data, and visuals'
              },
              { 
                name: 'Gemini', 
                insight: scoringResult.pillarScores.RETRIEVAL >= 25 
                  ? 'Fast access for indexing' 
                  : 'Improve page speed & access'
              }
            ].map((platform) => (
              <div key={platform.name} className="text-center">
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  {platform.name}
                </div>
                <div className="text-xs text-muted">
                  {platform.insight}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Pillar metadata (copied from original, should be imported from a shared file)
const PILLAR_INFO = {
  RETRIEVAL: {
    name: 'Retrieval & Access',
    icon: '⚡',
    description: 'How fast AI can access your content',
    tooltip: 'AI systems need quick access to your content. This measures page speed, accessibility, llms.txt presence, and whether content is behind paywalls.',
    maxScore: 25,
  },
  FACT_DENSITY: {
    name: 'Fact Density',
    icon: '📊',
    description: 'How much useful information per section',
    tooltip: 'AI prioritizes content with facts, data, specific examples, and direct answers after headings. Generic content ranks lower.',
    maxScore: 20,
  },
  STRUCTURE: {
    name: 'Answer Architecture',
    icon: '📋',
    description: 'Most important for 2025 AI search!',
    tooltip: '🔥 MOST IMPORTANT: Listicles get 32.5% of AI citations! Use numbered titles, lists, comparison tables, and semantic URLs for maximum AI visibility.',
    maxScore: 30,
  },
  TRUST: {
    name: 'Trust & Authority',
    icon: '✓',
    description: 'Credibility signals AI looks for',
    tooltip: 'AI needs to verify credibility through author info, citations, and domain authority.',
    maxScore: 15,
  },
  RECENCY: {
    name: 'Freshness',
    icon: '🔄',
    description: 'How up-to-date your content is',
    tooltip: 'Recent content is preferred for current topics. Shows last updated dates and content freshness.',
    maxScore: 10,
  },
};