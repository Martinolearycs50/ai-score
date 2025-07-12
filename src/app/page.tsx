'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import LoadingState from '@/components/LoadingState';
import ScoreDisplay from '@/components/ScoreDisplay';
import RecommendationsList from '@/components/RecommendationsList';
import { Search, BarChart3, Zap } from 'lucide-react';
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
      <header className="border-b border-border-light bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                AI Search Analyzer
              </h1>
            </div>
            
            {analysisState.status !== 'idle' && (
              <button
                onClick={handleReset}
                className="btn btn-secondary text-sm"
              >
                ← New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {analysisState.status === 'idle' && (
          <div className="py-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              {/* Hero Section */}
              <div className="mb-12">
                <h2 className="text-large text-heading mb-6">
                  Optimize your website for AI search platforms
                </h2>
                
                <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                  Get comprehensive analysis and actionable recommendations to improve your 
                  visibility across ChatGPT, Claude, Perplexity, and Gemini.
                </p>

                {/* URL Form */}
                <div className="max-w-xl mx-auto mb-12">
                  <UrlForm 
                    onSubmit={handleAnalyze} 
                    isLoading={false}
                  />
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                  <div className="card p-6 transition-smooth">
                    <div className="w-12 h-12 bg-accent-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Crawler Analysis
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      Check how AI platforms can access and crawl your content.
                    </p>
                  </div>
                  
                  <div className="card p-6 transition-smooth">
                    <div className="w-12 h-12 bg-accent-secondary rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Content Scoring
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      Analyze structure, readability, and AI-optimization factors.
                    </p>
                  </div>
                  
                  <div className="card p-6 transition-smooth">
                    <div className="w-12 h-12 bg-accent-success rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Recommendations
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      Get specific actions to improve your AI search visibility.
                    </p>
                  </div>
                </div>

                {/* AI Platform Indicators */}
                <div className="flex justify-center items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground-secondary">ChatGPT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-foreground-secondary">Claude</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-foreground-secondary">Perplexity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-foreground-secondary">Gemini</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisState.status === 'loading' && (
          <div className="py-16 px-6">
            <div className="max-w-2xl mx-auto">
              <LoadingState url={analysisState.result?.url} />
            </div>
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="py-16 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 text-center border-red-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Analysis Failed
                </h2>
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
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <div id="results" className="py-8 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Score Display */}
              <div className="card p-6">
                <ScoreDisplay result={analysisState.result} />
              </div>
              
              {/* Recommendations */}
              <div className="card p-6">
                <RecommendationsList recommendations={analysisState.result.recommendations} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light mt-16 bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-accent-primary rounded flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
              <span className="text-foreground-secondary font-medium">
                AI Search Analyzer
              </span>
            </div>
            <p className="text-sm text-foreground-muted">
              Optimize your website for AI search platforms
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}