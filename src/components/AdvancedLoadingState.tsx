'use client';

import { useLoadingProgress } from '@/hooks/useLoadingProgress';
import { useAnimatedText } from '@/hooks/useAnimatedText';
import { 
  Loader2, 
  Globe, 
  FileSearch, 
  Brain, 
  BarChart3, 
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <div className="w-full max-w-2xl mx-auto py-12 md:py-16">
      {/* Main Loading Card */}
      <div className="loading-card rounded-3xl p-8 shadow-lg animate-fade-in">
        {/* Stage Icon */}
        <div className="flex justify-center mb-8">
          <div className="icon-container">
            <div className="icon-glow" />
            <div className="relative">
              <StageIcon 
                className="w-16 h-16 text-blue-500 animate-pulse-glow transition-all duration-500"
                strokeWidth={1.5}
              />
              {/* Orbiting particles */}
              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-purple-500 animate-float" />
              <Zap className="absolute -bottom-2 -left-2 w-4 h-4 text-cyan-500 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        {/* Stage Info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-medium mb-2 transition-all duration-300">
            {currentStage.name}
          </h3>
          <p className="text-sm text-muted mb-4">
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
          <div className="flex justify-between text-xs text-muted">
            <span>{progress}%</span>
            <span>Processing...</span>
          </div>
        </div>

        {/* Animated Message */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted text-scramble min-h-[24px]">
            {displayText}
          </p>
        </div>

        {/* URL Display */}
        {url && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-xs mono text-muted truncate max-w-[300px]">
                {url}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stage Progress Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalStages }).map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-all duration-500
              ${index === stageIndex 
                ? 'w-8 bg-blue-500' 
                : index < stageIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>

      {/* Background Animation Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}