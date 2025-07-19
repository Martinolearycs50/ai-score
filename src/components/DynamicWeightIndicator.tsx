'use client';

import { useState } from 'react';
import type { PillarScores } from '@/lib/types';

interface DynamicWeightIndicatorProps {
  weights: Record<keyof PillarScores, number>;
  pageType: string;
}

const PILLAR_INFO: Record<keyof PillarScores, { name: string; icon: string; color: string }> = {
  RETRIEVAL: {
    name: 'Speed & Access',
    icon: '⚡',
    color: 'blue'
  },
  FACT_DENSITY: {
    name: 'Information Richness',
    icon: '📊',
    color: 'purple'
  },
  STRUCTURE: {
    name: 'Content Organization',
    icon: '🏗️',
    color: 'green'
  },
  TRUST: {
    name: 'Credibility',
    icon: '🛡️',
    color: 'yellow'
  },
  RECENCY: {
    name: 'Freshness',
    icon: '🌱',
    color: 'pink'
  }
};

export default function DynamicWeightIndicator({ weights, pageType }: DynamicWeightIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total weight to show percentage
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Dynamic Scoring Active</h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Weights adjusted for {pageType} pages
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Hide' : 'Show'} weights
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2 mt-4">
          {(Object.keys(weights) as Array<keyof PillarScores>).map((pillar) => {
            const weight = weights[pillar];
            const percentage = Math.round((weight / totalWeight) * 100);
            const info = PILLAR_INFO[pillar];
            
            return (
              <div key={pillar} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{info.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{info.name}</span>
                    <span className="text-xs text-gray-500">{weight} pts ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${info.color}-500 transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700">Total Points</span>
              <span className="font-bold text-gray-900">{totalWeight}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}