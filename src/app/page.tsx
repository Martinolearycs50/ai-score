'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import AdvancedLoadingState from '@/components/AdvancedLoadingState';
import PillarScoreDisplay from '@/components/PillarScoreDisplay';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { recTemplates } from '@/lib/recommendations';

interface AnalysisStateNew {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: AnalysisResultNew | null;
  error: string | null;
}

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisStateNew>({
    status: 'idle',
    result: null,
    error: null
  });

  const handleAnalyze = async (url: string) => {
    setAnalysisState({
      status: 'loading',
      result: null,
      error: null
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // API now returns the new format directly
      const result = data.data as AnalysisResultNew;

      setAnalysisState({
        status: 'success',
        result: result,
        error: null
      });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch (error) {
      setAnalysisState({
        status: 'error',
        result: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  const handleReset = () => {
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="absolute top-0 left-0 p-8">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          AI Search Optimizer
        </span>
      </header>

      {/* Main Content */}
      <main className="animate-fade-in">
        {analysisState.status === 'idle' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-medium mb-8" style={{ color: 'var(--foreground)' }}>
                AI Search Optimizer
              </h1>
              <p className="text-xl mb-4 text-muted">
                Optimize your content for ChatGPT, Claude, Perplexity & more
              </p>
              <p className="text-sm mb-12 text-muted">
                See how AI platforms understand and rank your content
              </p>
              
              <UrlForm 
                onSubmit={handleAnalyze} 
                isLoading={false}
              />
            </div>
          </div>
        )}

        {analysisState.status === 'loading' && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <AdvancedLoadingState url={analysisState.result?.url} />
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <p className="text-lg mb-4" style={{ color: 'var(--foreground)' }}>
                {analysisState.error}
              </p>
              <button
                onClick={handleReset}
                className="text-muted hover:text-foreground transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <div className="min-h-screen px-6 py-16">
            {/* Back button */}
            <div className="max-w-4xl mx-auto mb-12">
              <button
                onClick={handleReset}
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                ← New analysis
              </button>
            </div>

            <div id="results" className="max-w-4xl mx-auto space-y-8">
              <PillarScoreDisplay result={analysisState.result} />
              
              {/* Enhanced Recommendations Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-medium text-center mb-8" style={{ color: 'var(--foreground)' }}>
                  Recommendations
                </h2>
                
                {analysisState.result.scoringResult.recommendations.length === 0 ? (
                  <div className="card p-12 text-center">
                    <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Excellent AI Optimization!
                    </p>
                    <p className="text-muted">
                      Your website is well-optimized for AI search platforms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisState.result.scoringResult.recommendations.map((rec, index) => {
                      // Get the full template data if available
                      const template = recTemplates[rec.metric];
                      
                      return (
                        <AIRecommendationCard
                          key={index}
                          metric={rec.metric}
                          why={template?.why || rec.why}
                          fix={template?.fix || rec.fix}
                          gain={rec.gain}
                          pillar={rec.pillar}
                          example={template?.example}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}