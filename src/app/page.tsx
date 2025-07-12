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

      // Scroll to results
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="var(--accent)"/>
                <path d="M16 8L8 20H24L16 8Z" fill="white" opacity="0.9"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
              <span className="font-semibold text-lg">AI Search Analyzer</span>
            </div>
            
            {analysisState.status !== 'idle' && (
              <button
                onClick={handleReset}
                className="btn btn-secondary"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {analysisState.status === 'idle' && (
          <section className="section">
            <div className="container">
              {/* Hero */}
              <div className="text-center mb-12">
                <h1 className="mb-4">
                  Is your website ready for AI search?
                </h1>
                <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
                  Analyze how ChatGPT, Claude, Perplexity, and Gemini see your website. 
                  Get actionable insights to improve your AI search visibility.
                </p>
              </div>

              {/* URL Form */}
              <div className="max-w-2xl mx-auto mb-16">
                <UrlForm 
                  onSubmit={handleAnalyze} 
                  isLoading={false}
                />
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Crawler Analysis</h3>
                  <p className="text-foreground-muted text-small">
                    Check AI bot access and permissions for your content
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="m7 16 5-5 5 5"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Content Scoring</h3>
                  <p className="text-foreground-muted text-small">
                    Measure structure, readability, and optimization
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <p className="text-foreground-muted text-small">
                    Get specific actions to improve AI visibility
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'loading' && (
          <section className="section">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <LoadingState url={analysisState.result?.url} />
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'error' && (
          <section className="section">
            <div className="container">
              <div className="max-w-md mx-auto text-center">
                <div className="card">
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
                  <p className="text-foreground-secondary mb-6">
                    {analysisState.error}
                  </p>
                  <button
                    onClick={handleReset}
                    className="btn btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <section id="results" className="section">
            <div className="container">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Score Display */}
                <ScoreDisplay result={analysisState.result} />
                
                {/* Recommendations */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-6">Recommendations</h2>
                  <RecommendationsList recommendations={analysisState.result.recommendations} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container py-8">
          <div className="text-center text-foreground-muted text-small">
            <p>AI Search Analyzer • Optimize for AI search platforms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}