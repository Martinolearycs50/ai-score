'use client';

import { useMemo } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { SCORE_RANGES } from '@/lib/types';

interface ScoreDisplayProps {
  result: AnalysisResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { overall_score, category_scores } = result;

  const scoreRange = useMemo(() => {
    return SCORE_RANGES.find(range => 
      overall_score >= range.min && overall_score <= range.max
    ) || SCORE_RANGES[SCORE_RANGES.length - 1];
  }, [overall_score]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-indigo-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-indigo-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getProgressWidth = (score: number, max: number) => {
    return `${Math.min((score / max) * 100, 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <div className="inline-flex flex-col items-center">
          <div className={`text-6xl font-bold ${getScoreColor(overall_score)} mb-2`}>
            {overall_score}
          </div>
          <div className="text-gray-500 text-sm mb-2">out of 100</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{scoreRange.label}</h3>
          <p className="text-gray-600 max-w-md">{scoreRange.description}</p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Score Breakdown</h3>
        
        <div className="space-y-4">
          {[
            {
              name: 'Crawler Accessibility',
              score: category_scores.crawler_accessibility,
              description: 'AI bot access and permissions'
            },
            {
              name: 'Content Structure',
              score: category_scores.content_structure,
              description: 'Content organization and hierarchy'
            },
            {
              name: 'Technical SEO',
              score: category_scores.technical_seo,
              description: 'Meta tags and schema markup'
            },
            {
              name: 'AI Optimization',
              score: category_scores.ai_optimization,
              description: 'Platform-specific optimizations'
            }
          ].map((category) => (
            <div key={category.name}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-gray-500 text-xs">{category.description}</div>
                </div>
                <div className={`font-semibold ${getScoreColor(category.score * 4)}`}>
                  {category.score}/25
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(category.score * 4)} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: getProgressWidth(category.score, 25) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Readiness */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Platform Readiness</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ChatGPT', ready: overall_score >= 70 },
            { name: 'Claude', ready: overall_score >= 75 },
            { name: 'Perplexity', ready: overall_score >= 65 },
            { name: 'Gemini', ready: overall_score >= 70 }
          ].map((platform) => (
            <div key={platform.name} className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                platform.ready ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {platform.ready ? (
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900">{platform.name}</div>
              <div className={`text-xs ${platform.ready ? 'text-green-600' : 'text-red-600'}`}>
                {platform.ready ? 'Ready' : 'Needs work'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}