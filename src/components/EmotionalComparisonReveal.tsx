'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { cssVars, getThemeByScore } from '@/lib/design-system/colors';

interface EmotionalComparisonRevealProps {
  results: [AnalysisResultNew, AnalysisResultNew];
  children: React.ReactNode;
}

// Get comparison theme based on score differences
const getComparisonTheme = (score1: number, score2: number) => {
  const diff = Math.abs(score1 - score2);
  const avgScore = (score1 + score2) / 2;
  const theme = getThemeByScore(avgScore);

  if (avgScore >= 70) {
    return {
      title: 'Two AI Optimization Champions! 🏆',
      subtitle: "Let's see who edges ahead in this elite matchup",
      color: cssVars.outstanding,
      bgGradient: theme.gradient,
      emotion: 'elite',
    };
  } else if (diff <= 10) {
    return {
      title: "It's a Tight Race! 🏁",
      subtitle: 'Every optimization point counts in this close battle',
      color: cssVars.accent,
      bgGradient: theme.gradient,
      emotion: 'competitive',
    };
  } else if (avgScore >= 50) {
    return {
      title: 'The AI Optimization Battle! ⚔️',
      subtitle: 'Both sites show promise - who will claim victory?',
      color: cssVars.warning,
      bgGradient: theme.gradient,
      emotion: 'exciting',
    };
  } else {
    return {
      title: 'The Journey Begins for Both! 🚀',
      subtitle: 'Exciting opportunities await these digital warriors',
      color: cssVars.journey,
      bgGradient: theme.gradient,
      emotion: 'encouraging',
    };
  }
};

// Animated counter component
const AnimatedCounter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.round(target * easeOutQuart);

      setCount(currentCount);

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16); // 60fps

    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}</>;
};

export default function EmotionalComparisonReveal({
  results,
  children,
}: EmotionalComparisonRevealProps) {
  const [stage, setStage] = useState<'suspense' | 'reveal' | 'versus' | 'complete'>('suspense');
  const [result1, result2] = results;
  const theme = getComparisonTheme(result1.aiSearchScore, result2.aiSearchScore);
  const winner =
    result1.aiSearchScore > result2.aiSearchScore
      ? 1
      : result2.aiSearchScore > result1.aiSearchScore
        ? 2
        : 0;

  useEffect(() => {
    // Progression through stages
    const timers = [
      setTimeout(() => setStage('reveal'), 2000),
      setTimeout(() => setStage('versus'), 8000),
      setTimeout(() => setStage('complete'), 13000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {/* Suspense Stage */}
      {stage === 'suspense' && (
        <motion.div
          key="suspense"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-[600px] items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              className="mb-8 flex items-center justify-center gap-8"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div
                className="h-24 w-24 rounded-full opacity-20 blur-xl"
                style={{
                  background: `linear-gradient(to bottom right, ${cssVars.accent}, ${cssVars.documentation})`,
                }}
              />
              <div className="text-4xl">VS</div>
              <div
                className="h-24 w-24 rounded-full opacity-20 blur-xl"
                style={{
                  background: `linear-gradient(to bottom right, ${cssVars.documentation}, ${cssVars.journey})`,
                }}
              />
            </motion.div>
            <p className="text-muted text-sm">Analyzing both websites...</p>
          </div>
        </motion.div>
      )}

      {/* Reveal Stage - Show scores counting up */}
      {stage === 'reveal' && (
        <motion.div
          key="reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-[600px] items-center justify-center px-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="w-full max-w-4xl text-center"
          >
            {/* Title */}
            <motion.h2
              className="mb-8 text-3xl font-medium"
              style={{ color: theme.color }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {theme.title}
            </motion.h2>

            {/* Dual Score Display */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
              {/* Website 1 Score */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-muted mb-4 truncate text-sm">{new URL(result1.url).hostname}</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-40 w-40 -rotate-90 transform">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={winner === 1 ? theme.color : 'var(--muted)'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(result1.aiSearchScore / 100) * 440} 440`}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="text-5xl font-medium"
                      style={{ color: winner === 1 ? theme.color : 'var(--muted)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5, type: 'spring' }}
                    >
                      <AnimatedCounter target={result1.aiSearchScore} />
                    </motion.div>
                  </div>
                </div>
                {winner === 1 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 3, type: 'spring' }}
                    className="mt-2 text-2xl"
                  >
                    👑
                  </motion.div>
                )}
              </motion.div>

              {/* VS Divider */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: 'spring' }}
                className="text-4xl font-bold"
                style={{ color: theme.color }}
              >
                VS
              </motion.div>

              {/* Website 2 Score */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-muted mb-4 truncate text-sm">{new URL(result2.url).hostname}</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="h-40 w-40 -rotate-90 transform">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={winner === 2 ? theme.color : 'var(--muted)'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(result2.aiSearchScore / 100) * 440} 440`}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="text-5xl font-medium"
                      style={{ color: winner === 2 ? theme.color : 'var(--muted)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5, type: 'spring' }}
                    >
                      <AnimatedCounter target={result2.aiSearchScore} />
                    </motion.div>
                  </div>
                </div>
                {winner === 2 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 3, type: 'spring' }}
                    className="mt-2 text-2xl"
                  >
                    👑
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-muted mt-8 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5 }}
            >
              {theme.subtitle}
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* Versus Stage - Analysis preview */}
      {stage === 'versus' && (
        <motion.div
          key="versus"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-[600px] items-center justify-center"
        >
          <motion.div
            className="mx-auto max-w-2xl px-6 text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-6 inline-flex h-32 w-32 items-center justify-center rounded-full"
              style={{ background: theme.bgGradient }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-5xl">
                {theme.emotion === 'elite'
                  ? '🏆'
                  : theme.emotion === 'competitive'
                    ? '🏁'
                    : theme.emotion === 'exciting'
                      ? '⚔️'
                      : '🚀'}
              </span>
            </motion.div>

            <motion.h3
              className="mb-3 text-2xl font-medium"
              style={{ color: theme.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {winner === 0
                ? "It's a draw! Both sites are equally optimized"
                : winner === 1
                  ? `${new URL(result1.url).hostname} takes the lead!`
                  : `${new URL(result2.url).hostname} claims victory!`}
            </motion.h3>

            <motion.p
              className="text-muted mb-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Analyzing strengths and opportunities...
            </motion.p>

            {/* Progress dots */}
            <motion.div
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{ background: theme.color }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Complete Stage - Show actual comparison */}
      {stage === 'complete' && (
        <motion.div
          key="complete"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
