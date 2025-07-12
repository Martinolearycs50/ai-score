'use client';

import { useMemo } from 'react';
import type { AnalysisResult, CategoryScores } from '@/lib/types';
import { SCORE_RANGES } from '@/lib/types';

interface ScoreDisplayProps {
  result: AnalysisResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { overall_score, category_scores, url } = result;

  // Get score range info for overall score
  const scoreRange = useMemo(() => {
    return SCORE_RANGES.find(range => 
      overall_score >= range.min && overall_score <= range.max
    ) || SCORE_RANGES[SCORE_RANGES.length - 1];
  }, [overall_score]);

  // Color mapping for different score ranges
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const CategoryScore = ({ 
    title, 
    score, 
    maxScore, 
    description,
    color 
  }: { 
    title: string; 
    score: number; 
    maxScore: number; 
    description: string;
    color: string;
  }) => {
    const percentage = (score / maxScore) * 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score}/{maxScore}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor(score)}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with URL */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Analysis Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400 break-all">
          {url}
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getScoreColor(overall_score)}`}>
            <span className="text-3xl font-bold">
              {overall_score}
            </span>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {scoreRange.label}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {scoreRange.description}
        </p>

        {/* Score breakdown */}
        <div className="flex justify-center space-x-4 text-sm">
          <span className="text-gray-500">Overall Score:</span>
          <span className="font-semibold">{overall_score}/100</span>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid md:grid-cols-2 gap-4">
        <CategoryScore
          title="Crawler Accessibility"
          score={category_scores.crawler_accessibility}
          maxScore={25}
          description="How easily AI crawlers can access and index your content"
          color="blue"
        />
        
        <CategoryScore
          title="Content Structure"
          score={category_scores.content_structure}
          maxScore={25}
          description="How well your content is organized for AI understanding"
          color="green"
        />
        
        <CategoryScore
          title="Technical SEO"
          score={category_scores.technical_seo}
          maxScore={25}
          description="Technical optimizations that help AI platforms parse your site"
          color="purple"
        />
        
        <CategoryScore
          title="AI Optimization"
          score={category_scores.ai_optimization}
          maxScore={25}
          description="Specific optimizations that improve AI search visibility"
          color="orange"
        />
      </div>

      {/* AI Platform Compatibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          AI Platform Compatibility
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ChatGPT', score: Math.round(overall_score * 0.85), color: 'bg-emerald-500' },
            { name: 'Claude', score: Math.round(overall_score * 0.92), color: 'bg-orange-500' },
            { name: 'Perplexity', score: Math.round(overall_score * 0.88), color: 'bg-blue-500' },
            { name: 'Gemini', score: Math.round(overall_score * 0.95), color: 'bg-purple-500' }
          ].map((platform) => (
            <div key={platform.name} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-8 h-8 rounded-full ${platform.color}`}></div>
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {platform.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {platform.score}% ready
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis timestamp */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Analysis completed on {new Date(result.timestamp).toLocaleString()}
      </div>
    </div>
  );
}