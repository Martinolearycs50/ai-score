'use client';

import React, { useState } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { ProAnalysisResult } from '@/lib/proAnalysisStore';

import { Badge } from './ui/Badge';
import Button from './ui/Button';
import { Card } from './ui/Card';

interface CompetitiveAnalysisViewProps {
  analysisResult: ProAnalysisResult | null;
  isLoading: boolean;
}

interface CompetitorData {
  url: string;
  domain: string;
  aiScore: number;
  seoScore: number;
  strengths: string[];
  weaknesses: string[];
  lastAnalyzed?: Date;
}

interface ComparisonMetric {
  name: string;
  yourScore: number;
  competitorScore: number;
  difference: number;
  category: 'ai' | 'seo' | 'both';
}

export default function CompetitiveAnalysisView({
  analysisResult,
  isLoading,
}: CompetitiveAnalysisViewProps) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzingCompetitor, setIsAnalyzingCompetitor] = useState(false);
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Preparing competitive analysis...</p>
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

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl.trim()) return;

    setIsAnalyzingCompetitor(true);
    setError(null);

    try {
      // For now, simulate competitor analysis
      // In production, this would call the analyze API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock competitor data
      const mockCompetitor: CompetitorData = {
        url: competitorUrl,
        domain: new URL(competitorUrl).hostname,
        aiScore: Math.floor(Math.random() * 30) + 60, // 60-90
        seoScore: Math.floor(Math.random() * 30) + 65, // 65-95
        strengths: [
          'Strong heading structure',
          'Rich snippet implementation',
          'Fast page load times',
          'Comprehensive FAQ section',
        ],
        weaknesses: [
          'Limited data points',
          'No author information',
          'Missing schema markup',
          'Outdated content (2022)',
        ],
      };

      setCompetitorData(mockCompetitor);
    } catch (error) {
      console.error('Competitor analysis failed:', error);
      setError('Failed to analyze competitor. Please try again.');
    } finally {
      setIsAnalyzingCompetitor(false);
    }
  };

  const getComparisonMetrics = (): ComparisonMetric[] => {
    if (!competitorData) return [];

    const yourScores = analysisResult.analysis.scoringResult.pillarScores;

    // Simplified comparison metrics
    return [
      {
        name: 'Overall AI Search Score',
        yourScore: analysisResult.analysis.aiSearchScore,
        competitorScore: competitorData.aiScore,
        difference: analysisResult.analysis.aiSearchScore - competitorData.aiScore,
        category: 'ai',
      },
      {
        name: 'SEO Compatibility',
        yourScore: 75, // Would come from SEO scoring
        competitorScore: competitorData.seoScore,
        difference: 75 - competitorData.seoScore,
        category: 'seo',
      },
      {
        name: 'Content Depth',
        yourScore: yourScores.FACT_DENSITY || 0,
        competitorScore: 85,
        difference: (yourScores.FACT_DENSITY || 0) - 85,
        category: 'both',
      },
      {
        name: 'Page Structure',
        yourScore: yourScores.STRUCTURE || 0,
        competitorScore: 90,
        difference: (yourScores.STRUCTURE || 0) - 90,
        category: 'both',
      },
      {
        name: 'Trust Signals',
        yourScore: yourScores.TRUST || 0,
        competitorScore: 70,
        difference: (yourScores.TRUST || 0) - 70,
        category: 'both',
      },
      {
        name: 'Content Freshness',
        yourScore: yourScores.RECENCY || 0,
        competitorScore: 60,
        difference: (yourScores.RECENCY || 0) - 60,
        category: 'ai',
      },
    ];
  };

  const metrics = getComparisonMetrics();
  const aiAdvantages = metrics.filter(
    (m) => m.difference > 0 && (m.category === 'ai' || m.category === 'both')
  );
  const seoAdvantages = metrics.filter(
    (m) => m.difference > 0 && (m.category === 'seo' || m.category === 'both')
  );
  const overallWinning = metrics.filter((m) => m.difference > 0).length > metrics.length / 2;

  return (
    <div className="space-y-6">
      {/* Competitor Input */}
      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Analyze a Competitor</h3>
          <div className="flex gap-4">
            <input
              type="url"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="https://competitor.com/similar-page"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              disabled={isAnalyzingCompetitor}
            />
            <Button
              onClick={handleAnalyzeCompetitor}
              disabled={!competitorUrl.trim() || isAnalyzingCompetitor}
              variant="primary"
            >
              {isAnalyzingCompetitor ? 'Analyzing...' : 'Compare'}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-sm text-gray-600">
            Compare your page against a competitor to identify optimization opportunities
          </p>
        </div>
      </Card>

      {competitorData && (
        <>
          {/* Overall Comparison */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Your Site */}
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Your Site</h4>
                  {overallWinning && <TrophyIcon className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">AI Score:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.analysis.aiSearchScore}/100
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">SEO Score:</span>
                    <div className="text-2xl font-bold text-green-600">75/100</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* VS Badge */}
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-gray-100 px-6 py-3">
                <span className="text-xl font-bold text-gray-700">VS</span>
              </div>
            </div>

            {/* Competitor */}
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{competitorData.domain}</h4>
                  {!overallWinning && <TrophyIcon className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">AI Score:</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {competitorData.aiScore}/100
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">SEO Score:</span>
                    <div className="text-2xl font-bold text-green-600">
                      {competitorData.seoScore}/100
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Metrics Comparison */}
          <Card>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Detailed Comparison</h3>
              <div className="space-y-3">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{metric.name}</span>
                        <Badge
                          variant={
                            metric.category === 'ai'
                              ? 'default'
                              : metric.category === 'seo'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {metric.category === 'both' ? 'AI + SEO' : metric.category.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.difference > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : metric.difference < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span
                          className={`font-medium ${
                            metric.difference > 0
                              ? 'text-green-600'
                              : metric.difference < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {metric.difference > 0 ? '+' : ''}
                          {Math.abs(metric.difference)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-600">You</span>
                          <span className="font-medium">{metric.yourScore}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${metric.yourScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-600">Competitor</span>
                          <span className="font-medium">{metric.competitorScore}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-gray-600"
                            style={{ width: `${metric.competitorScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Strengths and Opportunities */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Your Advantages */}
            <Card>
              <div className="p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <TrophyIcon className="mr-2 h-5 w-5 text-green-600" />
                  Your Advantages
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">AI Search</h4>
                    <ul className="space-y-1">
                      {aiAdvantages.map((adv, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2 text-green-500">✓</span>
                          {adv.name} (+{adv.difference} points)
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">SEO</h4>
                    <ul className="space-y-1">
                      {seoAdvantages.map((adv, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2 text-green-500">✓</span>
                          {adv.name} (+{adv.difference} points)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Opportunities */}
            <Card>
              <div className="p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-amber-600" />
                  Improvement Opportunities
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  Learn from what your competitor does better:
                </p>
                <ul className="space-y-2">
                  {competitorData.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700">
                      <LinkIcon className="mt-0.5 mr-2 h-4 w-4 text-gray-400" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Action Items */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recommended Actions to Outrank Competitor
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-blue-900">For AI Search</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-blue-800">• Add more data points and statistics</li>
                    <li className="text-sm text-blue-800">• Implement question-answer format</li>
                    <li className="text-sm text-blue-800">
                      • Update content with 2024/2025 information
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-green-900">For SEO</h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-green-800">• Optimize meta descriptions</li>
                    <li className="text-sm text-green-800">• Add FAQ schema markup</li>
                    <li className="text-sm text-green-800">• Improve Core Web Vitals</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
