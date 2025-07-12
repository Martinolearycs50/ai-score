'use client';

import { useMemo } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { SCORE_RANGES } from '@/lib/types';

interface ScoreDisplayProps {
  result: AnalysisResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const { overall_score, category_scores, url } = result;

  const scoreRange = useMemo(() => {
    return SCORE_RANGES.find(range => 
      overall_score >= range.min && overall_score <= range.max
    ) || SCORE_RANGES[SCORE_RANGES.length - 1];
  }, [overall_score]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-accent';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getProgressWidth = (score: number, max: number) => {
    return `${Math.min((score / max) * 100, 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="card text-center">
        <div className="inline-flex flex-col items-center">
          <div className={`text-6xl font-semibold ${getScoreColor(overall_score)} mb-2`}>
            {overall_score}
          </div>
          <div className="text-foreground-muted text-small mb-2">out of 100</div>
          <h3 className="text-xl font-semibold mb-2">{scoreRange.label}</h3>
          <p className="text-foreground-secondary max-w-md">{scoreRange.description}</p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6">Score Breakdown</h3>
        
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
                  <div className="font-medium">{category.name}</div>
                  <div className="text-foreground-muted text-xs">{category.description}</div>
                </div>
                <div className={`font-semibold ${getScoreColor(category.score * 4)}`}>
                  {category.score}/25
                </div>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                  style={{ width: getProgressWidth(category.score, 25) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Readiness */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI Platform Readiness</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ChatGPT', ready: overall_score >= 70 },
            { name: 'Claude', ready: overall_score >= 75 },
            { name: 'Perplexity', ready: overall_score >= 65 },
            { name: 'Gemini', ready: overall_score >= 70 }
          ].map((platform) => (
            <div key={platform.name} className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                platform.ready ? 'bg-success/10' : 'bg-error/10'
              }`}>
                {platform.ready ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="text-small font-medium">{platform.name}</div>
              <div className={`text-xs ${platform.ready ? 'text-success' : 'text-error'}`}>
                {platform.ready ? 'Ready' : 'Needs work'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}