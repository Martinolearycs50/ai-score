'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ScoreBreakdownChart from './components/ScoreBreakdownChart';
import MetricCard from './components/MetricCard';
import CompetitorQuickView from './components/CompetitorQuickView';

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
    { name: 'Recency', score: 65, max: 10, earned: 6.5 }
  ],
  issues: [
    {
      severity: 'high',
      pillar: 'Trust',
      issue: 'Missing author information',
      impact: 5,
      timeToFix: '10 min',
      description: 'AI platforms prioritize content with clear authorship for credibility.'
    },
    {
      severity: 'medium',
      pillar: 'Fact Density',
      issue: 'Low statistical content',
      impact: 7,
      timeToFix: '30 min',
      description: 'Add more data points, statistics, and specific examples to increase fact density.'
    },
    {
      severity: 'low',
      pillar: 'Recency',
      issue: 'No last updated date',
      impact: 3,
      timeToFix: '5 min',
      description: 'Display when content was last updated to signal freshness.'
    }
  ],
  competitors: [
    { name: 'competitor1.com', score: 82 },
    { name: 'competitor2.com', score: 75 }
  ]
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
        setAnalysisData(prev => ({
          ...prev,
          url: parsed.url,
          currentScore: parsed.aiSearchScore,
          // Map the pillar data from the real analysis
          pillars: parsed.scoringResult.breakdown.map((pillar: any) => ({
            name: pillar.pillar,
            score: Math.round((pillar.earned / pillar.max) * 100),
            max: pillar.max,
            earned: pillar.earned
          }))
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive breakdown of your AI search optimization score
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current Score"
          value={analysisData.currentScore}
          subtitle="out of 100"
          change={scoreChange}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="blue"
        />
        
        <MetricCard
          title="Score Improvement"
          value={`+${scoreChange}`}
          subtitle="since last analysis"
          trend="up"
          icon={<ArrowUpIcon className="w-6 h-6" />}
          color="green"
        />
        
        <MetricCard
          title="Critical Issues"
          value={analysisData.issues.filter(i => i.severity === 'high').length}
          subtitle="need immediate attention"
          icon={<ExclamationCircleIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Score Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Score Breakdown</h2>
          <div className="text-sm text-gray-500">
            Last analyzed: {analysisData.lastAnalyzed}
          </div>
        </div>
        
        <ScoreBreakdownChart 
          data={analysisData.pillars}
          onPillarClick={setSelectedPillar}
          selectedPillar={selectedPillar}
        />
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Fixes - 2/3 width */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Priority Fixes</h2>
              <span className="text-sm text-gray-500">
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
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'}
                        `}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{issue.pillar}</span>
                      </div>
                      
                      <h3 className="mt-2 font-medium text-gray-900">{issue.issue}</h3>
                      <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
                      
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-green-600">
                          <ArrowUpIcon className="w-4 h-4" />
                          <span>+{issue.impact} points</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{issue.timeToFix}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Fix
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                  <p className="mt-1 text-sm text-blue-700">
                    Fixing all high-priority issues could improve your score by approximately 15 points,
                    significantly boosting your AI search visibility.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Competitor Quick View - 1/3 width */}
        <div className="lg:col-span-1">
          <CompetitorQuickView competitors={analysisData.competitors} currentScore={analysisData.currentScore} />
        </div>
      </div>
    </div>
  );
}