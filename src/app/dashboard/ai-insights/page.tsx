'use client';

import { useEffect, useState } from 'react';

import {
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import AIInsightCard from '../components/AIInsightCard';
import ImpactPredictor from '../components/ImpactPredictor';
import RoadmapTimeline from '../components/RoadmapTimeline';

// Mock AI-generated content
const mockAIInsights = {
  executiveSummary: {
    title: 'Executive AI Analysis',
    content:
      'Your website demonstrates strong technical fundamentals with a score of 78/100, placing you in the top 25% of analyzed sites. The primary opportunity lies in enhancing trust signals and fact density, which could elevate your score to 90+ and significantly improve AI citation rates. Based on our analysis, implementing the recommended changes could increase your AI visibility by 47% within 30 days.',
    keyPoints: [
      'Strong retrieval performance (85% score) ensures AI can access your content',
      'Structure optimization needed for listicle format (32.5% higher citation rate)',
      'Missing author information impacts trust score significantly',
      'Quick wins available that could boost score by 15 points in under 2 hours',
    ],
  },
  platformInsights: [
    {
      platform: 'ChatGPT',
      score: 82,
      status: 'good',
      insight:
        "Your content structure aligns well with ChatGPT's preference for clear headings and direct answers. Adding more statistical data would improve citation likelihood.",
      recommendation: "Include a 'Quick Facts' section at the beginning of articles",
    },
    {
      platform: 'Claude',
      score: 88,
      status: 'excellent',
      insight:
        'Claude favors your comprehensive content approach. The logical flow and detailed explanations match its training preferences.',
      recommendation: 'Add more primary source citations to maximize authority',
    },
    {
      platform: 'Perplexity',
      score: 75,
      status: 'fair',
      insight:
        'Perplexity prioritizes recent, data-rich content. Your fact density needs improvement for better visibility.',
      recommendation: 'Include more charts, statistics, and recent data points',
    },
    {
      platform: 'Gemini',
      score: 79,
      status: 'good',
      insight:
        "Google's Gemini appreciates your semantic markup but wants faster page loads for mobile indexing.",
      recommendation: 'Optimize images and implement lazy loading',
    },
  ],
  industryIntelligence: {
    category: 'Technology/SaaS',
    insights: [
      {
        type: 'trend',
        title: 'AI platforms increasingly favor technical documentation',
        description: 'Sites with clear API docs and code examples see 3.2x more AI citations',
        action: 'Add code snippets and technical examples to your content',
      },
      {
        type: 'competitor',
        title: 'Top competitors use structured data extensively',
        description: 'Leading sites in your space average 12 schema types vs your 3',
        action: 'Implement Product, FAQ, and HowTo schema markup',
      },
      {
        type: 'opportunity',
        title: 'Voice search optimization gap',
        description: 'Only 15% of your competitors optimize for conversational queries',
        action: 'Create FAQ sections with natural language questions',
      },
    ],
  },
  roadmap: [
    {
      id: 1,
      month: 'Month 1',
      title: 'Foundation Fixes',
      tasks: [
        {
          name: 'Add author information to all pages',
          impact: 5,
          effort: '30 min',
          completed: false,
        },
        { name: 'Implement last-updated dates', impact: 3, effort: '1 hour', completed: false },
        { name: 'Create FAQ schema markup', impact: 8, effort: '2 hours', completed: false },
        { name: 'Optimize page load speed', impact: 7, effort: '3 hours', completed: false },
      ],
      totalImpact: 23,
    },
    {
      id: 2,
      month: 'Month 2',
      title: 'Content Enhancement',
      tasks: [
        {
          name: 'Add statistical data to top pages',
          impact: 10,
          effort: '4 hours',
          completed: false,
        },
        { name: 'Create comparison tables', impact: 6, effort: '2 hours', completed: false },
        { name: 'Write executive summaries', impact: 8, effort: '3 hours', completed: false },
        {
          name: 'Implement listicle format for guides',
          impact: 12,
          effort: '5 hours',
          completed: false,
        },
      ],
      totalImpact: 36,
    },
    {
      id: 3,
      month: 'Month 3',
      title: 'Advanced Optimization',
      tasks: [
        {
          name: 'Build interactive data visualizations',
          impact: 15,
          effort: '8 hours',
          completed: false,
        },
        { name: 'Create video summaries', impact: 10, effort: '6 hours', completed: false },
        {
          name: 'Implement A/B testing for titles',
          impact: 8,
          effort: '4 hours',
          completed: false,
        },
        { name: 'Launch link-building campaign', impact: 12, effort: 'Ongoing', completed: false },
      ],
      totalImpact: 45,
    },
  ],
};

export default function AIInsightsPage() {
  const [typedText, setTypedText] = useState('');
  const [showContent, setShowContent] = useState(false);

  // Typewriter effect for executive summary
  useEffect(() => {
    const text = mockAIInsights.executiveSummary.content;
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowContent(true), 500);
      }
    }, 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-foreground text-3xl font-bold">AI-Powered Insights</h1>
        <p className="text-body mt-2">
          Personalized recommendations powered by advanced AI analysis
        </p>
      </div>

      {/* Executive Summary with Typewriter Effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-8"
      >
        <div className="mb-6 flex items-center space-x-3">
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--accent)' }}>
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-foreground text-2xl font-semibold">
            {mockAIInsights.executiveSummary.title}
          </h2>
          <span
            className="animate-pulse rounded-full px-3 py-1 text-xs text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            AI Generated
          </span>
        </div>
        <div className="prose prose-blue max-w-none">
          <p className="text-body leading-relaxed">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <h3 className="text-foreground mb-3 font-medium">Key Findings:</h3>
            {mockAIInsights.executiveSummary.keyPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <CheckIcon
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  style={{ color: 'var(--success)' }}
                />
                <p className="text-body">{point}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Platform Insights Grid */}
      {showContent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="text-foreground mb-6 text-xl font-semibold">
            Platform-Specific Optimization
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {mockAIInsights.platformInsights.map((platform, index) => (
              <AIInsightCard
                key={platform.platform}
                platform={platform.platform}
                score={platform.score}
                status={platform.status as any}
                insight={platform.insight}
                recommendation={platform.recommendation}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Two Column Layout */}
      {showContent && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Impact Predictor */}
          <ImpactPredictor roadmap={mockAIInsights.roadmap} />

          {/* Industry Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card rounded-xl p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center space-x-3">
              <LightBulbIcon className="h-6 w-6 text-yellow-600" />
              <h2 className="text-foreground text-xl font-semibold">Industry Intelligence</h2>
            </div>
            <p className="text-body mb-4 text-sm">
              Insights specific to {mockAIInsights.industryIntelligence.category}
            </p>
            <div className="space-y-4">
              {mockAIInsights.industryIntelligence.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 rounded-lg p-1.5 ${
                        insight.type === 'trend'
                          ? 'bg-blue-100'
                          : insight.type === 'competitor'
                            ? 'bg-orange-100'
                            : 'bg-green-100'
                      }`}
                    >
                      {insight.type === 'trend' ? (
                        <ArrowTrendingUpIcon className="text-accent h-4 w-4" />
                      ) : insight.type === 'competitor' ? (
                        <ChartBarIcon className="h-4 w-4 text-orange-600" />
                      ) : (
                        <RocketLaunchIcon className="h-4 w-4" style={{ color: 'var(--success)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground text-sm font-medium">{insight.title}</h4>
                      <p className="text-body mt-1 text-xs">{insight.description}</p>
                      <p className="text-accent mt-2 text-xs font-medium">→ {insight.action}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Roadmap Timeline */}
      {showContent && <RoadmapTimeline roadmap={mockAIInsights.roadmap} />}
    </div>
  );
}
