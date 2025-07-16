'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResultNew } from '@/lib/analyzer-new';

interface PillarScoreDisplayProps {
  result: AnalysisResultNew;
  compact?: boolean;
}

// Pillar metadata with plain language explanations
const PILLAR_INFO = {
  RETRIEVAL: {
    name: 'Retrieval & Access',
    icon: '⚡',
    description: 'How fast AI can access your content',
    tooltip: 'AI systems need quick access to your content. This measures page speed, accessibility, llms.txt presence, and whether content is behind paywalls.',
    maxScore: 25, // UPDATED for 2025
  },
  FACT_DENSITY: {
    name: 'Fact Density',
    icon: '📊',
    description: 'How much useful information per section',
    tooltip: 'AI prioritizes content with facts, data, specific examples, and direct answers after headings. Generic content ranks lower.',
    maxScore: 20, // UPDATED for 2025
  },
  STRUCTURE: {
    name: 'Answer Architecture',
    icon: '📋',
    description: 'Most important for 2025 AI search!',
    tooltip: '🔥 MOST IMPORTANT: Listicles get 32.5% of AI citations! Use numbered titles, lists, comparison tables, and semantic URLs for maximum AI visibility.',
    maxScore: 30, // INCREASED for 2025 - Most important!
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

export default function PillarScoreDisplay({ result, compact = false }: PillarScoreDisplayProps) {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const { scoringResult } = result;

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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="text-center">
        <p className="text-sm text-muted mono mb-2">{result.url}</p>
        <h2 className="text-2xl font-medium mb-4" style={{ color: 'var(--foreground)' }}>
          AI Search Readiness Score
        </h2>
        
        {/* Main Score Circle */}
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
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(result.aiSearchScore / 100) * 553} 553`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-medium" style={{ color: 'var(--accent)' }}>
              {result.aiSearchScore}
            </div>
            <div className="text-sm text-muted">out of 100</div>
          </div>
        </div>
        
        <p className="text-muted mt-4 max-w-md mx-auto">
          {result.aiSearchScore >= 80 
            ? "Your content is highly optimized for AI search platforms"
            : result.aiSearchScore >= 60
            ? "Good foundation with room for improvement"
            : "Significant optimizations needed for AI visibility"}
        </p>
      </div>

      {/* Pillar Breakdown */}
      <div className="space-y-4">
        <motion.h3 
          className="text-lg font-medium text-center mb-6" 
          style={{ color: 'var(--foreground)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Score Breakdown by Pillar
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

      {/* Platform Readiness - Updated */}
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
    </div>
  );
}