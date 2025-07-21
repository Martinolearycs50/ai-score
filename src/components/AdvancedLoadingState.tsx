'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  FileSearch,
  Globe,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

import { useAnimatedText } from '@/hooks/useAnimatedText';
import { useLoadingProgress } from '@/hooks/useLoadingProgress';
import { cssVars } from '@/lib/design-system/colors';

interface AdvancedLoadingStateProps {
  url?: string;
}

const STAGE_ICONS = {
  initializing: Shield,
  fetching: Globe,
  analyzing: Brain,
  scoring: BarChart3,
  finalizing: CheckCircle2,
};

const LOADING_MESSAGES = [
  'Establishing secure connection...',
  'Analyzing AI crawler permissions...',
  'Scanning content structure...',
  'Evaluating SEO optimization...',
  'Processing metadata signals...',
  'Calculating readiness scores...',
  'Generating recommendations...',
  'Finalizing comprehensive report...',
];

export default function AdvancedLoadingState({ url }: AdvancedLoadingStateProps) {
  const { currentStage, progress, stageIndex, totalStages } = useLoadingProgress(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const { displayText } = useAnimatedText(LOADING_MESSAGES[currentMessageIndex], true, {
    duration: 800,
    scrambleDuration: 400,
  });

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const StageIcon = STAGE_ICONS[currentStage.id as keyof typeof STAGE_ICONS];

  return (
    <div className="mx-auto w-full max-w-2xl py-12 md:py-16">
      {/* Main Loading Card */}
      <div className="loading-card animate-fade-in rounded-3xl p-8 shadow-lg">
        {/* Stage Icon */}
        <div className="mb-8 flex justify-center">
          <div className="icon-container">
            <div className="icon-glow" />
            <div className="relative">
              <StageIcon
                className="animate-pulse-glow h-16 w-16 transition-all duration-500"
                style={{ color: cssVars.accent }}
                strokeWidth={1.5}
              />
              {/* Orbiting particles */}
              <Sparkles
                className="animate-float absolute -top-2 -right-2 h-4 w-4"
                style={{ color: cssVars.journey }}
              />
              <Zap
                className="animate-float absolute -bottom-2 -left-2 h-4 w-4"
                style={{ animationDelay: '1s', color: cssVars.accent }}
              />
            </div>
          </div>
        </div>

        {/* Stage Info */}
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-xl font-medium transition-all duration-300">
            {currentStage.name}
          </h3>
          <p className="text-muted mb-4 text-sm">
            Stage {stageIndex + 1} of {totalStages}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="progress-bar mb-2">
            <div
              className="progress-fill loading-gradient animate-gradient"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <div className="text-muted flex justify-between text-xs">
            <span>{progress}%</span>
            <span>Processing...</span>
          </div>
        </div>

        {/* Animated Message */}
        <div className="mb-6 text-center">
          <p className="text-muted text-scramble min-h-[24px] text-sm">{displayText}</p>
        </div>

        {/* URL Display */}
        {url && (
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{ backgroundColor: `${cssVars.background}` }}
            >
              <Activity className="h-4 w-4 animate-pulse" style={{ color: cssVars.accent }} />
              <span className="mono text-muted max-w-[300px] truncate text-xs">{url}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stage Progress Dots */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalStages }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-500 ${index === stageIndex ? 'w-8' : ''} `}
            style={{
              backgroundColor: index <= stageIndex ? cssVars.accent : cssVars.border,
            }}
          />
        ))}
      </div>

      {/* Background Animation Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-float absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${cssVars.accent}10` }}
        />
        <div
          className="animate-float absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ animationDelay: '2s', backgroundColor: `${cssVars.journey}10` }}
        />
      </div>
    </div>
  );
}
