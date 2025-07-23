'use client';

import React, { useState } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

import type { ProAnalysisResult } from '@/lib/proAnalysisStore';

import Button from './ui/Button';
import { Card } from './ui/Card';

interface DeepAnalysisViewProps {
  analysis: ProAnalysisResult;
}

export default function DeepAnalysisView({ analysis }: DeepAnalysisViewProps) {
  const [copiedTechnical, setCopiedTechnical] = useState(false);
  const [sortBy, setSortBy] = useState<'impact' | 'pillar'>('impact');
  const [expandedSections, setExpandedSections] = useState({
    scores: true,
    technical: true,
    content: true,
    headings: false,
    dataPoints: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyTechnicalTasks = async () => {
    if (!analysis.deepAnalysis) return;

    const tasks = analysis.deepAnalysis.technicalTasks.join('\n\n');
    await navigator.clipboard.writeText(tasks);
    setCopiedTechnical(true);
    setTimeout(() => setCopiedTechnical(false), 2000);
  };

  const getPillarColor = (pillar: string): string => {
    const colors: Record<string, string> = {
      RETRIEVAL: 'text-blue-600',
      FACT_DENSITY: 'text-purple-600',
      STRUCTURE: 'text-green-600',
      TRUST: 'text-orange-600',
      RECENCY: 'text-pink-600',
    };
    return colors[pillar] || 'text-gray-600';
  };

  if (!analysis.deepAnalysis) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-600">Deep analysis is being processed...</p>
        </div>
      </Card>
    );
  }

  const { deepAnalysis } = analysis;
  const sortedIssues = [...deepAnalysis.issues].sort((a, b) => {
    if (sortBy === 'impact') return b.impact - a.impact;
    return a.pillar.localeCompare(b.pillar);
  });

  return (
    <div className="space-y-6">
      {/* Decimal Scores Section */}
      <Card>
        <div className="cursor-pointer p-6" onClick={() => toggleSection('scores')}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              Detailed Pillar Scores
            </h3>
            {expandedSections.scores ? (
              <ArrowUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {expandedSections.scores && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-200 px-6 pb-6"
          >
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {analysis.analysis.scoringResult.breakdown.map((pillar) => {
                const percentage = (pillar.earned / pillar.max) * 100;
                const decimalScore = parseFloat(percentage.toFixed(1));
                const colorClass = getPillarColor(pillar.pillar);

                return (
                  <div
                    key={pillar.pillar}
                    className="rounded-lg border border-gray-200 p-4 text-center"
                  >
                    <h4 className={`text-sm font-medium ${colorClass}`}>{pillar.pillar}</h4>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{decimalScore}</div>
                    <div className="text-sm text-gray-500">
                      {pillar.earned.toFixed(1)} / {pillar.max} pts
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Technical Tasks Section */}
      <Card>
        <div className="cursor-pointer p-6" onClick={() => toggleSection('technical')}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CodeBracketIcon className="h-5 w-5 text-blue-600" />
              Technical Tasks ({deepAnalysis.technicalTasks.length})
            </h3>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyTechnicalTasks();
                }}
                className="flex items-center gap-2"
              >
                {copiedTechnical ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>
              {expandedSections.technical ? (
                <ArrowUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {expandedSections.technical && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-200 px-6 pb-6"
          >
            <div className="mt-6 space-y-3">
              {deepAnalysis.technicalTasks.map((task, index) => (
                <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="font-mono text-sm text-gray-700">{task}</p>
                </div>
              ))}
              {deepAnalysis.technicalTasks.length === 0 && (
                <p className="text-gray-500">No technical issues found!</p>
              )}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Content Tasks Section */}
      <Card>
        <div className="cursor-pointer p-6" onClick={() => toggleSection('content')}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <DocumentTextIcon className="h-5 w-5 text-green-600" />
              Content Tasks ({deepAnalysis.contentTasks.length})
            </h3>
            {expandedSections.content ? (
              <ArrowUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {expandedSections.content && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-200 px-6 pb-6"
          >
            <div className="mt-6 space-y-3">
              {deepAnalysis.contentTasks.map((task, index) => (
                <div key={index} className="rounded-lg border border-gray-200 bg-blue-50 p-4">
                  <p className="text-sm text-gray-700">{task}</p>
                </div>
              ))}
              {deepAnalysis.contentTasks.length === 0 && (
                <p className="text-gray-500">No content improvements needed!</p>
              )}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Detailed Issues Table */}
      <Card>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Issues</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'impact' | 'pillar')}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="impact">Impact</option>
                <option value="pillar">Pillar</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Fix
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Impact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Pillar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedIssues.map((issue, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          issue.type === 'technical'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {issue.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-900">
                      {issue.location}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{issue.specific}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{issue.fix}</td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">+{issue.impact}</span>
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${
                              issue.impact >= 8
                                ? 'bg-red-500'
                                : issue.impact >= 5
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                            }`}
                            style={{ width: `${issue.impact * 10}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <span className={`font-medium ${getPillarColor(issue.pillar)}`}>
                        {issue.pillar}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
