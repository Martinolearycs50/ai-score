'use client';

import React, { useState } from 'react';

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { enhanceWithDualBenefits, generateSEOInsights } from '@/lib/dualBenefitRecommendations';
import type { ProAnalysisResult } from '@/lib/proAnalysisStore';
import { calculateSEOCompatibility, generateSEOSummary } from '@/lib/seoCompatibilityScorer';

import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface EnhancedDeepAnalysisViewProps {
  analysisResult: ProAnalysisResult | null;
  isLoading: boolean;
}

export default function EnhancedDeepAnalysisView({
  analysisResult,
  isLoading,
}: EnhancedDeepAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'seo' | 'dual'>('all');
  const [showSEODetails, setShowSEODetails] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Analyzing content deeply...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No analysis results yet. Enter a URL above to begin.</p>
      </div>
    );
  }

  // Calculate SEO compatibility
  const seoCompatibility = calculateSEOCompatibility(
    analysisResult.analysis.scoringResult.pillarScores
  );
  const seoInsights = generateSEOInsights();

  // Enhance recommendations with dual benefits
  const allRecommendations = analysisResult.analysis.scoringResult.recommendations || [];

  const enhancedRecommendations = enhanceWithDualBenefits(
    allRecommendations.map((fix) => ({
      metric: fix.metric,
      template: {
        why: fix.why,
        fix: fix.fix,
        gain: fix.gain,
        example: fix.example,
      },
      pillar: fix.pillar,
    }))
  );

  // Filter recommendations by benefit type
  const filteredRecommendations = enhancedRecommendations.filter((rec) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'dual') return rec.benefitType === 'dual';
    if (activeTab === 'ai') return rec.benefitType === 'ai';
    if (activeTab === 'seo') return rec.benefitType === 'seo';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* AI Score and SEO Compatibility Side by Side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* AI Search Score */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <RocketLaunchIcon className="h-16 w-16 text-blue-100" />
          </div>
          <div className="relative z-10">
            <h3 className="mb-2 text-lg font-medium text-gray-900">AI Search Score</h3>
            <div className="text-4xl font-bold text-blue-600">
              {analysisResult.analysis.aiSearchScore}/100
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {analysisResult.analysis.aiSearchScore >= 80
                ? 'Excellent'
                : analysisResult.analysis.aiSearchScore >= 60
                  ? 'Good'
                  : analysisResult.analysis.aiSearchScore >= 40
                    ? 'Needs Improvement'
                    : 'Poor'}
              AI optimization
            </p>
          </div>
        </Card>

        {/* SEO Compatibility Score */}
        <Card
          className="relative cursor-pointer overflow-hidden"
          onClick={() => setShowSEODetails(!showSEODetails)}
        >
          <div className="absolute top-0 right-0 p-2">
            <MagnifyingGlassIcon className="h-16 w-16 text-green-100" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="mb-2 text-lg font-medium text-gray-900">SEO Compatibility</h3>
              <Badge variant="secondary">New</Badge>
            </div>
            <div className="text-4xl font-bold text-green-600">{seoCompatibility.overall}/100</div>
            <p className="mt-2 text-sm text-gray-600">
              {seoCompatibility.overall >= 80
                ? 'Excellent'
                : seoCompatibility.overall >= 60
                  ? 'Good'
                  : seoCompatibility.overall >= 40
                    ? 'Moderate'
                    : 'Needs Work'}
              SEO alignment
            </p>
            <p className="mt-1 text-xs text-gray-500">Click to see details →</p>
          </div>
        </Card>
      </div>

      {/* SEO Details (Expandable) */}
      {showSEODetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <h3 className="mb-4 text-lg font-medium text-gray-900">SEO Compatibility Details</h3>

            {/* SEO Breakdown */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-gray-600">Technical SEO</div>
                <div className="text-2xl font-semibold">
                  {seoCompatibility.breakdown.technicalSEO}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Content SEO</div>
                <div className="text-2xl font-semibold">
                  {seoCompatibility.breakdown.contentSEO}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Rich Results</div>
                <div className="text-2xl font-semibold">
                  {seoCompatibility.breakdown.richResults}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">User Signals</div>
                <div className="text-2xl font-semibold">
                  {seoCompatibility.breakdown.userSignals}%
                </div>
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {seoCompatibility.strengths.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center font-medium text-green-700">
                    <CheckCircleIcon className="mr-1 h-5 w-5" />
                    SEO Strengths
                  </h4>
                  <ul className="space-y-1">
                    {seoCompatibility.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {seoCompatibility.improvements.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center font-medium text-amber-700">
                    <ExclamationTriangleIcon className="mr-1 h-5 w-5" />
                    SEO Improvements
                  </h4>
                  <ul className="space-y-1">
                    {seoCompatibility.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Conflict Warnings */}
            {seoCompatibility.conflictWarnings.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4">
                <h4 className="mb-2 flex items-center font-medium text-amber-800">
                  <InformationCircleIcon className="mr-1 h-5 w-5" />
                  Optimization Trade-offs
                </h4>
                <ul className="space-y-1">
                  {seoCompatibility.conflictWarnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Recommendations Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({enhancedRecommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('dual')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'dual'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎯 Dual ({enhancedRecommendations.filter((r) => r.benefitType === 'dual').length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'ai'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🤖 AI Only ({enhancedRecommendations.filter((r) => r.benefitType === 'ai').length})
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'seo'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔍 SEO Only ({enhancedRecommendations.filter((r) => r.benefitType === 'seo').length})
          </button>
        </div>
      </div>

      {/* Enhanced Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec, index) => (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center">
                  <span className="mr-2 text-2xl">{rec.icon}</span>
                  <h4 className="font-medium text-gray-900">{rec.metric}</h4>
                  <div className="ml-3 flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      AI: {rec.aiImpact}
                    </Badge>
                    {rec.seoImpact !== 'neutral' && (
                      <Badge variant="secondary" className="text-xs">
                        SEO: {rec.seoImpact}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="mb-3 text-sm text-gray-600">{rec.why}</p>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-sm font-medium text-gray-700">How to fix:</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-600">{rec.fix}</p>
                </div>

                {rec.example && (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="mb-1 text-xs font-medium text-red-700">Before:</p>
                      <code className="text-xs text-red-600">{rec.example.before}</code>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="mb-1 text-xs font-medium text-green-700">After:</p>
                      <code className="text-xs text-green-600">{rec.example.after}</code>
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-blue-600">+{rec.gain}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SEO Insights Summary */}
      {seoInsights.opportunities.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="mb-3 flex items-center text-lg font-medium text-gray-900">
            <SparklesIcon className="mr-2 h-5 w-5 text-blue-600" />
            Quick SEO Wins
          </h3>
          <ul className="space-y-2">
            {seoInsights.opportunities.map((opportunity, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 text-green-600">→</span>
                <span className="text-sm text-gray-700">{opportunity}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
