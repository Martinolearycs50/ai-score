'use client';

import React, { useState } from 'react';

import {
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { ProAnalysisResult } from '@/lib/proAnalysisStore';

import { Badge } from './ui/Badge';
import Button from './ui/Button';
import { Card } from './ui/Card';

interface QuickWinsViewProps {
  analysisResult: ProAnalysisResult | null;
  isLoading: boolean;
}

interface QuickWin {
  id: string;
  title: string;
  category: 'content' | 'technical' | 'structure' | 'trust';
  timeToImplement: string;
  impact: 'high' | 'medium' | 'low';
  aiGain: number;
  seoGain: number;
  currentState: string;
  desiredState: string;
  steps: string[];
  isDualBenefit: boolean;
  completed?: boolean;
}

export default function QuickWinsView({ analysisResult, isLoading }: QuickWinsViewProps) {
  const [completedWins, setCompletedWins] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Finding quick optimization opportunities...</p>
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

  // Extract quick wins from the analysis
  const quickWins = generateQuickWins(analysisResult);
  const sortedWins = quickWins
    .filter((win) => !completedWins.has(win.id))
    .sort((a, b) => {
      // Sort by impact and time to implement
      const impactScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const timeScore: Record<string, number> = {
        '5 minutes': 3,
        '15 minutes': 2,
        '30 minutes': 1,
        '1 hour': 0,
      };

      const aScore = impactScore[a.impact] + (timeScore[a.timeToImplement] || 0);
      const bScore = impactScore[b.impact] + (timeScore[b.timeToImplement] || 0);

      return bScore - aScore;
    });

  const handleMarkComplete = (winId: string) => {
    setCompletedWins(new Set([...completedWins, winId]));
  };

  const handleCopySteps = async (win: QuickWin) => {
    const stepsText = win.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    const fullText = `${win.title}\n\nSteps to implement:\n${stepsText}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(win.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const completedCount = completedWins.size;
  const totalCount = quickWins.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quick Wins Progress</h3>
            <Badge variant="secondary">
              {completedCount} of {totalCount} completed
            </Badge>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Complete these quick optimizations to boost your AI search visibility
          </p>
        </div>
      </Card>

      {/* Quick Wins List */}
      <div className="space-y-4">
        {sortedWins.map((win, index) => (
          <motion.div
            key={win.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="transition-shadow hover:shadow-lg">
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-3">
                    <div
                      className={`mt-1 rounded-lg p-2 ${
                        win.isDualBenefit ? 'bg-purple-100' : 'bg-blue-100'
                      }`}
                    >
                      <BoltIcon
                        className={`h-5 w-5 ${
                          win.isDualBenefit ? 'text-purple-600' : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-medium text-gray-900">{win.title}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-gray-500">
                          <ClockIcon className="mr-1 h-4 w-4" />
                          {win.timeToImplement}
                        </span>
                        <Badge
                          variant={
                            win.impact === 'high'
                              ? 'default'
                              : win.impact === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {win.impact} impact
                        </Badge>
                        {win.isDualBenefit && <Badge variant="secondary">🎯 Dual Benefit</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      +{win.aiGain + win.seoGain}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>

                {/* Current vs Desired State */}
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="mb-1 text-xs font-medium text-red-700">Current State</p>
                    <p className="text-sm text-red-600">{win.currentState}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="mb-1 text-xs font-medium text-green-700">Desired State</p>
                    <p className="text-sm text-green-600">{win.desiredState}</p>
                  </div>
                </div>

                {/* Implementation Steps */}
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <h5 className="mb-2 text-sm font-medium text-gray-700">Steps to implement:</h5>
                  <ol className="space-y-2">
                    {win.steps.map((step, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        <span className="mr-2 font-medium text-gray-700">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button onClick={() => handleCopySteps(win)} variant="secondary" size="sm">
                      <DocumentDuplicateIcon className="mr-1 h-4 w-4" />
                      {copiedId === win.id ? 'Copied!' : 'Copy Steps'}
                    </Button>
                  </div>
                  <Button onClick={() => handleMarkComplete(win.id)} variant="primary" size="sm">
                    <CheckCircleIcon className="mr-1 h-4 w-4" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completed Section */}
      {completedWins.size > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Completed Optimizations</h3>
          <div className="space-y-2">
            {quickWins
              .filter((win) => completedWins.has(win.id))
              .map((win) => (
                <div key={win.id} className="flex items-center rounded-lg bg-green-50 p-3">
                  <CheckCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">{win.title}</span>
                  <span className="ml-auto text-sm font-medium text-green-600">
                    +{win.aiGain + win.seoGain} points
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate quick wins from analysis results
 */
function generateQuickWins(analysis: ProAnalysisResult): QuickWin[] {
  const wins: QuickWin[] = [];
  const results = analysis.analysis.scoringResult.pillarScores;
  const breakdown = analysis.analysis.scoringResult.breakdown;

  // Get the checks data from breakdown
  const structureChecks = breakdown.find((b) => b.pillar === 'STRUCTURE')?.checks || {};
  const factDensityChecks = breakdown.find((b) => b.pillar === 'FACT_DENSITY')?.checks || {};
  const recencyChecks = breakdown.find((b) => b.pillar === 'RECENCY')?.checks || {};
  const trustChecks = breakdown.find((b) => b.pillar === 'TRUST')?.checks || {};

  // Title optimization
  const title =
    analysis.analysis.extractedContent?.contentSamples?.title || analysis.analysis.pageTitle || '';

  console.log('[QuickWinsView] Title data:', {
    extractedTitle: analysis.analysis.extractedContent?.contentSamples?.title,
    pageTitle: analysis.analysis.pageTitle,
    finalTitle: title,
    includesBar: title.includes('|'),
    includesDash: title.includes('-'),
  });

  if (title && !title.includes('|') && !title.includes('-')) {
    wins.push({
      id: 'title-separator',
      title: 'Add Brand Separator to Title',
      category: 'structure',
      timeToImplement: '5 minutes',
      impact: 'high',
      aiGain: 3,
      seoGain: 5,
      currentState: title || 'Current title',
      desiredState: title
        ? `${title} | Your Brand Name`
        : 'Add a descriptive title | Your Brand Name',
      steps: [
        'Open your CMS or HTML editor',
        'Locate the <title> tag or page title field',
        'Add " | Your Brand Name" at the end',
        'Save and publish the change',
      ],
      isDualBenefit: true,
    });
  }

  // Meta description - try new path first, then fallback to old path
  const metaDescription =
    analysis.analysis.extractedContent?.contentSamples?.metaDescription ||
    analysis.analysis.extractedContent?.metaDescription ||
    analysis.analysis.pageDescription ||
    '';

  console.log('[QuickWinsView] Meta description data:', {
    contentSamplesMetaDesc: analysis.analysis.extractedContent?.contentSamples?.metaDescription,
    extractedMetaDesc: analysis.analysis.extractedContent?.metaDescription,
    pageDescription: analysis.analysis.pageDescription,
    finalMetaDesc: metaDescription,
    length: metaDescription.length,
  });

  if (!metaDescription || metaDescription.length < 120) {
    wins.push({
      id: 'meta-description',
      title: 'Write Compelling Meta Description',
      category: 'content',
      timeToImplement: '15 minutes',
      impact: 'high',
      aiGain: 5,
      seoGain: 8,
      currentState: 'Missing or short meta description',
      desiredState: '150-160 character description with keywords and call-to-action',
      steps: [
        'Write a 150-160 character summary of your page',
        'Include your main keyword naturally',
        'Add a compelling reason to click',
        'Add to <meta name="description" content="..."> in HTML',
        'Or update in your CMS SEO settings',
      ],
      isDualBenefit: true,
    });
  }

  // Quick heading fixes
  if ((structureChecks as any)?.headingFrequency < 5) {
    wins.push({
      id: 'add-headings',
      title: 'Add Question-Based Headings',
      category: 'structure',
      timeToImplement: '30 minutes',
      impact: 'high',
      aiGain: 10,
      seoGain: 5,
      currentState: 'Few headings, poor content structure',
      desiredState: 'Clear H2/H3 headings every 150-300 words',
      steps: [
        'Identify main topics in your content',
        'Convert each topic to a question (What is...? How to...?)',
        'Add these as H2 headings',
        'Add 2-3 H3 subheadings under each H2',
        'Ensure each heading has 150-300 words of content',
      ],
      isDualBenefit: true,
    });
  }

  // Add current date
  if ((recencyChecks as any)?.currentYear < 5) {
    wins.push({
      id: 'add-dates',
      title: 'Add Current Year and "Last Updated" Date',
      category: 'trust',
      timeToImplement: '5 minutes',
      impact: 'medium',
      aiGain: 5,
      seoGain: 3,
      currentState: 'No recent dates visible',
      desiredState: 'Shows "Last updated: [Current Date]" and mentions 2024/2025',
      steps: [
        'Add "Last updated: [Today\'s date]" near the title',
        'Update any outdated year references to 2024/2025',
        'Add "(Updated 2024)" to your title if evergreen content',
        'Set up automatic date updates if possible in your CMS',
      ],
      isDualBenefit: true,
    });
  }

  // Quick data points
  if ((factDensityChecks as any)?.uniqueStats < 5) {
    wins.push({
      id: 'add-stats',
      title: 'Add 3 Specific Statistics',
      category: 'content',
      timeToImplement: '30 minutes',
      impact: 'high',
      aiGain: 10,
      seoGain: 3,
      currentState: 'Vague claims without data',
      desiredState: 'Specific statistics with sources',
      steps: [
        'Find 3 relevant statistics for your topic on Statista or similar',
        'Replace vague claims (many, most, some) with specific numbers',
        'Add source citations in parentheses',
        'Example: "73% of users prefer X (Source: 2024 Industry Report)"',
      ],
      isDualBenefit: false,
    });
  }

  // Schema markup
  if ((structureChecks as any)?.structuredData < 5) {
    wins.push({
      id: 'add-schema',
      title: 'Add Basic Article Schema',
      category: 'technical',
      timeToImplement: '15 minutes',
      impact: 'high',
      aiGain: 5,
      seoGain: 10,
      currentState: 'No structured data',
      desiredState: 'Article schema with author, date, description',
      steps: [
        "Go to Google's Structured Data Markup Helper",
        'Select "Article" and enter your URL',
        'Highlight and tag: title, author, publish date, image',
        'Generate the JSON-LD code',
        "Add to your page's <head> section",
      ],
      isDualBenefit: true,
    });
  }

  // Author bio
  if ((trustChecks as any)?.authorBio < 5) {
    wins.push({
      id: 'add-author',
      title: 'Add Author Bio with Credentials',
      category: 'trust',
      timeToImplement: '15 minutes',
      impact: 'medium',
      aiGain: 5,
      seoGain: 5,
      currentState: 'No author information',
      desiredState: 'Clear author byline with credentials',
      steps: [
        'Add "By [Your Name], [Your Title]" after the title',
        'Write a 2-3 sentence bio highlighting expertise',
        'Include relevant credentials or experience',
        'Add author schema markup',
        'Link to your LinkedIn or professional profile',
      ],
      isDualBenefit: true,
    });
  }

  // Quick FAQ section
  const contentText =
    analysis.analysis.extractedContent?.contentSamples?.paragraphs?.join(' ') || '';
  const hasQA =
    contentText.includes('?') && (contentText.includes('A:') || contentText.includes('Answer:'));

  if (!hasQA) {
    wins.push({
      id: 'add-faq',
      title: 'Add FAQ Section with 5 Questions',
      category: 'content',
      timeToImplement: '30 minutes',
      impact: 'high',
      aiGain: 8,
      seoGain: 7,
      currentState: 'No Q&A format',
      desiredState: 'FAQ section with direct answers',
      steps: [
        'Research 5 common questions about your topic',
        'Add "Frequently Asked Questions" H2 heading',
        'Format each as: Q: [Question]? A: [Direct answer]',
        'Keep answers concise (50-100 words)',
        'Add FAQ schema markup for rich results',
      ],
      isDualBenefit: true,
    });
  }

  return wins;
}
