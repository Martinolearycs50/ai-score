'use client';

import { motion } from 'framer-motion';

interface PillarData {
  name: string;
  score: number;
  max: number;
  earned: number;
}

interface ScoreBreakdownChartProps {
  data: PillarData[];
  onPillarClick?: (pillar: string) => void;
  selectedPillar?: string | null;
}

export default function ScoreBreakdownChart({ 
  data, 
  onPillarClick,
  selectedPillar 
}: ScoreBreakdownChartProps) {
  const maxScore = Math.max(...data.map(d => d.max));
  
  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getColorLight = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="space-y-4">
        {data.map((pillar, index) => {
          const percentage = (pillar.earned / pillar.max) * 100;
          const isSelected = selectedPillar === pillar.name;
          
          return (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-transparent hover:border-gray-300'
                }
              `}
              onClick={() => onPillarClick?.(pillar.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900">{pillar.name}</h3>
                  <span className="text-sm text-gray-500">
                    {pillar.earned}/{pillar.max} points
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`
                    text-sm font-medium
                    ${percentage >= 80 ? 'text-green-600' :
                      percentage >= 60 ? 'text-yellow-600' :
                      'text-red-600'}
                  `}>
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full ${getColor(percentage)} relative`}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20" />
                  </motion.div>
                </div>
                
                {/* Max score indicator */}
                <div className="absolute top-0 right-0 -mt-1 text-xs text-gray-500">
                  Max: {pillar.max}
                </div>
              </div>
              
              {/* Expanded details when selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <p className="text-sm text-gray-600">
                    Click "View Fix" on priority issues below to see specific improvements for this pillar.
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">Strong Areas</p>
          <p className="text-xl font-semibold text-green-600">
            {data.filter(d => (d.earned / d.max) * 100 >= 80).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Need Work</p>
          <p className="text-xl font-semibold text-yellow-600">
            {data.filter(d => {
              const pct = (d.earned / d.max) * 100;
              return pct >= 60 && pct < 80;
            }).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Critical</p>
          <p className="text-xl font-semibold text-red-600">
            {data.filter(d => (d.earned / d.max) * 100 < 60).length}
          </p>
        </div>
      </div>
    </div>
  );
}