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
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellent!</h3>
        <p className="text-gray-600">
          Your website is well-optimized for AI search platforms.
        </p>
      </div>
    );
  }

  const getPriorityStyle = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-50';
      case 'high':
        return 'text-orange-700 bg-orange-50';
      case 'medium':
        return 'text-indigo-700 bg-indigo-50';
      case 'low':
        return 'text-gray-700 bg-gray-50';
    }
  };

  const getDifficultyBadge = (difficulty: Recommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const isExpanded = expandedId === rec.id;

        return (
          <div key={rec.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              onClick={() => setExpandedId(isExpanded ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${getPriorityStyle(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-gray-600 text-sm">
                        {rec.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-gray-500">
                          Impact: <strong className="text-gray-900">+{rec.impact_score} points</strong>
                        </span>
                        <span className={`px-2 py-1 rounded ${getDifficultyBadge(rec.difficulty)}`}>
                          {rec.difficulty}
                        </span>
                        <span className="text-gray-500">{rec.estimated_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
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
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {rec.platform_benefits.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits these platforms:</h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.platform_benefits.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rec.code_example && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Example:</h5>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                      <code>{rec.code_example}</code>
                    </pre>
                  </div>
                )}

                {rec.documentation_link && (
                  <a
                    href={rec.documentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm"
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
      <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
        {['critical', 'high', 'medium', 'low'].map((priority) => {
          const count = recommendations.filter(r => r.priority === priority).length;
          
          return (
            <div key={priority} className="text-center">
              <div className={`text-2xl font-semibold ${
                priority === 'critical' ? 'text-red-600' :
                priority === 'high' ? 'text-orange-600' :
                priority === 'medium' ? 'text-indigo-600' :
                'text-gray-600'
              }`}>
                {count}
              </div>
              <div className="text-gray-500 text-xs capitalize">{priority}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}