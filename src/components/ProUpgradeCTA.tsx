'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProUpgradeCTAProps {
  variant?: 'inline' | 'banner' | 'card';
  feature?: string;
}

export default function ProUpgradeCTA({ variant = 'inline', feature }: ProUpgradeCTAProps) {
  const variants = {
    inline: {
      container: 'inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all',
      text: 'text-sm font-medium',
      showIcon: true,
    },
    banner: {
      container: 'flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200',
      text: 'text-lg',
      showIcon: false,
    },
    card: {
      container: 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center shadow-xl',
      text: 'text-xl font-medium',
      showIcon: false,
    },
  };

  const style = variants[variant];

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={style.container}
      >
        <div>
          <p className={`${style.text} font-medium mb-1`} style={{ color: 'var(--foreground)' }}>
            {feature ? `Unlock ${feature} with Pro` : 'Ready to maximize your AI visibility?'}
          </p>
          <p className="text-sm text-muted">
            Get AI-powered recommendations, track progress, and compare with competitors
          </p>
        </div>
        <Link
          href="/pricing"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Upgrade to Pro
        </Link>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={style.container}
      >
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <path d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M8 12L10 14L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className={style.text}>Unlock Pro Features</h3>
        <p className="mt-2 mb-6 opacity-90">
          AI-powered optimization • Historical tracking • Competitor analysis
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          See Pro Plans
        </Link>
        <p className="mt-4 text-sm opacity-75">
          Starting at $29/month
        </p>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <Link href="/pricing" className={style.container}>
      {style.showIcon && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      )}
      <span className={style.text}>
        {feature ? `${feature} (Pro)` : 'Upgrade to Pro'}
      </span>
    </Link>
  );
}