'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResultNew } from '@/lib/analyzer-new';

interface EmotionalResultsRevealProps {
  result: AnalysisResultNew;
  children: React.ReactNode;
}

// Emotional themes based on score ranges
const getEmotionalTheme = (score: number) => {
  if (score >= 80) {
    return {
      title: "Outstanding AI Optimization!",
      subtitle: "Your content is primed for AI search success",
      color: '#10B981', // Green
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      emotion: 'celebration',
      particles: true,
    };
  } else if (score >= 60) {
    return {
      title: "Strong Foundation Detected",
      subtitle: "Your content shows great potential",
      color: '#3B82F6', // Blue
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      emotion: 'positive',
      particles: false,
    };
  } else if (score >= 40) {
    return {
      title: "Room for Growth",
      subtitle: "Let's unlock your content's AI potential",
      color: '#F59E0B', // Amber
      bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      emotion: 'encouraging',
      particles: false,
    };
  } else {
    return {
      title: "AI Optimization Opportunities",
      subtitle: "We'll help you improve step by step",
      color: '#8B5CF6', // Purple
      bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      emotion: 'supportive',
      particles: false,
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

// Particle effect for high scores
const ParticleEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: 'var(--accent)',
            left: `${Math.random() * 100}%`,
            top: '100%',
          }}
          animate={{
            y: [-20, -window.innerHeight - 100],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [0, 1, 0],
            scale: [0, Math.random() * 1.5 + 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default function EmotionalResultsReveal({ result, children }: EmotionalResultsRevealProps) {
  const [stage, setStage] = useState<'suspense' | 'reveal' | 'details' | 'complete'>('suspense');
  const theme = getEmotionalTheme(result.aiSearchScore);

  useEffect(() => {
    // Progression through stages
    const timers = [
      setTimeout(() => setStage('reveal'), 1000),
      setTimeout(() => setStage('details'), 3500),
      setTimeout(() => setStage('complete'), 4500),
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
          className="min-h-[600px] flex items-center justify-center"
        >
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  🔍
                </motion.div>
                <p className="text-sm text-muted">Analyzing AI readiness...</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Reveal Stage */}
      {stage === 'reveal' && (
        <motion.div
          key="reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-[600px] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="text-center"
          >
            {/* Score Circle */}
            <motion.div
              className="relative inline-flex items-center justify-center mb-8"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="var(--border)"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke={theme.color}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(result.aiSearchScore / 100) * 753} 753`}
                  initial={{ strokeDashoffset: 753 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-8xl font-medium"
                  style={{ color: theme.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <AnimatedCounter target={result.aiSearchScore} />
                </motion.div>
                <motion.div
                  className="text-lg text-muted"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  AI Search Score
                </motion.div>
              </div>
            </motion.div>

            {/* Emotional Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <h2 className="text-3xl font-medium mb-2" style={{ color: theme.color }}>
                {theme.title}
              </h2>
              <p className="text-lg text-muted">{theme.subtitle}</p>
            </motion.div>

            {theme.particles && <ParticleEffect />}
          </motion.div>
        </motion.div>
      )}

      {/* Details Stage - Quick preview */}
      {stage === 'details' && (
        <motion.div
          key="details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-[600px] flex items-center justify-center"
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
              style={{ background: theme.bgGradient }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-4xl">
                {theme.emotion === 'celebration' ? '🎉' :
                 theme.emotion === 'positive' ? '✨' :
                 theme.emotion === 'encouraging' ? '💪' : '🚀'}
              </span>
            </motion.div>
            
            <motion.p
              className="text-lg text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Preparing your detailed analysis...
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* Complete Stage - Show actual results */}
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