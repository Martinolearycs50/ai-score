'use client';

import { ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cssVars } from '@/lib/design-system/colors';

interface Competitor {
  name: string;
  score: number;
}

interface CompetitorQuickViewProps {
  competitors: Competitor[];
  currentScore: number;
}

export default function CompetitorQuickView({
  competitors,
  currentScore,
}: CompetitorQuickViewProps) {
  const allScores = [...competitors, { name: 'You', score: currentScore }].sort(
    (a, b) => b.score - a.score
  );

  const getPosition = (score: number) => {
    return allScores.findIndex((s) => s.score === score) + 1;
  };

  const yourPosition = getPosition(currentScore);

  return (
    <Card>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: cssVars.foreground }}>
            Quick Comparison
          </h2>
          <TrophyIcon
            className="h-6 w-6"
            style={{ color: yourPosition === 1 ? cssVars.warning : cssVars.muted }}
          />
        </div>

        {/* Position Badge */}
        <div className="mb-6 text-center">
          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{
              backgroundColor:
                yourPosition === 1
                  ? cssVars.warning
                  : yourPosition === 2
                    ? cssVars.muted
                    : cssVars.accent,
            }}
          >
            #{yourPosition}
          </div>
          <p className="mt-2 text-sm" style={{ color: cssVars.text }}>
            Your Position
          </p>
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
                className="rounded-lg border-2 p-3 transition-all"
                style={{
                  borderColor: isYou ? cssVars.accent : cssVars.border,
                  backgroundColor: isYou ? `${cssVars.accent}10` : cssVars.background,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className="text-lg font-semibold"
                      style={{
                        color:
                          index === 0
                            ? cssVars.warning
                            : index === 1
                              ? cssVars.muted
                              : index === 2
                                ? cssVars.accent
                                : cssVars.muted,
                      }}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: isYou ? cssVars.accent : cssVars.foreground }}
                      >
                        {isYou ? 'Your Site' : item.name}
                      </p>
                      {!isYou && difference !== 0 && (
                        <p className="text-xs" style={{ color: cssVars.muted }}>
                          {difference > 0
                            ? `${difference} points ahead`
                            : `${Math.abs(difference)} points to catch up`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-4 w-4" style={{ color: cssVars.muted }} />
                    <span
                      className="text-lg font-semibold"
                      style={{ color: isYou ? cssVars.accent : cssVars.foreground }}
                    >
                      {item.score}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Insights */}
        <div
          className="mt-6 rounded-lg border p-4"
          style={{ backgroundColor: `${cssVars.accent}10`, borderColor: cssVars.accent }}
        >
          <p className="text-sm" style={{ color: cssVars.foreground }}>
            <span className="font-medium">💡 Insight:</span>{' '}
            {yourPosition === 1
              ? "You're leading! Keep improving to maintain your advantage."
              : `You're ${allScores[0].score - currentScore} points from the leader. Every improvement counts!`}
          </p>
        </div>

        {/* CTA */}
        <Button variant="primary" fullWidth className="mt-4">
          View Full Comparison →
        </Button>
      </motion.div>
    </Card>
  );
}
