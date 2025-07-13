'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import LoadingState from '@/components/LoadingState';
import ScoreDisplay from '@/components/ScoreDisplay';
import RecommendationsList from '@/components/RecommendationsList';
import type { AnalysisState } from '@/lib/types';

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
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

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisState({
        status: 'success',
        result: data.data,
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
      console.error('Analysis error:', error);
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
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 p-8">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          AI Search
        </span>
      </header>

      {/* Main Content */}
      <main className="animate-fade-in">
        {analysisState.status === 'idle' && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-medium mb-8" style={{ color: 'var(--foreground)' }}>
                AI Search Analysis
              </h1>
              <p className="text-xl mb-12 text-muted">
                See how AI platforms understand your website
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
            <LoadingState url={analysisState.result?.url} />
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
              <ScoreDisplay result={analysisState.result} />
              <RecommendationsList recommendations={analysisState.result.recommendations} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}