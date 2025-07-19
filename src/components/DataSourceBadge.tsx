'use client';

import { motion } from 'framer-motion';

interface DataSourceBadgeProps {
  type: 'synthetic' | 'chrome-ux' | 'cloudflare-worker';
  metric?: string;
  value?: string | number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SOURCE_CONFIG = {
  'chrome-ux': {
    label: 'Real-world data',
    icon: '🌍',
    color: '#10B981', // Green
    bgColor: '#D1FAE5',
    description: 'Measured from actual Chrome users',
  },
  'synthetic': {
    label: 'Lab data',
    icon: '🧪',
    color: '#6366F1', // Indigo
    bgColor: '#E0E7FF',
    description: 'Measured in controlled environment',
  },
  'cloudflare-worker': {
    label: 'Edge data',
    icon: '⚡',
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7',
    description: 'Measured from edge network',
  },
};

export default function DataSourceBadge({
  type,
  metric,
  value,
  showValue = true,
  size = 'md',
}: DataSourceBadgeProps) {
  const config = SOURCE_CONFIG[type];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
      title={config.description}
      data-testid="data-source-badge"
    >
      <span className="text-base">{config.icon}</span>
      <span>{config.label}</span>
      
      {showValue && value !== undefined && (
        <>
          <span className="opacity-60">•</span>
          <span className="font-mono">
            {metric === 'ttfb' && typeof value === 'number' 
              ? `${value}ms` 
              : value}
          </span>
        </>
      )}
    </motion.div>
  );
}