'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowTrendingUpIcon, BoltIcon } from '@heroicons/react/24/outline';

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
    .filter(month => selectedMonths.includes(month.id))
    .reduce((acc, month) => acc + month.totalImpact, 0);
  const predictedScore = Math.min(100, currentScore + selectedImpact);

  const toggleMonth = (monthId: number) => {
    setSelectedMonths(prev => 
      prev.includes(monthId) 
        ? prev.filter(id => id !== monthId)
        : [...prev, monthId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">Impact Predictor</h2>
      </div>

      {/* Score Prediction Display */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Score</p>
            <p className="text-3xl font-bold text-gray-900">{currentScore}</p>
          </div>
          
          <div className="text-4xl text-gray-400">→</div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Predicted Score</p>
            <motion.p 
              key={predictedScore}
              initial={{ scale: 1.2, color: '#10B981' }}
              animate={{ scale: 1, color: '#111827' }}
              className="text-3xl font-bold"
            >
              {predictedScore}
            </motion.p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
            <BoltIcon className="w-5 h-5 text-green-700" />
            <span className="text-green-700 font-medium">
              +{selectedImpact} points potential gain
            </span>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Select implementation phases to see impact:
        </p>
        
        <div className="space-y-3">
          {roadmap.map((month) => (
            <motion.div
              key={month.id}
              whileTap={{ scale: 0.98 }}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedMonths.includes(month.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => toggleMonth(month.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${selectedMonths.includes(month.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedMonths.includes(month.id) && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{month.month}</p>
                    <p className="text-sm text-gray-600">{month.title}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">+{month.totalImpact}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
              
              {selectedMonths.includes(month.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <p className="text-xs text-gray-600">
                    {month.tasks.length} tasks • ~{
                      month.tasks.reduce((acc, task) => {
                        const hours = task.effort.includes('hour') 
                          ? parseInt(task.effort) || 1 
                          : 0.5;
                        return acc + hours;
                      }, 0)
                    } hours total effort
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress visualization */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress to Perfect Score</span>
          <span className="font-medium text-gray-900">{predictedScore}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: `${currentScore}%` }}
            animate={{ width: `${predictedScore}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
          />
        </div>
      </div>
    </motion.div>
  );
}