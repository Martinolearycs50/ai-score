'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { cssVars, getThemeByScore } from '@/lib/design-system/colors';

interface EmotionalResultsRevealProps {
  result: AnalysisResultNew;
  children: React.ReactNode;
}

// Emotional themes based on score ranges
const getEmotionalTheme = (score: number) => {
  const theme = getThemeByScore(score);

  if (score >= 80) {
    return {
      title: 'Outstanding AI Optimization! 🏆',
      subtitle: 'Your content is primed for AI search success',
      encouragement: "You're in the top tier of AI-optimized content!",
      color: theme.color,
      bgGradient: theme.gradient,
      emotion: 'celebration',
      particles: true,
      potentialGain: 20,
    };
  } else if (score >= 60) {
    return {
      title: 'Strong Foundation Detected! ✨',
      subtitle: 'Your content shows great potential',
      encouragement: "You're just a few tweaks away from excellence!",
      color: theme.color,
      bgGradient: theme.gradient,
      emotion: 'positive',
      particles: true,
      potentialGain: 30,
    };
  } else if (score >= 40) {
    return {
      title: 'Your AI Journey Starts Here!',
      subtitle: 'Exciting optimization opportunities await',
      encouragement: 'Sites like yours often see 40-60 point improvements!',
      color: theme.color,
      bgGradient: theme.gradient,
      emotion: 'encouraging',
      particles: true,
      potentialGain: 45,
    };
  } else {
    return {
      title: "Let's Transform Your AI Visibility! 🌟",
      subtitle: 'Every expert started here - your potential is unlimited',
      encouragement: "We've seen sites go from 20 to 80+ with our recommendations!",
      color: theme.color,
      bgGradient: theme.gradient,
      emotion: 'supportive',
      particles: true,
      potentialGain: 60,
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
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

// Function to play completion sound using Web Audio API
const playCompletionSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillators for a pleasant chime sound
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    // Play a pleasant two-note chime (C5 and G5)
    playNote(523.25, now, 0.3); // C5
    playNote(783.99, now + 0.15, 0.3); // G5
  } catch (error) {
    // Silently fail if audio is not supported or blocked
    console.log('Audio playback not available');
  }
};

export default function EmotionalResultsReveal({ result, children }: EmotionalResultsRevealProps) {
  const [stage, setStage] = useState<'suspense' | 'reveal' | 'details' | 'complete'>('suspense');
  const theme = getEmotionalTheme(result.aiSearchScore);
  const websiteName =
    result.websiteProfile?.title || result.pageTitle || new URL(result.url).hostname;

  useEffect(() => {
    // Progression through stages with optimized timing
    const timers = [
      setTimeout(() => {
        setStage('reveal');
        // Play sound when revealing the score
        playCompletionSound();
      }, 1500), // 1.5s wait before reveal
      setTimeout(() => setStage('details'), 4000), // 2.5s to read reveal content
      setTimeout(() => setStage('complete'), 8500), // 4.5s to read details
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
          className="py-12 md:py-16"
        >
          <motion.div
            className="relative mx-auto w-fit"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="mx-auto h-32 w-32 rounded-full opacity-20 blur-xl"
              style={{
                background: `linear-gradient(135deg, ${cssVars.accent} 0%, ${cssVars.primary} 100%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="mb-4"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="11" cy="11" r="8" stroke={cssVars.accent} strokeWidth="2" />
                    <path
                      d="M21 21L16.65 16.65"
                      stroke={cssVars.accent}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="11" cy="11" r="3" fill={cssVars.accent} fillOpacity="0.5" />
                  </svg>
                </motion.div>
                <p className="text-muted text-sm">Analyzing {websiteName}...</p>
                {result.extractedContent?.pageType && (
                  <p className="text-muted mt-1 text-xs">
                    Detected: {result.extractedContent.pageType}
                  </p>
                )}
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
          className="py-12 md:py-16"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="text-center"
          >
            {/* Score Circle */}
            <motion.div
              className="relative mb-8 inline-flex items-center justify-center"
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <svg className="h-64 w-64 -rotate-90 transform">
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
                  transition={{ duration: 2, ease: 'easeOut' }}
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
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <AnimatedCounter target={result.aiSearchScore} />
                </motion.div>
                <motion.div
                  className="text-muted text-lg"
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
              <h2 className="mb-2 text-3xl font-medium" style={{ color: theme.color }}>
                {theme.title}
              </h2>
              <p className="text-muted mb-2 text-lg">{theme.subtitle}</p>
              <p className="text-muted mb-1 text-sm">
                {websiteName} • {result.websiteProfile?.domain || new URL(result.url).hostname}
              </p>
              {result.extractedContent?.pageType && result.scoringResult.dynamicScoring && (
                <p className="text-muted mb-4 text-xs">
                  {result.extractedContent.pageType.charAt(0).toUpperCase() +
                    result.extractedContent.pageType.slice(1)}{' '}
                  page • Dynamic scoring applied
                </p>
              )}

              {/* Potential Score Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, type: 'spring' }}
                className="mt-4 inline-flex items-center gap-3 rounded-full px-6 py-3"
                style={{
                  background: `${theme.color}20`,
                  border: `2px solid ${theme.color}40`,
                }}
              >
                <span className="text-sm font-medium" style={{ color: theme.color }}>
                  Potential Score: {result.aiSearchScore + theme.potentialGain}
                </span>
                <motion.span
                  className="rounded px-2 py-1 text-xs font-bold"
                  style={{ background: theme.color, color: 'white' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  +{theme.potentialGain} points possible!
                </motion.span>
              </motion.div>
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
          className="py-12 md:py-16"
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
              {theme.emotion === 'celebration' ? (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : theme.emotion === 'positive' ? (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C11.45 2 11 2.45 11 3V7C11 7.55 11.45 8 12 8C12.55 8 13 7.55 13 7V3C13 2.45 12.55 2 12 2Z"
                    fill="white"
                  />
                  <path
                    d="M18.36 5.64L15.54 8.46C15.15 8.85 15.15 9.49 15.54 9.88C15.93 10.27 16.57 10.27 16.96 9.88L19.78 7.06C20.17 6.67 20.17 6.03 19.78 5.64C19.39 5.25 18.75 5.25 18.36 5.64Z"
                    fill="white"
                  />
                  <path
                    d="M5.64 5.64C5.25 6.03 5.25 6.67 5.64 7.06L8.46 9.88C8.85 10.27 9.49 10.27 9.88 9.88C10.27 9.49 10.27 8.85 9.88 8.46L7.06 5.64C6.67 5.25 6.03 5.25 5.64 5.64Z"
                    fill="white"
                  />
                  <circle cx="12" cy="16" r="5" fill="white" />
                </svg>
              ) : theme.emotion === 'encouraging' ? (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 10H20L11 23V14H4L13 1V10Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              )}
            </motion.div>

            <motion.h3
              className="mb-3 text-2xl font-medium"
              style={{ color: theme.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {theme.encouragement}
            </motion.h3>

            <motion.p
              className="text-muted mb-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Analyzing your optimization opportunities...
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
