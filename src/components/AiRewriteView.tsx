'use client';

import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ProAnalysisResult } from '@/lib/proAnalysisStore';

interface AiRewriteViewProps {
  analysis: ProAnalysisResult;
}

export default function AiRewriteView({ analysis }: AiRewriteViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewriteData, setRewriteData] = useState(analysis.aiRewrite);
  const [showDiff, setShowDiff] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRewritten, setCopiedRewritten] = useState(false);

  // Check if rewrite exists on mount
  useEffect(() => {
    if (!analysis.aiRewrite) {
      // Auto-generate on first visit
      generateRewrite();
    }
  }, []);

  const generateRewrite = async (regenerate = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pro/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: analysis.sessionId,
          regenerate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate rewrite');
      }

      setRewriteData(data.data.rewrite);
    } catch (error) {
      console.error('Rewrite failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate rewrite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, type: 'original' | 'rewritten') => {
    try {
      await navigator.clipboard.writeText(content);
      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedRewritten(true);
        setTimeout(() => setCopiedRewritten(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderImprovements = () => {
    if (!rewriteData?.improvements?.length) return null;

    // Group improvements by benefit type
    const dualBenefits = rewriteData.improvements.filter((imp) => imp.benefitType === 'dual');
    const aiBenefits = rewriteData.improvements.filter(
      (imp) => imp.benefitType === 'ai' || !imp.benefitType
    );
    const seoBenefits = rewriteData.improvements.filter((imp) => imp.benefitType === 'seo');

    return (
      <div className="mb-6 space-y-4">
        {/* Dual Benefits */}
        {dualBenefits.length > 0 && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-semibold text-purple-900">
              <Zap className="mr-2 h-5 w-5" />
              Dual-Benefit Improvements (AI + SEO)
            </h3>
            <ul className="space-y-2">
              {dualBenefits.map((imp, i) => (
                <li key={i} className="flex items-start text-sm text-purple-700">
                  <span className="mr-2">🎯</span>
                  <span>{imp.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Benefits */}
        {aiBenefits.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-semibold text-blue-900">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Search Improvements
            </h3>
            <ul className="space-y-2">
              {aiBenefits.map((imp, i) => (
                <li key={i} className="flex items-start text-sm text-blue-700">
                  <span className="mr-2">🤖</span>
                  <span>{imp.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SEO Benefits */}
        {seoBenefits.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-semibold text-green-900">
              <Search className="mr-2 h-5 w-5" />
              SEO Improvements
            </h3>
            <ul className="space-y-2">
              {seoBenefits.map((imp, i) => (
                <li key={i} className="flex items-start text-sm text-green-700">
                  <span className="mr-2">🔍</span>
                  <span>{imp.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDataPoints = () => {
    if (!rewriteData?.addedDataPoints?.length) return null;

    return (
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">Added Data Points</h3>
        <ul className="space-y-2">
          {rewriteData.addedDataPoints.map((point, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium text-blue-900">{point.value}</span>
              <span className="ml-2 text-blue-700">(Source: {point.source})</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (isLoading && !rewriteData) {
    return (
      <Card>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Generating AI-optimized rewrite...</p>
            <p className="mt-2 text-sm text-gray-500">This may take 30-60 seconds</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !rewriteData) {
    return (
      <Card>
        <div className="p-6">
          <div className="mb-4 flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            <h3 className="text-lg font-semibold">Rewrite Failed</h3>
          </div>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => generateRewrite()} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Improvements and Data Points */}
      <AnimatePresence>
        {rewriteData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderImprovements()}
            {renderDataPoints()}
            {/* SEO Enhancements */}
            {rewriteData?.seoEnhancements && rewriteData.seoEnhancements.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-amber-900">
                  <Search className="mr-2 h-5 w-5" />
                  SEO-Specific Enhancements
                </h3>
                <ul className="space-y-2">
                  {rewriteData.seoEnhancements.map((enhancement, i) => (
                    <li key={i} className="flex items-start text-sm text-amber-700">
                      <ChevronRight className="mt-0.5 mr-1 h-3 w-3 flex-shrink-0" />
                      <span>{enhancement.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Original Content */}
        <Card>
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Original Content</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(rewriteData?.originalMarkdown || '', 'original')}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  {copiedOriginal ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <pre className="max-h-[600px] overflow-auto rounded-lg bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-700">
              {rewriteData?.originalMarkdown || 'Loading original content...'}
            </pre>
          </div>
        </Card>

        {/* Rewritten Content */}
        <Card>
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                AI + SEO Optimized Rewrite
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(rewriteData?.rewrittenContent || '', 'rewritten')}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  {copiedRewritten ? 'Copied!' : 'Copy All'}
                </Button>
                <Button
                  onClick={() =>
                    handleDownload(
                      rewriteData?.rewrittenContent || '',
                      `${analysis.url.replace(/^https?:\/\//, '').replace(/\//g, '-')}-optimized.md`
                    )
                  }
                  variant="secondary"
                  size="sm"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex h-[600px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-600">Regenerating content...</p>
                </div>
              </div>
            ) : (
              <pre className="max-h-[600px] overflow-auto rounded-lg bg-blue-50 p-4 text-sm whitespace-pre-wrap text-gray-700">
                {rewriteData?.rewrittenContent || 'Content will appear here...'}
              </pre>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {rewriteData?.metadata?.estimatedCost && (
            <span>
              Estimated cost: ${rewriteData.metadata.estimatedCost.toFixed(3)} •{' '}
              {rewriteData.metadata.tokensUsed} tokens used
            </span>
          )}
        </div>
        <Button onClick={() => generateRewrite(true)} variant="secondary" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
