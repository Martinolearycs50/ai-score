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
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <div className="text-green-600 dark:text-green-400 text-4xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          Excellent! No critical issues found
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Your website is well-optimized for AI search platforms. Keep up the great work!
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
          icon: '🚨'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
          icon: '⚠️'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
          icon: '💡'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
          icon: '📈'
        };
    }
  };

  const getDifficultyIcon = (difficulty: Recommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Optimization Recommendations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} to improve your AI search readiness
        </p>
      </div>

      {recommendations.map((rec) => {
        const colors = getPriorityColor(rec.priority);
        const isExpanded = expandedId === rec.id;

        return (
          <div
            key={rec.id}
            className={`${colors.bg} ${colors.border} border rounded-lg overflow-hidden transition-all duration-200`}
          >
            {/* Header */}
            <div
              className="p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
              onClick={() => toggleExpanded(rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{colors.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {rec.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                      {rec.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>Impact:</span>
                      <span className="font-medium">+{rec.impact_score} points</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>Difficulty:</span>
                      <span className="flex items-center space-x-1">
                        <span>{getDifficultyIcon(rec.difficulty)}</span>
                        <span className="font-medium capitalize">{rec.difficulty}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>Time:</span>
                      <span className="font-medium">{rec.estimated_time}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="ml-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(rec.id);
                  }}
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-current/10 p-4 bg-white/30 dark:bg-black/20">
                {/* Platform Benefits */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Benefits these AI platforms:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.platform_benefits.map((platform) => (
                      <span
                        key={platform}
                        className="px-2 py-1 bg-white/60 dark:bg-black/40 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Code Example */}
                {rec.code_example && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Implementation Example:
                    </h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{rec.code_example}</code>
                    </pre>
                  </div>
                )}

                {/* Documentation Link */}
                {rec.documentation_link && (
                  <div>
                    <a
                      href={rec.documentation_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      <span>📚 Learn more</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Quick Summary:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {['critical', 'high', 'medium', 'low'].map((priority) => {
            const count = recommendations.filter(r => r.priority === priority).length;
            const colors = getPriorityColor(priority as Recommendation['priority']);
            
            return (
              <div key={priority} className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full ${colors.badge} font-medium`}>
                  {count}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
                  {priority}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}