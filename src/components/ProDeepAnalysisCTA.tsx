'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Button from './ui/Button';

interface ProDeepAnalysisCTAProps {
  url: string;
  score: number;
  variant?: 'inline' | 'banner' | 'sticky';
}

export default function ProDeepAnalysisCTA({
  url,
  score,
  variant = 'banner',
}: ProDeepAnalysisCTAProps) {
  const router = useRouter();

  const handleUnlock = () => {
    // Encode URL and redirect to Pro dashboard
    const encodedUrl = encodeURIComponent(url);
    router.push(`/pro?url=${encodedUrl}`);
  };

  if (variant === 'sticky') {
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed right-0 bottom-0 left-0 z-40 bg-gradient-to-r from-purple-600 to-blue-600 p-4 shadow-2xl"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <SparklesIcon className="h-6 w-6" />
            <div>
              <p className="font-semibold">Unlock Deep Analysis</p>
              <p className="text-sm opacity-90">
                See exactly how to improve your score from {score}
              </p>
            </div>
          </div>
          <Button onClick={handleUnlock} className="bg-white text-purple-700 hover:bg-gray-100">
            Unlock Full Analysis
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleUnlock}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
      >
        <SparklesIcon className="h-4 w-4" />
        Unlock Deep Analysis
        <ArrowRightIcon className="h-4 w-4" />
      </motion.button>
    );
  }

  // Default banner variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-3">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Want to see the full breakdown?
            </h3>
            <p className="text-gray-600">
              Get detailed technical & content fixes, decimal scores, and AI-powered rewrites to
              boost your score.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Technical fixes with line numbers
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                AI-optimized content rewrite
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Impact-sorted improvements
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Button
            onClick={handleUnlock}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            Unlock Full Analysis
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
