'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

interface ScorePotentialPreviewProps {
  currentScore: number;
  potentialScore: number;
  color: string;
}
export default function ScorePotentialPreview({
  currentScore,
  potentialScore,
  color,
}: ScorePotentialPreviewProps) {
  const [showPotential, setShowPotential] = useState(false);
  const improvement = potentialScore - currentScore;
  useEffect(() => {
    const timer = setTimeout(() => setShowPotential(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative inline-block">
      {' '}
      {/* Current Score Circle */}{' '}
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {' '}
        <svg className="h-48 w-48 -rotate-90 transform">
          {' '}
          <circle cx="96" cy="96" r="88" stroke="var(--border)" strokeWidth="8" fill="none" />{' '}
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(currentScore / 100) * 553} 553`}
            initial={{ strokeDashoffset: 553 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />{' '}
          {/* Potential Score Arc */}{' '}
          {showPotential && (
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke={color}
              strokeWidth="8"
              fill="none"
              opacity="0.3"
              strokeDasharray={`${(improvement / 100) * 553} 553`}
              strokeDashoffset={-((currentScore / 100) * 553)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1 }}
              style={{ filter: 'blur(2px)' }}
            />
          )}{' '}
        </svg>{' '}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {' '}
          <motion.div
            className="text-6xl font-medium"
            style={{ color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {' '}
            {currentScore}{' '}
          </motion.div>{' '}
          {showPotential && (
            <motion.div
              className="mt-2 flex items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {' '}
              <span className="text-muted text-sm">→</span>{' '}
              <span className="text-lg font-medium" style={{ color }}>
                {' '}
                {potentialScore}{' '}
              </span>{' '}
              <motion.span
                className="ml-1 text-xs font-bold"
                style={{ color }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {' '}
                +{improvement}{' '}
              </motion.span>{' '}
            </motion.div>
          )}{' '}
        </div>{' '}
      </motion.div>{' '}
      {/* Floating improvement indicators */}{' '}
      {showPotential && (
        <div className="absolute -top-4 -right-4">
          {' '}
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 1.5 }}
          >
            {' '}
            <motion.div
              className="rounded-full px-3 py-2 text-sm font-bold"
              style={{ color: 'white' }}
              style={{ background: color }}
              animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {' '}
              +{improvement} possible!{' '}
            </motion.div>{' '}
            <motion.div
              className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 transform"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${color}`,
              }}
            />{' '}
          </motion.div>{' '}
        </div>
      )}{' '}
    </div>
  );
}
