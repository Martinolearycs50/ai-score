'use client';

import { useState } from 'react';

import type { PillarScores } from '@/lib/types';

interface DynamicWeightIndicatorProps {
  weights: Record<keyof PillarScores, number>;
  pageType: string;
}

const PILLAR_INFO: Record<
  keyof PillarScores,
  {
    name: string;
    icon: string;
    color: string;
  }
> = {
  RETRIEVAL: {
    name: 'Speed & Access',
    icon: '⚡',
    color: 'var(--accent)',
  },
  FACT_DENSITY: {
    name: 'Information Richness',
    icon: '📊',
    color: 'var(--primary)',
  },
  STRUCTURE: {
    name: 'Content Organization',
    icon: '🏗️',
    color: 'var(--success)',
  },
  TRUST: {
    name: 'Credibility',
    icon: '🛡️',
    color: 'var(--warning)',
  },
  RECENCY: {
    name: 'Freshness',
    icon: '🌱',
    color: 'var(--journey)',
  },
};

export default function DynamicWeightIndicator({ weights, pageType }: DynamicWeightIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total weight to show percentage
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="border-default rounded-lg border bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-foreground text-sm font-medium">Dynamic Scoring Active</h4>
          <p className="text-body mt-0.5 text-xs">Weights adjusted for {pageType} pages</p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-accent text-sm font-medium hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          {showDetails ? 'Hide' : 'Show'} weights
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-2">
          {(Object.keys(weights) as Array<keyof PillarScores>).map((pillar) => {
            const weight = weights[pillar];
            const percentage = Math.round((weight / totalWeight) * 100);
            const info = PILLAR_INFO[pillar];

            return (
              <div key={pillar} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg">{info.icon}</span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-body text-xs font-medium">{info.name}</span>
                    <span className="text-muted text-xs">
                      {weight}pts ({percentage}%)
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{ backgroundColor: 'var(--gray-200)' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: info.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="border-default mt-3 border-t pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-body font-medium">Total Points</span>
              <span className="text-foreground font-bold">{totalWeight}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
