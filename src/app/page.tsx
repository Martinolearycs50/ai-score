'use client';

import { useState, useEffect } from 'react';
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

  // Prevent navigation during loading
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (analysisState.status === 'loading') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analysisState.status]);

  const handleAnalyze = async (url: string) => {
    console.log('[HomePage] Starting analysis for URL:', url);
    console.log('[HomePage] Current location:', window.location.href);
    
    setAnalysisState({
      status: 'loading',
      result: null,
      error: null
    });

    try {
      const requestBody = JSON.stringify({ url });
      console.log('[HomePage] Request body:', requestBody);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
        // Prevent any redirect
        redirect: 'error'
      });

      console.log('[HomePage] Response status:', response.status);
      console.log('[HomePage] Response headers:', response.headers);
      
      let data;
      try {
        data = await response.json();
        console.log('[HomePage] API Response data:', data);
      } catch (jsonError) {
        console.error('[HomePage] Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('[HomePage] Response not OK:', response.status, data);
        throw new Error(data.error || `Analysis failed with status ${response.status}`);
      }

      if (!data.success) {
        console.error('[HomePage] Analysis not successful:', data);
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('[HomePage] Analysis successful, setting state');
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
      console.error('[HomePage] Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      // Check if it's a network error that might indicate navigation
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('[HomePage] Network error - possible navigation detected');
      }
      
      setAnalysisState({
        status: 'error',
        result: null,
        error: errorMessage
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