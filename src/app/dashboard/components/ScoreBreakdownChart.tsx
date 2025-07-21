'use client';

import { motion } from 'framer-motion';

import { cssVars, getRatingColor, getScoreColor } from '@/lib/design-system/colors';

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
  selectedPillar,
}: ScoreBreakdownChartProps) {
  const maxScore = Math.max(...data.map((d) => d.max));
  const getBarColor = (score: number): string => {
    const color = getScoreColor(score);
    return color;
  };
  const getRatingFromScore = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  return (
    <div className="space-y-6">
      {' '}
      {/* Bar Chart */}{' '}
      <div className="space-y-4">
        {' '}
        {data.map((pillar, index) => {
          const percentage = (pillar.earned / pillar.max) * 100;
          const isSelected = selectedPillar === pillar.name;
          return (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected ? '' : 'border-transparent'} `}
              style={{
                borderColor: isSelected ? cssVars.accent : 'transparent',
                backgroundColor: isSelected ? `${cssVars.accent}10` : 'transparent',
              }}
              onClick={() => onPillarClick?.(pillar.name)}
            >
              {' '}
              <div className="mb-2 flex items-center justify-between">
                {' '}
                <div className="flex items-center space-x-3">
                  {' '}
                  <h3 className="font-medium" style={{ color: cssVars.foreground }}>
                    {pillar.name}
                  </h3>{' '}
                  <span className="text-sm" style={{ color: cssVars.muted }}>
                    {' '}
                    {pillar.earned}/{pillar.max} points{' '}
                  </span>{' '}
                </div>{' '}
                <div className="flex items-center space-x-2">
                  {' '}
                  <span className="text-sm font-medium" style={{ color: getBarColor(percentage) }}>
                    {' '}
                    {Math.round(percentage)}%{' '}
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              {/* Progress Bar */}{' '}
              <div className="relative">
                {' '}
                <div
                  className="h-8 overflow-hidden rounded-full"
                  style={{ backgroundColor: `${cssVars.border}50` }}
                >
                  {' '}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="relative h-full"
                    style={{ backgroundColor: getBarColor(percentage) }}
                  >
                    {' '}
                    {/* Subtle gradient overlay */}{' '}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20" />{' '}
                  </motion.div>{' '}
                </div>{' '}
                {/* Max score indicator */}{' '}
                <div
                  className="absolute top-0 right-0 -mt-1 text-xs"
                  style={{ color: cssVars.muted }}
                >
                  {' '}
                  Max: {pillar.max}{' '}
                </div>{' '}
              </div>{' '}
              {/* Expanded details when selected */}{' '}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 border-t pt-3"
                  style={{ borderColor: cssVars.border }}
                >
                  {' '}
                  <p className="text-sm" style={{ color: cssVars.text }}>
                    {' '}
                    Click "View Fix" on priority issues below to see specific improvements for this
                    pillar.{' '}
                  </p>{' '}
                </motion.div>
              )}{' '}
            </motion.div>
          );
        })}{' '}
      </div>{' '}
      {/* Summary Stats */}{' '}
      <div className="grid grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: cssVars.border }}>
        {' '}
        <div className="text-center">
          {' '}
          <p className="text-sm" style={{ color: cssVars.muted }}>
            Strong Areas
          </p>{' '}
          <p className="text-xl font-semibold" style={{ color: cssVars.success }}>
            {' '}
            {data.filter((d) => (d.earned / d.max) * 100 >= 80).length}{' '}
          </p>{' '}
        </div>{' '}
        <div className="text-center">
          {' '}
          <p className="text-sm" style={{ color: cssVars.muted }}>
            Room to Grow
          </p>{' '}
          <p className="text-xl font-semibold" style={{ color: cssVars.warning }}>
            {' '}
            {
              data.filter((d) => {
                const pct = (d.earned / d.max) * 100;
                return pct >= 60 && pct < 80;
              }).length
            }{' '}
          </p>{' '}
        </div>{' '}
        <div className="text-center">
          {' '}
          <p className="text-sm" style={{ color: cssVars.muted }}>
            Needs Attention
          </p>{' '}
          <p className="text-xl font-semibold" style={{ color: cssVars.error }}>
            {' '}
            {data.filter((d) => (d.earned / d.max) * 100 < 60).length}{' '}
          </p>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
