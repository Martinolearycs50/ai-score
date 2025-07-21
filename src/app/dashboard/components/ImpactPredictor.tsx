'use client';

import { useState } from 'react';

import { ArrowTrendingUpIcon, BoltIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Task {
  name: string;
  impact: number;
  effort: string;
  completed: boolean;
}

interface RoadmapMonth {
  id: number;
  month: string;
  title: string;
  tasks: Task[];
  totalImpact: number;
}

interface ImpactPredictorProps {
  roadmap: RoadmapMonth[];
}

export default function ImpactPredictor({ roadmap }: ImpactPredictorProps) {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);
  const currentScore = 78; // Mock current score
  const totalPossibleImpact = roadmap.reduce((acc, month) => acc + month.totalImpact, 0);
  const selectedImpact = roadmap
    .filter((month) => selectedMonths.includes(month.id))
    .reduce((acc, month) => acc + month.totalImpact, 0);
  const predictedScore = Math.min(100, currentScore + selectedImpact);

  const toggleMonth = (monthId: number) => {
    setSelectedMonths((prev) =>
      prev.includes(monthId) ? prev.filter((id) => id !== monthId) : [...prev, monthId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card rounded-xl p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center space-x-3">
        <ArrowTrendingUpIcon className="h-6 w-6" style={{ color: 'var(--success)' }} />
        <h2 className="text-foreground text-xl font-semibold">Impact Predictor</h2>
      </div>

      {/* Score Prediction Display */}
      <div
        className="mb-6 rounded-lg bg-gradient-to-br p-6"
        style={{
          background: `linear-gradient(to right, var(--success)10, var(--accent)10)`,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-body text-sm">Current Score</p>
            <p className="text-foreground text-3xl font-bold">{currentScore}</p>
          </div>
          <div className="text-muted text-4xl">→</div>
          <div className="text-right">
            <p className="text-body text-sm">Predicted Score</p>
            <motion.p
              key={predictedScore}
              initial={{ scale: 1.2, color: 'var(--outstanding)' }}
              animate={{ scale: 1, color: 'var(--gray-900)' }}
              className="text-3xl font-bold"
            >
              {predictedScore}
            </motion.p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="flex items-center space-x-2 rounded-full px-4 py-2"
            style={{ backgroundColor: 'var(--success)20' }}
          >
            <BoltIcon className="h-5 w-5" style={{ color: 'var(--winner)' }} />
            <span className="font-medium" style={{ color: 'var(--winner)' }}>
              +{selectedImpact} points potential gain
            </span>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div>
        <p className="text-body mb-3 text-sm">Select implementation phases to see impact:</p>
        <div className="space-y-3">
          {roadmap.map((month) => (
            <motion.div
              key={month.id}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedMonths.includes(month.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleMonth(month.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      selectedMonths.includes(month.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedMonths.includes(month.id) && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{month.month}</p>
                    <p className="text-body text-sm">{month.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-semibold">+{month.totalImpact}</p>
                  <p className="text-muted text-xs">points</p>
                </div>
              </div>
              {selectedMonths.includes(month.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-default mt-3 border-t pt-3"
                >
                  <p className="text-body text-xs">
                    {month.tasks.length} tasks • ~
                    {month.tasks.reduce((acc, task) => {
                      const hours = task.effort.includes('hour') ? parseInt(task.effort) || 1 : 0.5;
                      return acc + hours;
                    }, 0)}{' '}
                    hours total effort
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress visualization */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-body">Progress to Perfect Score</span>
          <span className="text-foreground font-medium">{predictedScore}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            initial={{ width: `${currentScore}%` }}
            animate={{ width: `${predictedScore}%` }}
            transition={{ duration: 0.8 }}
            className="h-full"
            style={{
              background: `linear-gradient(to right, var(--accent), var(--success))`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
