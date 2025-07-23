'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

interface AIRecommendationCardProps {
  metric: string;
  why: string;
  fix: string;
  gain: number;
  pillar: string;
  example?: {
    before: string;
    after: string;
  };
}

// Pillar colors for visual distinction
const PILLAR_COLORS: Record<string, string> = {
  RETRIEVAL: cssVars.error,
  FACT_DENSITY: cssVars.accent,
  STRUCTURE: cssVars.primary,
  TRUST: cssVars.success,
  RECENCY: cssVars.warning,
};

export default function AIRecommendationCard({
  metric,
  why,
  fix,
  gain,
  pillar,
  example,
}: AIRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert camelCase metric to readable title
  const title = metric
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());

  const getPriorityLabel = (gain: number) => {
    if (gain >= 10) return { label: 'CRITICAL', color: 'var(--error)' };
    if (gain >= 5) return { label: 'HIGH', color: cssVars.warning };
    return { label: 'MEDIUM', color: 'var(--muted)' };
  };

  const priority = getPriorityLabel(gain);

  return (
    <div className="card overflow-hidden transition-all">
      <button
        className="w-full p-6 text-left transition-colors hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header with priority and points */}
            <div className="mb-3 flex items-center gap-3">
              <span
                className="rounded px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: PILLAR_COLORS[pillar] + '20',
                  color: PILLAR_COLORS[pillar],
                }}
              >
                {pillar.replace(/_/g, ' ')}
              </span>
              <span
                className="mono text-xs font-medium uppercase"
                style={{ color: priority.color }}
              >
                {priority.label}
              </span>
              <span className="mono text-muted text-xs">+{gain} points</span>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-medium" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>

            {/* Why it matters */}
            <p className="text-muted text-sm leading-relaxed">{why}</p>

            {/* Quick preview of fix */}
            {!isExpanded && (
              <p className="text-muted mt-2 text-xs opacity-70">Click to see how to fix →</p>
            )}
          </div>

          {/* Expand icon */}
          <svg
            className={`ml-4 h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--muted)"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pt-0 pb-6" style={{ borderTop: '1px solid var(--border)' }}>
          {/* How to fix */}
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              How to fix:
            </h4>
            <p className="text-muted text-sm leading-relaxed">{fix}</p>
          </div>

          {/* Before/After Example */}
          {example && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Example:
              </h4>

              {/* Before */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: cssVars.error }}>
                    ✗ Before
                  </span>
                </div>
                <pre
                  className="mono overflow-x-auto rounded-lg p-4 text-xs"
                  style={{
                    background: `${cssVars.error}10`,
                    color: cssVars.error,
                    border: `1px solid ${cssVars.error}30`,
                  }}
                >
                  <code>{example.before}</code>
                </pre>
              </div>

              {/* After */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: cssVars.success }}>
                    ✓ After
                  </span>
                </div>
                <pre
                  className="mono overflow-x-auto rounded-lg p-4 text-xs"
                  style={{
                    background: `${cssVars.success}10`,
                    color: cssVars.success,
                    border: `1px solid ${cssVars.success}30`,
                  }}
                >
                  <code>{example.after}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Implementation details */}
          <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: `${cssVars.muted}10` }}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium">Quick implementation tips:</p>
                <ul className="text-muted space-y-1 text-xs">
                  {gain >= 10 && (
                    <li>
                      • This is a high-impact change that will significantly improve AI visibility
                    </li>
                  )}
                  {pillar === 'RETRIEVAL' && (
                    <li>• Test with PageSpeed Insights after implementing</li>
                  )}
                  {pillar === 'FACT_DENSITY' && (
                    <li>• Focus on adding specific numbers, dates, and verifiable facts</li>
                  )}
                  {pillar === 'STRUCTURE' && (
                    <li>• Use semantic HTML tags for better AI comprehension</li>
                  )}
                  {pillar === 'TRUST' && <li>• Consistency across your site builds credibility</li>}
                  {pillar === 'RECENCY' && (
                    <li>• Set up a content review schedule to maintain freshness</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
