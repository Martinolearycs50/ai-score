'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import AIRecommendationCard from '@/components/AIRecommendationCard';
import AdvancedLoadingState from '@/components/AdvancedLoadingState';
import ComparisonView from '@/components/ComparisonView';
import EmotionalComparisonReveal from '@/components/EmotionalComparisonReveal';
import EmotionalResultsReveal from '@/components/EmotionalResultsReveal';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import FriendlyRecommendationCard from '@/components/FriendlyRecommendationCard';
import PillarScoreDisplayV2 from '@/components/PillarScoreDisplayV2';
import ProDeepAnalysisCTA from '@/components/ProDeepAnalysisCTA';
import ProUpgradeCTA from '@/components/ProUpgradeCTA';
import UrlForm from '@/components/UrlForm';
import WebsiteProfileCard from '@/components/WebsiteProfileCard';
import { useTier } from '@/hooks/useTier';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { cssVars } from '@/lib/design-system/colors';
import { convertQuickToFullFormat, performProgressiveAnalysis } from '@/lib/progressiveEnhancement';
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
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [enhancementStatus, setEnhancementStatus] = useState<'idle' | 'loading' | 'enhanced'>(
    'idle'
  );

  const [analysisState, setAnalysisState] = useState<AnalysisStateNew>({
    status: 'idle',
    result: null,
    error: null,
  });

  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    status: 'idle',
    results: [null, null],
    errors: [null, null],
  });

  // Show exit intent on results page
  useEffect(() => {
    if (analysisState.status === 'success' && tier === 'free') {
      // Only show for free tier users
      setShowExitIntent(true);
    }
  }, [analysisState.status, tier]);

  // Enhance analysis with Chrome UX Report data
  const enhanceWithCruxData = async (url: string, initialResult: AnalysisResultNew) => {
    try {
      setEnhancementStatus('loading');

      const response = await fetch('/api/enhance-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          initialScores: {
            retrieval: {
              score: initialResult.scoringResult.pillarScores.RETRIEVAL,
              breakdown: initialResult.breakdown?.RETRIEVAL || {},
            },
          },
        }),
      });

      if (!response.ok) {
        console.warn('Enhancement failed:', await response.text());
        return;
      }

      const enhancementData = await response.json();

      if (enhancementData.enhanced) {
        console.log('📈 [Enhancement] Updating scores with real-world data:', {
          previousScore: initialResult.scoringResult.pillarScores.RETRIEVAL,
          newScore: enhancementData.retrieval.score,
          improvement: enhancementData.retrieval.improvement,
          dataSource: enhancementData.dataSource,
        });

        // Update the analysis state with enhanced scores
        setAnalysisState((prev) => {
          if (!prev.result) return prev;

          return {
            ...prev,
            result: {
              ...prev.result,
              scoringResult: {
                ...prev.result.scoringResult,
                pillarScores: {
                  ...prev.result.scoringResult.pillarScores,
                  RETRIEVAL: enhancementData.retrieval.score,
                },
                total:
                  prev.result.scoringResult.total -
                  prev.result.scoringResult.pillarScores.RETRIEVAL +
                  enhancementData.retrieval.score,
              },
              breakdown: {
                ...prev.result.breakdown,
                RETRIEVAL: enhancementData.retrieval.breakdown,
              },
              enhancementData: {
                enhanced: true,
                dataSource: enhancementData.dataSource,
                cruxMetrics: enhancementData.cruxMetrics,
                improvement: enhancementData.retrieval.improvement,
              },
            },
          };
        });

        setEnhancementStatus('enhanced');
      } else {
        console.log('ℹ️ [Enhancement] No enhancement available:', enhancementData.message);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      // Silently fail - keep showing initial results
    }
  };

  const handleAnalyze = async (url: string) => {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Debug] handleAnalyze called with URL:', url);
    }

    setAnalysisState({ status: 'loading', result: null, error: null });

    // Check if Cloudflare Worker is available
    const useProgressiveEnhancement =
      process.env.NEXT_PUBLIC_WORKER_URL &&
      process.env.NEXT_PUBLIC_WORKER_URL !== 'https://ai-search-worker.your-subdomain.workers.dev';

    if (useProgressiveEnhancement) {
      // Use progressive enhancement
      await performProgressiveAnalysis(url, {
        onQuickResult: (quickResult) => {
          // Convert quick result to full format for display
          const convertedResult = convertQuickToFullFormat(quickResult);
          setAnalysisState({
            status: 'success',
            result: convertedResult as AnalysisResultNew,
            error: null,
          });
        },
        onFullResult: (fullResult) => {
          // Update with full analysis
          const result = fullResult.data as AnalysisResultNew;
          setAnalysisState({
            status: 'success',
            result: result,
            error: null,
          });

          // Enhance with Chrome UX Report data (progressive enhancement)
          enhanceWithCruxData(url, result);

          // Handle Pro user redirect
          if (tier === 'pro') {
            setTimeout(() => {
              sessionStorage.setItem('latestAnalysis', JSON.stringify(result));
              router.push('/dashboard');
            }, 2000);
          } else {
            // Smooth scroll to results
            setTimeout(() => {
              document.getElementById('results')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }, 4500);
          }
        },
        onError: (error, phase) => {
          if (phase === 'full' && analysisState.status === 'success') {
            // If quick analysis succeeded but full failed, keep showing quick results
            console.warn('Full analysis failed, keeping quick results:', error);
            return;
          }
          setAnalysisState({
            status: 'error',
            result: null,
            error: error.message,
          });
        },
      });
    } else {
      // Fallback to direct API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('[Debug] Request aborted due to timeout');
      }, 15000);

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
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        const result = data.data as AnalysisResultNew;

        setAnalysisState({
          status: 'success',
          result: result,
          error: null,
        });

        // Enhance with Chrome UX Report data (progressive enhancement)
        enhanceWithCruxData(url, result);

        // Handle Pro user redirect
        if (tier === 'pro') {
          setTimeout(() => {
            sessionStorage.setItem('latestAnalysis', JSON.stringify(result));
            router.push('/dashboard');
          }, 2000);
        } else {
          setTimeout(() => {
            document.getElementById('results')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 4500);
        }
      } catch (error) {
        clearTimeout(timeoutId);

        let errorMessage = 'Analysis failed';
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage =
              'The analysis is taking longer than expected. Please try again or check if the website is accessible.';
          } else if (error.message.includes('fetch')) {
            errorMessage =
              'Unable to connect to the analysis service. Please check your internet connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }

        setAnalysisState({
          status: 'error',
          result: null,
          error: errorMessage,
        });
      }
    }
  };

  const handleCompare = async (urls: [string, string]) => {
    setComparisonState({ status: 'loading', results: [null, null], errors: [null, null] });

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
            error: error instanceof Error ? error.message : 'Analysis failed',
          };
        }
      });

      const results = await Promise.all(promises);

      setComparisonState({
        status: results.every((r) => r.success)
          ? 'success'
          : results.some((r) => r.success)
            ? 'success'
            : 'error',
        results: [results[0].data, results[1].data],
        errors: [results[0].error, results[1].error],
      });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch {
      setComparisonState({
        status: 'error',
        results: [null, null],
        errors: ['Comparison failed', 'Comparison failed'],
      });
    }
  };

  const handleReset = () => {
    setComparisonMode(false);
    setAnalysisState({ status: 'idle', result: null, error: null });
    setComparisonState({ status: 'idle', results: [null, null], errors: [null, null] });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Exit Intent Popup */}
      {showExitIntent && (
        <ExitIntentPopup
          onClose={() => setShowExitIntent(false)}
          onEmailSubmit={async (email: string) => {
            console.log('Email submitted:', email);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            localStorage.setItem('emailCaptured', 'true');
          }}
        />
      )}

      {/* Main Content */}
      <main className="animate-fade-in">
        {analysisState.status === 'idle' && comparisonState.status === 'idle' && (
          <div className="flex min-h-screen flex-col items-center px-6 pt-12 md:pt-16">
            <div className="mx-auto w-full max-w-2xl text-center">
              <h1
                className="mb-8 text-5xl font-medium md:text-6xl"
                style={{ color: 'var(--foreground)' }}
              >
                Is Your Website Visible to AI Search?
              </h1>

              <UrlForm
                onSubmit={handleAnalyze}
                onCompare={handleCompare}
                isLoading={false}
                comparisonMode={comparisonMode}
                onComparisonModeChange={features.showComparisonMode ? setComparisonMode : undefined}
              />

              <p className="text-muted mt-4 text-xs">
                We analyze individual pages, not entire websites. Try your homepage, a blog post, or
                product page.
              </p>
            </div>
          </div>
        )}

        {(analysisState.status === 'loading' || comparisonState.status === 'loading') && (
          <div className="px-6 pt-12 md:pt-16">
            <AdvancedLoadingState url={analysisState.result?.url} />
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="px-6 pt-12 md:pt-16">
            <motion.div
              className="mx-auto max-w-md py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto"
                >
                  <path
                    d="M12 9V14M12 17H12.01M10.29 3.86L2.82 18C2.64 18.35 2.55 18.74 2.55 19.13C2.55 20.17 3.38 21 4.41 21H19.59C20.62 21 21.45 20.17 21.45 19.13C21.45 18.74 21.36 18.35 21.18 18L13.71 3.86C13.53 3.5 13.28 3.18 12.96 2.93C12.24 2.36 11.2 2.36 10.48 2.93C10.16 3.18 9.91 3.5 9.73 3.86Z"
                    fill={cssVars.warning}
                    fillOpacity="0.2"
                    stroke={cssVars.warning}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mb-4 text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
                Unable to Analyze This Page
              </h2>

              <p className="mb-6 text-lg" style={{ color: 'var(--foreground-muted)' }}>
                {analysisState.error}
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleReset}
                  className="bg-accent rounded-lg px-6 py-3 transition-opacity hover:opacity-90"
                  style={{ color: 'white' }}
                >
                  Try Another URL
                </button>

                <p className="text-muted text-sm">
                  Some websites block automated analysis for security reasons.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <div className="px-6 py-8">
              {/* Back button */}
              <div className="mx-auto mb-8 max-w-6xl">
                <button
                  onClick={handleReset}
                  className="text-muted hover:text-foreground text-sm transition-colors"
                >
                  ← New analysis
                </button>
              </div>

              <div id="results" className="mx-auto max-w-6xl">
                <EmotionalResultsReveal result={analysisState.result}>
                  <div className="space-y-6">
                    {/* Website Profile Card - Feature flag based */}
                    {features.showWebsiteProfile && analysisState.result.websiteProfile && (
                      <WebsiteProfileCard
                        profile={analysisState.result.websiteProfile}
                        score={analysisState.result.aiSearchScore}
                        compact={true}
                      />
                    )}

                    <PillarScoreDisplayV2
                      result={analysisState.result}
                      enhancementStatus={enhancementStatus}
                    />

                    {/* Pro Deep Analysis CTA for Free Tier */}
                    {tier === 'free' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                      >
                        <ProDeepAnalysisCTA
                          url={analysisState.result.url}
                          score={analysisState.result.aiSearchScore}
                          variant="banner"
                        />
                      </motion.div>
                    )}

                    {/* Enhanced Recommendations Section - Feature flag based */}
                    {features.showRecommendations ? (
                      <div className="space-y-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8 text-center"
                        >
                          <h2
                            className="mb-4 text-3xl font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            Your AI Optimization Journey
                          </h2>
                          <p className="text-muted text-lg">
                            {analysisState.result.scoringResult.recommendations.length === 0
                              ? "You're already at the summit!"
                              : `${analysisState.result.scoringResult.recommendations.length} opportunities to boost your score`}
                          </p>
                        </motion.div>

                        {analysisState.result.scoringResult.recommendations.length === 0 ? (
                          <motion.div
                            className="card p-12 text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring' }}
                          >
                            <motion.div
                              className="mb-4"
                              animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              <svg
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto"
                              >
                                <path
                                  d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z"
                                  fill={cssVars.success}
                                  stroke={cssVars.success}
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                />
                                <circle cx="6" cy="6" r="2" fill={cssVars.warning} opacity="0.8" />
                                <circle cx="18" cy="6" r="2" fill={cssVars.warning} opacity="0.8" />
                                <circle
                                  cx="12"
                                  cy="20"
                                  r="2"
                                  fill={cssVars.warning}
                                  opacity="0.8"
                                />
                              </svg>
                            </motion.div>
                            <p
                              className="mb-2 text-xl font-medium"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Perfect Score Territory!
                            </p>
                            <p className="text-muted">
                              Your website is brilliantly optimized for AI search platforms. Keep up
                              the amazing work!
                            </p>
                          </motion.div>
                        ) : (
                          <div className="space-y-4">
                            {analysisState.result.scoringResult.recommendations.map(
                              (rec, index) => {
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
                                    websiteProfile={
                                      analysisState.result?.websiteProfile
                                        ? {
                                            domain: analysisState.result.websiteProfile.domain,
                                            title: analysisState.result.websiteProfile.title,
                                            contentType:
                                              analysisState.result.websiteProfile.contentType,
                                            pageType: analysisState.result.websiteProfile.pageType,
                                          }
                                        : undefined
                                    }
                                  />
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Single Pro CTA at the end for Free Tier */}
                    {tier === 'free' && <ProUpgradeCTA variant="card" />}
                  </div>
                </EmotionalResultsReveal>
              </div>
            </div>
          </div>
        )}

        {comparisonState.status === 'success' &&
          comparisonState.results[0] &&
          comparisonState.results[1] && (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
              <div className="px-6 py-8">
                {/* Back button */}
                <div className="mx-auto mb-8 max-w-6xl">
                  <button
                    onClick={handleReset}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    ← New analysis
                  </button>
                </div>

                <div id="results" className="mx-auto max-w-6xl">
                  <EmotionalComparisonReveal
                    results={[comparisonState.results[0], comparisonState.results[1]]}
                  >
                    <ComparisonView
                      results={[comparisonState.results[0], comparisonState.results[1]]}
                    />
                  </EmotionalComparisonReveal>
                </div>
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
