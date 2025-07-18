'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AIInsightCardProps {
  platform: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  insight: string;
  recommendation: string;
  delay?: number;
}

export default function AIInsightCard({
  platform,
  score,
  status,
  insight,
  recommendation,
  delay = 0
}: AIInsightCardProps) {
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300'
  };

  const scoreColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    fair: 'text-yellow-600',
    poor: 'text-red-600'
  };

  // Platform logos/colors
  const platformStyles = {
    ChatGPT: { bg: 'bg-teal-50', border: 'border-teal-200', icon: '🤖' },
    Claude: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🧠' },
    Perplexity: { bg: 'bg-purple-50', border: 'border-purple-200', icon: '🔍' },
    Gemini: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '✨' }
  };

  const style = platformStyles[platform as keyof typeof platformStyles] || platformStyles.ChatGPT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${style.bg} rounded-xl p-6 border-2 ${style.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{style.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{platform}</h3>
            <span className={`text-sm font-medium ${statusColors[status]} px-2 py-0.5 rounded-full border`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scoreColors[status]}`}>{score}</div>
          <div className="text-xs text-gray-500">/ 100</div>
        </div>
      </div>

      {/* Insight */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
        </div>
        
        {/* Recommendation */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <span className="text-sm font-medium text-gray-900">💡</span>
            <p className="text-sm font-medium text-gray-900">{recommendation}</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: delay + 0.5 }}
            className={`h-full ${
              status === 'excellent' ? 'bg-green-500' :
              status === 'good' ? 'bg-blue-500' :
              status === 'fair' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}