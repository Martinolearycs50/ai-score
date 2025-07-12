'use client';

import { useState } from 'react';
import UrlForm from '@/components/UrlForm';
import LoadingState from '@/components/LoadingState';
import ScoreDisplay from '@/components/ScoreDisplay';
import RecommendationsList from '@/components/RecommendationsList';
import Icon3D from '@/components/Icon3D';
import FloatingNav from '@/components/FloatingNav';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import InteractiveBackground from '@/components/InteractiveBackground';
import { Bot, Zap, Target } from 'lucide-react';
import { useParallaxScroll } from '@/hooks/useParallaxScroll';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { AnalysisState } from '@/lib/types';

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    result: null,
    error: null
  });

  // Parallax effects
  const { ref: dotGridRef, transform: dotGridTransform } = useParallaxScroll({ speed: 0.3 });
  const { ref: particlesRef, transform: particlesTransform } = useParallaxScroll({ speed: 0.5 });
  
  // Scroll animations
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation({ threshold: 0.1, delay: 200 });

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
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      <InteractiveBackground />
      <FloatingNav />
      <KeyboardShortcuts 
        onAnalyze={() => (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus()}
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      {/* Ambient Background Elements */}
      <div 
        ref={dotGridRef}
        className="fixed inset-0 dot-grid opacity-30"
        style={{ transform: `translateY(${dotGridTransform}px)` }}
      ></div>
      
      {/* Floating Particles */}
      <div 
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none"
        style={{ transform: `translateY(${particlesTransform}px)` }}
      >
        <div className="particle" style={{ top: '20%', left: '10%' }}></div>
        <div className="particle" style={{ top: '60%', left: '80%' }}></div>
        <div className="particle" style={{ top: '40%', left: '60%' }}></div>
        <div className="particle" style={{ top: '80%', left: '20%' }}></div>
      </div>

      {/* Constellation Lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="constellation-line" style={{ top: '25%', left: '15%', width: '200px', transform: 'rotate(45deg)' }}></div>
        <div className="constellation-line" style={{ top: '65%', left: '70%', width: '150px', transform: 'rotate(-30deg)' }}></div>
        <div className="constellation-line" style={{ top: '45%', left: '40%', width: '180px', transform: 'rotate(15deg)' }}></div>
      </div>

      {/* Header */}
      <header className="glass-intense sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 magnetic">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center glow-cyan">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-xl font-display font-bold text-foreground">
                AI Search Observatory
              </h1>
            </div>
            
            {analysisState.status !== 'idle' && (
              <button
                onClick={handleReset}
                className="magnetic px-6 py-3 text-sm font-medium text-foreground-secondary hover:text-foreground smooth-transition glass rounded-lg"
              >
                ← New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {analysisState.status === 'idle' && (
          <div id="home" className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-6xl mx-auto text-center">
              {/* Hero Section */}
              <div ref={heroRef} className={`mb-16 smooth-transition ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="mb-8">
                  <h2 className="text-massive text-display mb-6">
                    Unlock Your Website&apos;s{' '}
                    <span className="block text-accent-cyan">
                      AI Search Potential
                    </span>
                  </h2>
                  
                  <p className="text-xl text-foreground-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
                    Enter the future of search optimization. Our advanced observatory analyzes 
                    your website across all major AI platforms with scientific precision.
                  </p>
                </div>

                {/* Premium Feature Cards */}
                <div id="features" ref={featuresRef} className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16 smooth-transition ${featuresVisible ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`glass magnetic rounded-2xl p-8 group hover:glow-cyan smooth-transition ${featuresVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '100ms' }}>
                    <div className="mb-6 flex justify-center">
                      <Icon3D 
                        icon={Bot} 
                        size={48} 
                        glowColor="var(--accent-cyan)"
                      />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-4">
                      AI Crawler Intelligence
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      Deep analysis of how ChatGPT, Claude, Perplexity, and Gemini 
                      discover and index your content.
                    </p>
                  </div>
                  
                  <div className={`glass magnetic rounded-2xl p-8 group hover:glow-purple smooth-transition ${featuresVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '200ms' }}>
                    <div className="mb-6 flex justify-center">
                      <Icon3D 
                        icon={Zap} 
                        size={48} 
                        glowColor="var(--accent-purple)"
                      />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-4">
                      Neural Content Analysis
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      Advanced algorithms evaluate structure, readability, and 
                      AI-optimized formatting patterns.
                    </p>
                  </div>
                  
                  <div className={`glass magnetic rounded-2xl p-8 group hover:glow-cyan smooth-transition ${featuresVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '300ms' }}>
                    <div className="mb-6 flex justify-center">
                      <Icon3D 
                        icon={Target} 
                        size={48} 
                        glowColor="var(--accent-cyan)"
                      />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-4">
                      Precision Recommendations
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      Actionable insights with code examples and implementation 
                      strategies for maximum AI visibility.
                    </p>
                  </div>
                </div>

                {/* AI Platform Indicators */}
                <div className="flex justify-center items-center space-x-8 mb-16">
                  <div className="flex items-center space-x-2 glass rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground-secondary">ChatGPT</span>
                  </div>
                  <div className="flex items-center space-x-2 glass rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <span className="text-sm font-medium text-foreground-secondary">Claude</span>
                  </div>
                  <div className="flex items-center space-x-2 glass rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <span className="text-sm font-medium text-foreground-secondary">Perplexity</span>
                  </div>
                  <div className="flex items-center space-x-2 glass rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    <span className="text-sm font-medium text-foreground-secondary">Gemini</span>
                  </div>
                </div>
              </div>

              {/* Premium URL Form */}
              <div className="max-w-2xl mx-auto">
                <UrlForm 
                  onSubmit={handleAnalyze} 
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        )}

        {analysisState.status === 'loading' && (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingState url={analysisState.result?.url} />
          </div>
        )}

        {analysisState.status === 'error' && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="glass-intense rounded-2xl p-12 max-w-2xl mx-auto text-center border border-red-500/20">
              <div className="text-red-400 text-5xl mb-6">⚠️</div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Analysis Failed
              </h2>
              <p className="text-foreground-secondary mb-8 text-lg leading-relaxed">
                {analysisState.error}
              </p>
              <button
                onClick={handleReset}
                className="liquid-button magnetic px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg smooth-transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {analysisState.status === 'success' && analysisState.result && (
          <div id="results" className="py-16 px-6">
            <div className="max-w-7xl mx-auto space-y-16">
              {/* Score Display */}
              <div className="glass rounded-3xl p-8">
                <ScoreDisplay result={analysisState.result} />
              </div>
              
              {/* Recommendations */}
              <div className="glass rounded-3xl p-8">
                <RecommendationsList recommendations={analysisState.result.recommendations} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-intense border-t border-white/10 mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-foreground-secondary font-display font-semibold">
                AI Search Observatory
              </span>
            </div>
            <p className="text-foreground-secondary mb-2">
              Advanced AI search optimization for the future of discovery
            </p>
            <p className="text-sm text-foreground-muted">
              Built with cutting-edge technology for next-generation search
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}