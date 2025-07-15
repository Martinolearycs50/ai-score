'use client';

import { useState } from 'react';

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
  RETRIEVAL: '#FF6B6B',
  FACT_DENSITY: '#4ECDC4',
  STRUCTURE: '#45B7D1',
  TRUST: '#96CEB4',
  RECENCY: '#FECA57',
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
    if (gain >= 5) return { label: 'HIGH', color: '#FFA500' };
    return { label: 'MEDIUM', color: 'var(--muted)' };
  };

  const priority = getPriorityLabel(gain);

  return (
    <div className="card overflow-hidden transition-all">
      <button
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Header with priority and points */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-2 py-1 text-xs font-medium rounded"
                style={{
                  backgroundColor: PILLAR_COLORS[pillar] + '20',
                  color: PILLAR_COLORS[pillar],
                }}
              >
                {pillar.replace(/_/g, ' ')}
              </span>
              <span
                className="text-xs font-medium uppercase mono"
                style={{ color: priority.color }}
              >
                {priority.label}
              </span>
              <span className="text-xs mono text-muted">+{gain} points</span>
            </div>

            {/* Title */}
            <h3 className="font-medium text-lg mb-2" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>

            {/* Why it matters */}
            <p className="text-sm text-muted leading-relaxed">{why}</p>

            {/* Quick preview of fix */}
            {!isExpanded && (
              <p className="text-xs text-muted mt-2 opacity-70">
                Click to see how to fix →
              </p>
            )}
          </div>

          {/* Expand icon */}
          <svg
            className={`w-5 h-5 ml-4 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
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
        <div className="px-6 pb-6 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
          {/* How to fix */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              How to fix:
            </h4>
            <p className="text-sm text-muted leading-relaxed">{fix}</p>
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
                  <span className="text-xs font-medium text-red-600">✗ Before</span>
                </div>
                <pre className="text-xs mono p-4 rounded-lg overflow-x-auto" style={{
                  background: '#FEE',
                  color: '#900',
                  border: '1px solid #FCC',
                }}>
                  <code>{example.before}</code>
                </pre>
              </div>

              {/* After */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-600">✓ After</span>
                </div>
                <pre className="text-xs mono p-4 rounded-lg overflow-x-auto" style={{
                  background: '#EFE',
                  color: '#090',
                  border: '1px solid #CFC',
                }}>
                  <code>{example.after}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Implementation details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium">Quick implementation tips:</p>
                <ul className="text-xs text-muted space-y-1">
                  {gain >= 10 && (
                    <li>• This is a high-impact change that will significantly improve AI visibility</li>
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
                  {pillar === 'TRUST' && (
                    <li>• Consistency across your site builds credibility</li>
                  )}
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