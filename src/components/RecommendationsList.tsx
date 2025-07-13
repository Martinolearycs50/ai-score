'use client';

import { useState } from 'react';
import type { Recommendation } from '@/lib/types';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (recommendations.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Excellent!
        </p>
        <p className="text-muted">
          Your website is well-optimized for AI search platforms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-medium text-center mb-8" style={{ color: 'var(--foreground)' }}>
        Recommendations
      </h2>
      
      {recommendations.map((rec) => {
        const isExpanded = expandedId === rec.id;

        return (
          <div key={rec.id} className="card overflow-hidden">
            <button
              className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium uppercase mono" style={{ 
                      color: rec.priority === 'critical' ? 'var(--error)' : 'var(--muted)' 
                    }}>
                      {rec.priority}
                    </span>
                    <span className="text-xs mono text-muted">
                      +{rec.impact_score} points
                    </span>
                  </div>
                  
                  <h3 className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    {rec.title}
                  </h3>
                  
                  <p className="text-sm text-muted">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs mono text-muted">
                    <span>{rec.difficulty}</span>
                    <span>•</span>
                    <span>{rec.estimated_time}</span>
                  </div>
                </div>
                
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

            {isExpanded && (
              <div className="px-6 pb-6 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
                {rec.platform_benefits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Benefits these platforms:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {rec.platform_benefits.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs mono px-3 py-1 rounded-full"
                          style={{ 
                            background: 'var(--background)',
                            color: 'var(--muted)'
                          }}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.code_example && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Example:
                    </p>
                    <pre className="text-xs mono p-4 rounded-lg overflow-x-auto" style={{ 
                      background: 'var(--foreground)',
                      color: 'var(--card)'
                    }}>
                      <code>{rec.code_example}</code>
                    </pre>
                  </div>
                )}

                {rec.documentation_link && (
                  <a
                    href={rec.documentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}