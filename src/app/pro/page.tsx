'use client';

import React, { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';

import AiRewriteView from '@/components/AiRewriteView';
import CompetitiveAnalysisView from '@/components/CompetitiveAnalysisView';
import DeepAnalysisView from '@/components/DeepAnalysisView';
import EnhancedDeepAnalysisView from '@/components/EnhancedDeepAnalysisView';
import QuickWinsView from '@/components/QuickWinsView';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTier } from '@/hooks/useTier';
import type { ProAnalysisResult } from '@/lib/proAnalysisStore';
import { hasProAccess } from '@/lib/tierConfig';

interface TabConfig {
  id: string;
  label: string;
  description: string;
}

const tabs: TabConfig[] = [
  {
    id: 'quick-wins',
    label: 'Quick Wins',
    description: 'Easy optimizations you can implement in minutes',
  },
  {
    id: 'deep-analysis',
    label: 'Deep Analysis',
    description: 'Detailed breakdown with technical and content fixes',
  },
  {
    id: 'competitive',
    label: 'Competitive Analysis',
    description: 'Compare your page against competitors',
  },
  {
    id: 'ai-rewrite',
    label: 'AI Done-for-You',
    description: 'AI-optimized rewrite of your content',
  },
];

export default function ProDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier } = useTier();
  const [activeTab, setActiveTab] = useState('quick-wins');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);
  const [scanLimit] = useState(30); // Will be configurable later
  const [currentAnalysis, setCurrentAnalysis] = useState<ProAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has Pro access
  useEffect(() => {
    // Temporarily allow all users for testing
    // TODO: Re-enable this check when auth/payments are implemented
    // if (!hasProAccess(tier)) {
    //   router.push('/pricing');
    // }
  }, [tier, router]);

  // Handle URL from query params (upgrade flow)
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
      // Auto-start analysis if URL is provided
      if (urlParam && !isAnalyzing) {
        handleAnalyze(decodeURIComponent(urlParam));
      }
    }
  }, [searchParams]);

  // Load scan usage from storage
  useEffect(() => {
    // For now, use a session-based ID (will be replaced with actual user ID)
    const userId = sessionStorage.getItem('proUserId') || generateUserId();
    sessionStorage.setItem('proUserId', userId);

    // Get usage will be done via API in the future
    const mockUsage = parseInt(localStorage.getItem('proScansUsed') || '0');
    setScansUsed(mockUsage);
  }, []);

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAnalyze = async (urlToAnalyze: string = url) => {
    if (!urlToAnalyze.trim()) return;

    if (scansUsed >= scanLimit) {
      setError(
        'You have reached your monthly scan limit. Please upgrade your plan for more scans.'
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const userId = sessionStorage.getItem('proUserId') || generateUserId();

      const response = await fetch('/api/pro/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlToAnalyze,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Update scan count
      setScansUsed(data.data.usage.count);
      localStorage.setItem('proScansUsed', data.data.usage.count.toString());

      // Store the analysis result
      setCurrentAnalysis(data.data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Pro Dashboard</h1>
                {/* Testing Mode Badge */}
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                  Testing Mode
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                Advanced AI search analysis and optimization tools
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Monthly Scans</p>
              <p className="text-2xl font-semibold text-gray-900">
                {scansUsed} / {scanLimit}
              </p>
            </div>
          </motion.div>
        </div>

        {/* URL Input Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Analyze a URL</h2>
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                disabled={isAnalyzing}
              />
              <Button
                onClick={() => handleAnalyze()}
                disabled={!url.trim() || isAnalyzing || scansUsed >= scanLimit}
                variant="primary"
              >
                {isAnalyzing ? 'Analyzing...' : 'Deep Analysis'}
              </Button>
            </div>
            {scansUsed >= scanLimit && (
              <p className="mt-2 text-sm text-red-600">
                You've reached your monthly scan limit. Contact support to increase your limit.
              </p>
            )}
            {scansUsed > 0 && scansUsed < scanLimit && (
              <p className="mt-2 text-sm text-gray-600">
                {scanLimit - scansUsed} scans remaining this month. Resets on the 1st.
              </p>
            )}
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 pb-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'quick-wins' ? (
            <QuickWinsView analysisResult={currentAnalysis} isLoading={isAnalyzing} />
          ) : activeTab === 'deep-analysis' ? (
            currentAnalysis ? (
              <EnhancedDeepAnalysisView analysisResult={currentAnalysis} isLoading={isAnalyzing} />
            ) : (
              <Card>
                <div className="p-6">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">Deep Analysis</h2>
                  {error ? (
                    <div className="rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      {url
                        ? isAnalyzing
                          ? 'Performing deep analysis of your content...'
                          : 'Deep analysis results will appear here after scanning.'
                        : 'Enter a URL above to start your deep analysis.'}
                    </p>
                  )}
                </div>
              </Card>
            )
          ) : activeTab === 'competitive' ? (
            <CompetitiveAnalysisView analysisResult={currentAnalysis} isLoading={isAnalyzing} />
          ) : currentAnalysis ? (
            <AiRewriteView analysis={currentAnalysis} />
          ) : (
            <Card>
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  AI Done-for-You Rewrite
                </h2>
                <p className="text-gray-600">
                  {url
                    ? 'Run analysis first to generate an AI-optimized rewrite.'
                    : 'Enter a URL above to generate an AI-optimized rewrite.'}
                </p>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            Need help? Check out our{' '}
            <a href="/docs" className="text-blue-600 hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="/support" className="text-blue-600 hover:underline">
              contact support
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
