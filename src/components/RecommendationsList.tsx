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
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Excellent!</h3>
        <p className="text-foreground-secondary">
          Your website is well-optimized for AI search platforms.
        </p>
      </div>
    );
  }

  const getPriorityStyle = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-accent';
      case 'low':
        return 'text-foreground-secondary';
    }
  };

  const getDifficultyBadge = (difficulty: Recommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/10 text-success';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'hard':
        return 'bg-error/10 text-error';
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const isExpanded = expandedId === rec.id;

        return (
          <div key={rec.id} className="border border-border rounded-lg overflow-hidden">
            <button
              className="w-full p-4 text-left hover:bg-surface transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className={`text-sm font-semibold uppercase ${getPriorityStyle(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{rec.title}</h4>
                      <p className="text-foreground-secondary text-small">
                        {rec.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-foreground-muted">
                          Impact: <strong className="text-foreground">+{rec.impact_score} points</strong>
                        </span>
                        <span className={`px-2 py-1 rounded ${getDifficultyBadge(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                        <span className="text-foreground-muted">{rec.estimated_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <svg
                  className={`w-5 h-5 text-foreground-muted transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-4 bg-surface">
                {rec.platform_benefits.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-small font-medium mb-2">Benefits these platforms:</h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.platform_benefits.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-accent-light text-accent text-xs rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.code_example && (
                  <div className="mb-4">
                    <h5 className="text-small font-medium mb-2">Example:</h5>
                    <pre className="bg-foreground text-background p-3 rounded text-xs overflow-x-auto">
                      <code>{rec.code_example}</code>
                    </pre>
                  </div>
                )}

                {rec.documentation_link && (
                  <a
                    href={rec.documentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:text-accent-hover text-small"
                  >
                    Learn more
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-surface rounded-lg">
        {['critical', 'high', 'medium', 'low'].map((priority) => {
          const count = recommendations.filter(r => r.priority === priority).length;
          
          return (
            <div key={priority} className="text-center">
              <div className={`text-2xl font-semibold ${getPriorityStyle(priority as Recommendation['priority'])}`}>
                {count}
              </div>
              <div className="text-foreground-muted text-xs capitalize">{priority}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}