'use client';

import { motion } from 'framer-motion';
import { TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Competitor {
  name: string;
  score: number;
}

interface CompetitorQuickViewProps {
  competitors: Competitor[];
  currentScore: number;
}

export default function CompetitorQuickView({ competitors, currentScore }: CompetitorQuickViewProps) {
  const allScores = [...competitors, { name: 'You', score: currentScore }]
    .sort((a, b) => b.score - a.score);

  const getPosition = (score: number) => {
    return allScores.findIndex(s => s.score === score) + 1;
  };

  const yourPosition = getPosition(currentScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quick Comparison</h2>
        <TrophyIcon className={`
          w-6 h-6
          ${yourPosition === 1 ? 'text-yellow-500' : 'text-gray-400'}
        `} />
      </div>

      {/* Position Badge */}
      <div className="mb-6 text-center">
        <div className={`
          inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold
          ${yourPosition === 1 
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
            : yourPosition === 2
            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
            : 'bg-gradient-to-br from-orange-300 to-orange-500 text-white'
          }
        `}>
          #{yourPosition}
        </div>
        <p className="mt-2 text-sm text-gray-600">Your Position</p>
      </div>

      {/* Competitor List */}
      <div className="space-y-3">
        {allScores.map((item, index) => {
          const isYou = item.name === 'You';
          const difference = item.score - currentScore;
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${isYou 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`
                    text-lg font-semibold
                    ${index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-500'}
                  `}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className={`
                      font-medium
                      ${isYou ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {isYou ? 'Your Site' : item.name}
                    </p>
                    {!isYou && difference !== 0 && (
                      <p className="text-xs text-gray-500">
                        {difference > 0 ? `${difference} points ahead` : `${Math.abs(difference)} points behind`}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-4 h-4 text-gray-400" />
                  <span className={`
                    text-lg font-semibold
                    ${isYou ? 'text-blue-600' : 'text-gray-700'}
                  `}>
                    {item.score}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <span className="font-medium">💡 Insight:</span> {
            yourPosition === 1 
              ? "You're leading the pack! Maintain your edge by addressing remaining issues."
              : `You're ${allScores[0].score - currentScore} points behind the leader. Focus on high-impact fixes to close the gap.`
          }
        </p>
      </div>

      {/* CTA */}
      <button className="mt-4 w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
        View Full Comparison →
      </button>
    </motion.div>
  );
}