'use client';

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { Card } from '@/components/ui/Card';
import { cssVars } from '@/lib/design-system/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  icon,
  color = 'blue',
}: MetricCardProps) {
  const colorMap = {
    blue: cssVars.accent,
    green: cssVars.success,
    orange: cssVars.warning,
    purple: cssVars.primary,
  };

  const iconBgOpacity = 0.1;
  const selectedColor = colorMap[color];

  return (
    <Card>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: cssVars.muted }}>
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold" style={{ color: cssVars.foreground }}>
                {value}
              </p>
              {subtitle && (
                <p className="ml-2 text-sm" style={{ color: cssVars.muted }}>
                  {subtitle}
                </p>
              )}
            </div>
            {(change !== undefined || trend) && (
              <div className="mt-2 flex items-center text-sm">
                {trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4" style={{ color: cssVars.success }} />
                ) : trend === 'down' ? (
                  <ArrowDownIcon className="mr-1 h-4 w-4" style={{ color: cssVars.error }} />
                ) : null}
                {change !== undefined && (
                  <span style={{ color: change >= 0 ? cssVars.success : cssVars.error }}>
                    {change >= 0 ? '+' : ''}
                    {change}%
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: `${selectedColor}${Math.round(iconBgOpacity * 255)
                  .toString(16)
                  .padStart(2, '0')}`,
              }}
            >
              <div style={{ color: selectedColor }}>{icon}</div>
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  );
}
