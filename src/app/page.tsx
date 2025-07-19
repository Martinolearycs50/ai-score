'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
import ExitIntentPopup from '@/components/ExitIntentPopup';
import ShareButtons from '@/components/ShareButtons';
import EmailCaptureForm from '@/components/EmailCaptureForm';
import ProUpgradeCTA from '@/components/ProUpgradeCTA';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { recTemplates } from '@/lib/recommendations';
import { performProgressiveAnalysis, convertQuickToFullFormat } from '@/lib/progressiveEnhancement';

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
  const [enhancementStatus, setEnhancementStatus] = useState<'idle' | 'loading' | 'enhanced'>('idle');
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
              breakdown: initialResult.breakdown?.RETRIEVAL || {}
            }
          }
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
          dataSource: enhancementData.dataSource
        });
        
        // Update the analysis state with enhanced scores
        setAnalysisState(prev => {
          if (!prev.result) return prev;
          
          return {
            ...prev,
            result: {
              ...prev.result,
              scoringResult: {
                ...prev.result.scoringResult,
                pillarScores: {
                  ...prev.result.scoringResult.pillarScores,
                  RETRIEVAL: enhancementData.retrieval.score
                },
                total: prev.result.scoringResult.total - 
                  prev.result.scoringResult.pillarScores.RETRIEVAL + 
                  enhancementData.retrieval.score
              },
              breakdown: {
                ...prev.result.breakdown,
                RETRIEVAL: enhancementData.retrieval.breakdown
              },
              enhancementData: {
                enhanced: true,
                dataSource: enhancementData.dataSource,
                cruxMetrics: enhancementData.cruxMetrics,
                improvement: enhancementData.retrieval.improvement
              }
            }
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

    setAnalysisState({
      status: 'loading',
      result: null,
      error: null
    });

    // Check if Cloudflare Worker is available
    const useProgressiveEnhancement = process.env.NEXT_PUBLIC_WORKER_URL && 
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
            error: null
          });
        },
        onFullResult: (fullResult) => {
          // Update with full analysis
          const result = fullResult.data as AnalysisResultNew;
          setAnalysisState({
            status: 'success',
            result: result,
            error: null
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
                block: 'start'
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
            error: error.message
          });
        }
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
          error: null
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
              block: 'start'
            });
          }, 4500);
        }

      } catch (error) {
        clearTimeout(timeoutId);

        let errorMessage = 'Analysis failed';
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'The analysis is taking longer than expected. Please try again or check if the website is accessible.';
          } else if (error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the analysis service. Please check your internet connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }

        setAnalysisState({
          status: 'error',
          result: null,
          error: errorMessage
        });
      }
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

  const handleEmailSubmit = async (email: string) => {
    // In a real app, this would send to your email service
    console.log('Email submitted:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // You could store this in localStorage to track conversions
    localStorage.setItem('emailCaptured', 'true');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Exit Intent Popup */}
      {showExitIntent && (
        <ExitIntentPopup
          onClose={() => setShowExitIntent(false)}
          onEmailSubmit={handleEmailSubmit}
        />
      )}

      {/* Main Content */}
      <main className="animate-fade-in">
        {analysisState.status === 'idle' && comparisonState.status === 'idle' && (
          <div className="min-h-screen flex flex-col items-center pt-12 md:pt-16 px-6">
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
                comparisonMode={comparisonMode}
                onComparisonModeChange={features.showComparisonMode ? setComparisonMode : undefined}
              />
            </div>
          </div>
        )}

        {(analysisState.status === 'loading' || comparisonState.status === 'loading') && (
          <div className="pt-12 md:pt-16 px-6">
            <AdvancedLoadingState url={analysisState.result?.url} />
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="pt-12 md:pt-16 px-6">
            <motion.div 
              className="text-center max-w-md mx-auto py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                  <path d="M12 9V14M12 17H12.01M10.29 3.86L2.82 18C2.64 18.35 2.55 18.74 2.55 19.13C2.55 20.17 3.38 21 4.41 21H19.59C20.62 21 21.45 20.17 21.45 19.13C21.45 18.74 21.36 18.35 21.18 18L13.71 3.86C13.53 3.5 13.28 3.18 12.96 2.93C12.24 2.36 11.2 2.36 10.48 2.93C10.16 3.18 9.91 3.5 9.73 3.86Z" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
          <div className="bg-gray-50/50 min-h-screen">
            <div className="px-6 py-8">
              {/* Back button */}
              <div className="max-w-6xl mx-auto mb-8">
                <button
                  onClick={handleReset}
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  ← New analysis
                </button>
              </div>

              <div id="results" className="max-w-6xl mx-auto">
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
                  
                  {/* Pro Upgrade CTA for Free Tier */}
                  {tier === 'free' && (
                    <ProUpgradeCTA variant="banner" />
                  )}
                  
                  {/* Enhanced Recommendations Section - Feature flag based */}
                  {features.showRecommendations ? (
                  <div className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-3xl font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                        Your AI Optimization Journey
                      </h2>
                      <p className="text-lg text-muted">
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
                        transition={{ type: "spring" }}
                      >
                        <motion.div
                          className="mb-4"
                          animate={{ 
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                            <path d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z" fill="#10B981" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                            <circle cx="6" cy="6" r="2" fill="#F59E0B" opacity="0.8"/>
                            <circle cx="18" cy="6" r="2" fill="#F59E0B" opacity="0.8"/>
                            <circle cx="12" cy="20" r="2" fill="#F59E0B" opacity="0.8"/>
                          </svg>
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
                  ) : tier === 'free' && (
                    /* Simple CTA for free tier when recommendations are hidden */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center"
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
                        <path d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                      <h3 className="text-2xl font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                        Ready to maximize your AI visibility?
                      </h3>
                      <p className="text-lg text-muted mb-6">
                        Get AI-powered recommendations, track progress, and compare with competitors
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Upgrade to Pro →
                      </Link>
                    </motion.div>
                  )}

                  {/* Email Capture Form - Only for free tier */}
                  {tier === 'free' && (
                    <EmailCaptureForm 
                      variant="cta"
                      onSubmit={handleEmailSubmit}
                    />
                  )}

                  {/* Share Buttons */}
                  <ShareButtons 
                    score={analysisState.result.aiSearchScore}
                    url={analysisState.result.url}
                    title={analysisState.result.websiteProfile?.title}
                  />

                  {/* Final Pro CTA for Free Tier */}
                  {tier === 'free' && (
                    <ProUpgradeCTA variant="card" />
                  )}
                </div>
              </EmotionalResultsReveal>
              </div>
            </div>
          </div>
        )}

        {comparisonState.status === 'success' && comparisonState.results[0] && comparisonState.results[1] && (
          <div className="bg-gray-50/50 min-h-screen">
            <div className="px-6 py-8">
              {/* Back button */}
              <div className="max-w-6xl mx-auto mb-8">
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
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}