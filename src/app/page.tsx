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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#635BFF"/>
                <path d="M16 8L8 20H24L16 8Z" fill="white" opacity="0.9"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
              <span className="font-semibold text-lg text-gray-900">AI Search Analyzer</span>
            </div>
            
            {analysisState.status !== 'idle' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Hero */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Is your website ready for AI search?
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                  <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                      <path d="m21 21-4.35-4.35" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Crawler Analysis</h3>
                  <p className="text-gray-600 text-sm">
                    Check AI bot access and permissions for your content
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3v18h18" strokeWidth="2"/>
                      <path d="m7 16 5-5 5 5" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Content Scoring</h3>
                  <p className="text-gray-600 text-sm">
                    Measure structure, readability, and optimization
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <p className="text-gray-600 text-sm">
                    Get specific actions to improve AI visibility
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'loading' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-2xl mx-auto">
                <LoadingState url={analysisState.result?.url} />
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'error' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-md mx-auto text-center">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
                  <p className="text-gray-600 mb-6">
                    {analysisState.error}
                  </p>
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <section id="results" className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Score Display */}
                <ScoreDisplay result={analysisState.result} />
                
                {/* Recommendations */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
                  <RecommendationsList recommendations={analysisState.result.recommendations} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>AI Search Analyzer • Optimize for AI search platforms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}