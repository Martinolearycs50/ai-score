'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

interface ProUpgradeCTAProps {
  variant?: 'inline' | 'banner' | 'card';
  feature?: string;
}

export default function ProUpgradeCTA({ variant = 'inline', feature }: ProUpgradeCTAProps) {
  const variants = {
    inline: {
      container:
        'inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all',
      gradient: `linear-gradient(to right, ${cssVars.accent}, ${cssVars.documentation})`,
      text: 'text-sm font-medium',
      showIcon: true,
    },
    banner: {
      container: 'flex items-center justify-between p-6 rounded-lg border',
      gradient: `linear-gradient(to right, ${cssVars.accent}10, ${cssVars.documentation}10)`,
      borderColor: `${cssVars.accent}40`,
      text: 'text-lg',
      showIcon: false,
    },
    card: {
      container: 'text-white rounded-lg p-8 text-center shadow-xl',
      gradient: `linear-gradient(to bottom right, ${cssVars.accent}, ${cssVars.documentation})`,
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
        style={{
          background: style.gradient,
          borderColor: 'borderColor' in style ? style.borderColor : undefined,
        }}
      >
        <div>
          <p className={`${style.text} mb-1 font-medium`} style={{ color: 'var(--foreground)' }}>
            {feature ? `Unlock ${feature} with Pro` : 'Ready to maximize your AI visibility?'}
          </p>
          <p className="text-muted text-sm">
            Get AI-powered recommendations, track progress, and compare with competitors
          </p>
        </div>
        <Link href="/pricing" className="btn-primary whitespace-nowrap">
          Upgrade to Pro
        </Link>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${cssVars.primary} 0%, ${cssVars.accent} 100%)`,
          boxShadow: 'var(--shadow-default)',
        }}
      >
        {/* Simple star icon */}
        <div className="mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>

        <h3 className="mb-4 text-2xl font-semibold" style={{ color: 'white' }}>
          Ready to Maximize Your AI Visibility?
        </h3>

        <p className="mb-8 text-lg opacity-90" style={{ color: 'white' }}>
          Get detailed recommendations and track your progress
        </p>

        <Link
          href="/pricing"
          className="bg-card inline-block transform rounded-lg px-8 py-4 font-semibold transition-all hover:scale-105 hover:shadow-lg"
          style={{ color: cssVars.primary }}
        >
          Upgrade to Pro →
        </Link>

        <p className="mt-6 text-sm opacity-70" style={{ color: 'white' }}>
          Starting at $29/month • Cancel anytime
        </p>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <Link href="/pricing" className={style.container} style={{ background: style.gradient }}>
      {style.showIcon && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
      )}
      <span className={style.text}>{feature ? `${feature} (Pro)` : 'Upgrade to Pro'}</span>
    </Link>
  );
}
