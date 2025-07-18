'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTier } from '@/hooks/useTier';
import UrlForm from '@/components/UrlForm';
import AdvancedLoadingState from '@/components/AdvancedLoadingState';
import PillarScoreDisplayV2 from '@/components/PillarScoreDisplayV2';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import FriendlyRecommendationCard from '@/components/FriendlyRecommendationCard';
import ComparisonView from '@/components/ComparisonView';
import EmotionalResultsReveal from '@/components/EmotionalResultsReveal';
import EmotionalComparisonReveal from '@/components/EmotionalComparisonReveal';
import WebsiteProfileCard from '@/components/WebsiteProfileCard';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { recTemplates } from '@/lib/recommendations';

interface AnalysisStateNew {
  status: 'idle' | 'loading' | 'success' | 'error';
  result: AnalysisResultNew | null;
  error: string | null;
}

interface ComparisonState {
  status: 'idle' | 'loading' | 'success' | 'error';
  results: [AnalysisResultNew | null, AnalysisResultNew | null];
  errors: [string | null, string | null];
}

function HomeContent() {
  const { features, tier } = useTier();
  const router = useRouter();
  const [comparisonMode, setComparisonMode] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisStateNew>({
    status: 'idle',
    result: null,
    error: null
  });
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    status: 'idle',
    results: [null, null],
    errors: [null, null]
  });

  const handleAnalyze = async (url: string) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Debug] handleAnalyze called with URL:', url);
    }

    setAnalysisState({
      status: 'loading',
      result: null,
      error: null
    });

    try {
      const requestBody = { url };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Sending request to /api/analyze');
        console.log('[Debug] Request body:', requestBody);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Response status:', response.status);
        console.log('[Debug] Response ok:', response.ok);
      }

      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('[Debug] Response data:', data);
      }

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

      // For Pro users, redirect to dashboard after a short delay
      if (tier === 'pro') {
        setTimeout(() => {
          // Store the analysis result in sessionStorage for the dashboard
          sessionStorage.setItem('latestAnalysis', JSON.stringify(result));
          router.push('/dashboard');
        }, 2000); // Show success briefly then redirect
      } else {
        // For free users, smooth scroll to results after emotional reveal completes
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 14000); // Wait for full emotional reveal (13s) plus buffer
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Debug] Error in handleAnalyze:', error);
        console.error('[Debug] Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('[Debug] Error message:', error instanceof Error ? error.message : String(error));
      }

      setAnalysisState({
        status: 'error',
        result: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  };

  const handleCompare = async (urls: [string, string]) => {
    setComparisonState({
      status: 'loading',
      results: [null, null],
      errors: [null, null]
    });

    try {
      // Analyze both URLs in parallel
      const promises = urls.map(async (url) => {
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

          return { success: true, data: data.data as AnalysisResultNew, error: null };
        } catch (error) {
          return { 
            success: false, 
            data: null, 
            error: error instanceof Error ? error.message : 'Analysis failed' 
          };
        }
      });

      const results = await Promise.all(promises);
      
      setComparisonState({
        status: results.every(r => r.success) ? 'success' : 
                results.some(r => r.success) ? 'success' : 'error',
        results: [results[0].data, results[1].data],
        errors: [results[0].error, results[1].error]
      });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch {
      setComparisonState({
        status: 'error',
        results: [null, null],
        errors: ['Comparison failed', 'Comparison failed']
      });
    }
  };

  const handleReset = () => {
    setComparisonMode(false);
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null
    });
    setComparisonState({
      status: 'idle',
      results: [null, null],
      errors: [null, null]
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Main Content */}
      <main className="animate-fade-in">
        {analysisState.status === 'idle' && comparisonState.status === 'idle' && (
          <div className="min-h-screen flex flex-col items-center pt-24 px-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-medium mb-8" style={{ color: 'var(--foreground)' }}>
                AI Search Score
              </h1>
              <p className="text-xl mb-4 text-muted">
                Want AI tools like ChatGPT to mention your site? This shows you how.
              </p>
              <p className="text-sm mb-12 text-muted">
                We analyze individual pages, not entire websites. Try your homepage, a blog post, or product page.
              </p>
              
              <UrlForm 
                onSubmit={handleAnalyze}
                onCompare={handleCompare}
                isLoading={false}
                comparisonMode={comparisonMode && features.showComparisonMode}
                onComparisonModeChange={(value) => features.showComparisonMode && setComparisonMode(value)}
              />
            </div>
          </div>
        )}

        {(analysisState.status === 'loading' || comparisonState.status === 'loading') && (
          <div className="min-h-screen flex items-center pt-24 px-6">
            <AdvancedLoadingState url={analysisState.result?.url} />
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="min-h-screen flex items-center pt-24 px-6">
            <motion.div 
              className="text-center max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <span className="text-6xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                Unable to Analyze This Page
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--foreground-muted)' }}>
                {analysisState.error}
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Try Another URL
                </button>
                <p className="text-sm text-muted">
                  Some websites block automated analysis for security reasons.
                </p>
              </div>
            </motion.div>
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

            <div id="results" className="max-w-4xl mx-auto">
              <EmotionalResultsReveal result={analysisState.result}>
                <div className="space-y-8">
                  {/* Website Profile Card - Feature flag based */}
                  {features.showWebsiteProfile && analysisState.result.websiteProfile && (
                    <WebsiteProfileCard 
                      profile={analysisState.result.websiteProfile} 
                      score={analysisState.result.aiSearchScore}
                    />
                  )}
                  
                  <PillarScoreDisplayV2 result={analysisState.result} />
                  
                  {/* Enhanced Recommendations Section - Feature flag based */}
                  {features.showRecommendations && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-3xl font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                        Your AI Optimization Journey 🗺️
                      </h2>
                      <p className="text-lg text-muted">
                        {analysisState.result.scoringResult.recommendations.length === 0
                          ? "You're already at the summit! 🏔️"
                          : `${analysisState.result.scoringResult.recommendations.length} opportunities to boost your score`}
                      </p>
                    </motion.div>
                    
                    {analysisState.result.scoringResult.recommendations.length === 0 ? (
                      <motion.div 
                        className="card p-12 text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <motion.div
                          className="text-6xl mb-4"
                          animate={{ 
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          🎉
                        </motion.div>
                        <p className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                          Perfect Score Territory!
                        </p>
                        <p className="text-muted">
                          Your website is brilliantly optimized for AI search platforms.
                          Keep up the amazing work!
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {analysisState.result.scoringResult.recommendations.map((rec, index) => {
                          return (
                            <FriendlyRecommendationCard
                              key={index}
                              metric={rec.metric}
                              why={rec.why}
                              fix={rec.fix}
                              gain={rec.gain}
                              pillar={rec.pillar}
                              example={rec.example}
                              index={index}
                              websiteProfile={analysisState.result?.websiteProfile ? {
                                domain: analysisState.result.websiteProfile.domain,
                                title: analysisState.result.websiteProfile.title,
                                contentType: analysisState.result.websiteProfile.contentType,
                                pageType: analysisState.result.websiteProfile.pageType,
                              } : undefined}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </EmotionalResultsReveal>
            </div>
          </div>
        )}

        {comparisonState.status === 'success' && comparisonState.results[0] && comparisonState.results[1] && (
          <div className="min-h-screen px-6 py-16">
            {/* Back button */}
            <div className="max-w-6xl mx-auto mb-12">
              <button
                onClick={handleReset}
                className="text-muted hover:text-foreground transition-colors text-sm"
              >
                ← New analysis
              </button>
            </div>

            <div id="results" className="max-w-6xl mx-auto">
              <EmotionalComparisonReveal results={[comparisonState.results[0], comparisonState.results[1]]}>
                <ComparisonView results={[comparisonState.results[0], comparisonState.results[1]]} />
              </EmotionalComparisonReveal>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}