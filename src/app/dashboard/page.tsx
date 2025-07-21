'use client';

import { useEffect, useState } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cssVars } from '@/lib/design-system/colors';

import CompetitorQuickView from './components/CompetitorQuickView';
import MetricCard from './components/MetricCard';
import ScoreBreakdownChart from './components/ScoreBreakdownChart';

// Mock data for the dashboard
const mockAnalysisData = {
  url: 'https://example.com',
  currentScore: 78,
  previousScore: 72,
  lastAnalyzed: '2 hours ago',
  pillars: [
    { name: 'Retrieval', score: 85, max: 30, earned: 25.5 },
    { name: 'Fact Density', score: 72, max: 25, earned: 18 },
    { name: 'Structure', score: 90, max: 20, earned: 18 },
    { name: 'Trust', score: 67, max: 15, earned: 10 },
    { name: 'Recency', score: 65, max: 10, earned: 6.5 },
  ],
  issues: [
    {
      severity: 'high',
      pillar: 'Trust',
      issue: 'Missing author information',
      impact: 5,
      timeToFix: '10 min',
      description: 'AI platforms prioritize content with clear authorship for credibility.',
    },
    {
      severity: 'medium',
      pillar: 'Fact Density',
      issue: 'Low statistical content',
      impact: 7,
      timeToFix: '30 min',
      description:
        'Add more data points, statistics, and specific examples to increase fact density.',
    },
    {
      severity: 'low',
      pillar: 'Recency',
      issue: 'No last updated date',
      impact: 3,
      timeToFix: '5 min',
      description: 'Display when content was last updated to signal freshness.',
    },
  ],
  competitors: [
    { name: 'competitor1.com', score: 82 },
    { name: 'competitor2.com', score: 75 },
  ],
};

export default function DashboardAnalysisPage() {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState(mockAnalysisData);

  useEffect(() => {
    // Check if we have a fresh analysis result from the main page
    const storedAnalysis = sessionStorage.getItem('latestAnalysis');
    if (storedAnalysis) {
      try {
        const parsed = JSON.parse(storedAnalysis);
        // Transform the real analysis data to match our dashboard format
        // For now, we'll just update the score and URL
        setAnalysisData((prev) => ({
          ...prev,
          url: parsed.url,
          currentScore: parsed.aiSearchScore,
          // Map the pillar data from the real analysis
          pillars: parsed.scoringResult.breakdown.map((pillar: any) => ({
            name: pillar.pillar,
            score: Math.round((pillar.earned / pillar.max) * 100),
            max: pillar.max,
            earned: pillar.earned,
          })),
        }));
        // Clear the stored data after use
        sessionStorage.removeItem('latestAnalysis');
      } catch (error) {
        console.error('Failed to parse stored analysis:', error);
      }
    }
  }, []);

  const scoreChange = analysisData.currentScore - analysisData.previousScore;

  return (
    <div className="space-y-8" style={{ backgroundColor: cssVars.background }}>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: cssVars.foreground }}>
          Analysis Dashboard
        </h1>
        <p className="mt-2" style={{ color: cssVars.text }}>
          Comprehensive breakdown of your AI search optimization score
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="Current Score"
          value={analysisData.currentScore}
          subtitle="out of 100"
          change={scoreChange}
          icon={<ChartBarIcon className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Score Improvement"
          value={`+${scoreChange}`}
          subtitle="since last analysis"
          trend="up"
          icon={<ArrowUpIcon className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Priority Improvements"
          value={analysisData.issues.filter((i) => i.severity === 'high').length}
          subtitle="opportunities to improve"
          icon={<ExclamationCircleIcon className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Score Breakdown Chart */}
      <Card>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: cssVars.foreground }}>
              Score Breakdown
            </h2>
            <div className="text-sm" style={{ color: cssVars.muted }}>
              Last analyzed: {analysisData.lastAnalyzed}
            </div>
          </div>
          <ScoreBreakdownChart
            data={analysisData.pillars}
            onPillarClick={setSelectedPillar}
            selectedPillar={selectedPillar}
          />
        </motion.div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Priority Fixes - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: cssVars.foreground }}>
                  Priority Improvements
                </h2>
                <span className="text-sm" style={{ color: cssVars.muted }}>
                  Sorted by impact
                </span>
              </div>
              <div className="space-y-4">
                {analysisData.issues.map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                    style={{ borderColor: cssVars.border }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span
                            className="rounded-full px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor:
                                issue.severity === 'high'
                                  ? `${cssVars.error}20`
                                  : issue.severity === 'medium'
                                    ? `${cssVars.warning}20`
                                    : `${cssVars.accent}20`,
                              color:
                                issue.severity === 'high'
                                  ? cssVars.error
                                  : issue.severity === 'medium'
                                    ? cssVars.warning
                                    : cssVars.accent,
                            }}
                          >
                            {issue.severity === 'high'
                              ? 'HIGH PRIORITY'
                              : issue.severity === 'medium'
                                ? 'MEDIUM'
                                : 'LOW'}
                          </span>
                          <span className="text-sm" style={{ color: cssVars.muted }}>
                            {issue.pillar}
                          </span>
                        </div>
                        <h3 className="mt-2 font-medium" style={{ color: cssVars.foreground }}>
                          {issue.issue}
                        </h3>
                        <p className="mt-1 text-sm" style={{ color: cssVars.text }}>
                          {issue.description}
                        </p>
                        <div className="mt-3 flex items-center space-x-4 text-sm">
                          <div
                            className="flex items-center space-x-1"
                            style={{ color: cssVars.success }}
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                            <span>+{issue.impact} points potential</span>
                          </div>
                          <div
                            className="flex items-center space-x-1"
                            style={{ color: cssVars.muted }}
                          >
                            <ClockIcon className="h-4 w-4" />
                            <span>{issue.timeToFix}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="accent" size="sm" className="ml-4">
                        View Fix
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div
                className="mt-6 rounded-lg p-4"
                style={{ backgroundColor: `${cssVars.accent}10` }}
              >
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="mt-0.5 h-5 w-5" style={{ color: cssVars.accent }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: cssVars.foreground }}>
                      Pro Tip
                    </p>
                    <p className="mt-1 text-sm" style={{ color: cssVars.text }}>
                      Addressing all priority improvements could boost your score by up to 15
                      points, making your content more visible to AI search engines.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        </div>

        {/* Competitor Quick View - 1/3 width */}
        <div className="lg:col-span-1">
          <CompetitorQuickView
            competitors={analysisData.competitors}
            currentScore={analysisData.currentScore}
          />
        </div>
      </div>
    </div>
  );
}
