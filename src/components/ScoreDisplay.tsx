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

  return (
    <div className="space-y-8">
      {/* URL */}
      <div className="text-center">
        <p className="text-sm text-muted mono mb-2">{url}</p>
        <h2 className="text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
          Analysis Results
        </h2>
      </div>

      {/* Overall Score Card */}
      <div className="card p-12 text-center">
        <div className="text-7xl font-medium mb-4" style={{ color: 'var(--accent)' }}>
          {overall_score}
        </div>
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          {scoreRange.label}
        </p>
        <p className="text-muted max-w-md mx-auto">
          {scoreRange.description}
        </p>
      </div>

      {/* Category Scores */}
      <div className="grid gap-4">
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
          <div key={category.name} className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  {category.name}
                </h3>
                <p className="text-sm text-muted">{category.description}</p>
              </div>
              <div className="text-2xl font-medium mono" style={{ color: 'var(--accent)' }}>
                {category.score}/25
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Readiness */}
      <div className="card p-8">
        <h3 className="text-lg font-medium mb-6 text-center" style={{ color: 'var(--foreground)' }}>
          AI Platform Readiness
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'ChatGPT', ready: overall_score >= 70 },
            { name: 'Claude', ready: overall_score >= 75 },
            { name: 'Perplexity', ready: overall_score >= 65 },
            { name: 'Gemini', ready: overall_score >= 70 }
          ].map((platform) => (
            <div key={platform.name} className="text-center">
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                {platform.name}
              </div>
              <div className="text-xs mono" style={{ 
                color: platform.ready ? 'var(--accent)' : 'var(--muted)' 
              }}>
                {platform.ready ? 'Ready' : 'Not ready'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}