'use client';

import type { AnalysisResultNew } from '@/lib/analyzer-new';
import PillarScoreDisplay from './PillarScoreDisplay';
import ScoreDifference from './ScoreDifference';

interface ComparisonViewProps {
  results: [AnalysisResultNew, AnalysisResultNew];
}

export default function ComparisonView({ results }: ComparisonViewProps) {
  const [result1, result2] = results;
  
  // Calculate score differences
  const totalScoreDiff = result1.aiSearchScore - result2.aiSearchScore;
  
  return (
    <div className="space-y-8">
      {/* Overall comparison header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
          Website Comparison
        </h2>
        
        {/* Winner announcement */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-lg">
            {totalScoreDiff > 0 ? (
              <span style={{ color: 'var(--success)' }}>
                {new URL(result1.url).hostname} leads by {Math.abs(totalScoreDiff)} points
              </span>
            ) : totalScoreDiff < 0 ? (
              <span style={{ color: 'var(--success)' }}>
                {new URL(result2.url).hostname} leads by {Math.abs(totalScoreDiff)} points
              </span>
            ) : (
              <span className="text-muted">
                Both websites scored equally
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Website 1 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {new URL(result1.url).hostname}
            </h3>
            {totalScoreDiff > 0 && (
              <span className="text-sm px-2 py-1 rounded" style={{ 
                backgroundColor: 'var(--success-bg)', 
                color: 'var(--success)' 
              }}>
                Winner
              </span>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result1} compact />
            {/* Score difference indicators */}
            <div className="absolute -right-2 top-8">
              <ScoreDifference 
                difference={totalScoreDiff} 
                showSign 
              />
            </div>
          </div>
        </div>

        {/* Website 2 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {new URL(result2.url).hostname}
            </h3>
            {totalScoreDiff < 0 && (
              <span className="text-sm px-2 py-1 rounded" style={{ 
                backgroundColor: 'var(--success-bg)', 
                color: 'var(--success)' 
              }}>
                Winner
              </span>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result2} compact />
            {/* Score difference indicators */}
            <div className="absolute -left-2 top-8">
              <ScoreDifference 
                difference={-totalScoreDiff} 
                showSign 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed pillar comparison */}
      <div className="mt-12">
        <h3 className="text-xl font-medium text-center mb-6" style={{ color: 'var(--foreground)' }}>
          Detailed Comparison by Pillar
        </h3>
        
        <div className="space-y-4">
          {Object.entries(result1.scoringResult.breakdown).map(([pillar, score1]) => {
            const score2 = result2.scoringResult.breakdown[pillar as keyof typeof result2.scoringResult.breakdown];
            const diff = score1.score - score2.score;
            
            return (
              <div key={pillar} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {pillar.replace(/_/g, ' ')}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    {/* Website 1 score */}
                    <div className="text-right">
                      <div className="text-sm text-muted">{new URL(result1.url).hostname}</div>
                      <div className="text-lg font-medium" style={{ 
                        color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--error)' : 'var(--foreground)' 
                      }}>
                        {score1.score}/100
                      </div>
                    </div>
                    
                    {/* Difference */}
                    <div className="w-20 text-center">
                      <ScoreDifference difference={diff} />
                    </div>
                    
                    {/* Website 2 score */}
                    <div className="text-left">
                      <div className="text-sm text-muted">{new URL(result2.url).hostname}</div>
                      <div className="text-lg font-medium" style={{ 
                        color: diff < 0 ? 'var(--success)' : diff > 0 ? 'var(--error)' : 'var(--foreground)' 
                      }}>
                        {score2.score}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}