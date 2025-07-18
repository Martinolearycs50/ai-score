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
  const platformIcons = {
    ChatGPT: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#14B8A6" strokeWidth="2" fill="#14B8A6" fillOpacity="0.2"/>
        <circle cx="9" cy="10" r="1.5" fill="#14B8A6"/>
        <circle cx="15" cy="10" r="1.5" fill="#14B8A6"/>
        <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    Claude: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="2"/>
        <path d="M9 11C9 11 9 9 12 9C15 9 15 11 15 11" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="14" r="3" fill="#F97316" fillOpacity="0.5"/>
      </svg>
    ),
    Perplexity: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#A855F7" fillOpacity="0.2" stroke="#A855F7" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" fill="#A855F7"/>
      </svg>
    ),
    Gemini: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    )
  };

  const platformStyles = {
    ChatGPT: { bg: 'bg-teal-50', border: 'border-teal-200' },
    Claude: { bg: 'bg-orange-50', border: 'border-orange-200' },
    Perplexity: { bg: 'bg-purple-50', border: 'border-purple-200' },
    Gemini: { bg: 'bg-blue-50', border: 'border-blue-200' }
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
          <div>{platformIcons[platform as keyof typeof platformIcons] || platformIcons.ChatGPT}</div>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2"/>
              <path d="M9 21H15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 18V21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            </svg>
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