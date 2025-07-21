'use client';

import Image from 'next/image';

import { motion } from 'framer-motion';

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
  delay = 0,
}: AIInsightCardProps) {
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300',
  };

  const scoreColors = {
    excellent: 'text-green-600',
    good: 'text-accent',
    fair: 'text-yellow-600',
    poor: 'text-red-600',
  };

  // Platform logos/colors
  const platformIcons = {
    ChatGPT: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          stroke="var(--outstanding)"
          strokeWidth="2"
          fill="var(--outstanding)"
          fillOpacity="0.2"
        />
        <circle cx="9" cy="10" r="1.5" fill="var(--outstanding)" />
        <circle cx="15" cy="10" r="1.5" fill="var(--outstanding)" />
        <path
          d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15"
          stroke="var(--outstanding)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    Claude: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
          fill="var(--warning)"
          fillOpacity="0.2"
          stroke="var(--warning)"
          strokeWidth="2"
        />
        <path
          d="M9 11C9 11 9 9 12 9C15 9 15 11 15 11"
          stroke="var(--warning)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="14" r="3" fill="var(--warning)" fillOpacity="0.5" />
      </svg>
    ),
    Perplexity: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
          fill="#A855F7"
          fillOpacity="0.2"
          stroke="#A855F7"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" fill="#A855F7" />
      </svg>
    ),
    Gemini: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="var(--blue-500)"
          fillOpacity="0.2"
          stroke="var(--blue-500)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const platformStyles = {
    ChatGPT: { bg: 'bg-teal-50', border: 'border-teal-200' },
    Claude: { bg: 'bg-orange-50', border: 'border-orange-200' },
    Perplexity: { bg: 'bg-purple-50', border: 'border-purple-200' },
    Gemini: { bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  const style = platformStyles[platform as keyof typeof platformStyles] || platformStyles.ChatGPT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${style.bg} rounded-xl border-2 p-6 ${style.border}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div>
            {platformIcons[platform as keyof typeof platformIcons] || platformIcons.ChatGPT}
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">{platform}</h3>
            <span
              className={`text-sm font-medium ${statusColors[status]} rounded-full border px-2 py-0.5`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scoreColors[status]}`}>{score}</div>
          <div className="text-muted text-xs">/ 100</div>
        </div>
      </div>

      {/* Insight */}
      <div className="space-y-3">
        <div>
          <p className="text-body text-sm leading-relaxed">{insight}</p>
        </div>

        {/* Recommendation */}
        <div className="border-default border-t pt-3">
          <div className="flex items-start space-x-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 flex-shrink-0"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                fill="var(--warning)"
                fillOpacity="0.2"
                stroke="var(--warning)"
                strokeWidth="2"
              />
              <path d="M9 21H15" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18V21" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-foreground text-sm font-medium">{recommendation}</p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: delay + 0.5 }}
            className={`h-full ${
              status === 'excellent'
                ? 'bg-green-500'
                : status === 'good'
                  ? 'bg-blue-500'
                  : status === 'fair'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
