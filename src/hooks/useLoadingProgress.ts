'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LoadingStage {
  id: string;
  name: string;
  description: string;
  minProgress: number;
  maxProgress: number;
  duration: number; // milliseconds
}

const LOADING_STAGES: LoadingStage[] = [
  {
    id: 'initializing',
    name: 'Initializing',
    description: 'Establishing secure connection...',
    minProgress: 0,
    maxProgress: 10,
    duration: 800,
  },
  {
    id: 'fetching',
    name: 'Fetching Data',
    description: 'Retrieving website content and metadata...',
    minProgress: 10,
    maxProgress: 30,
    duration: 1500,
  },
  {
    id: 'analyzing',
    name: 'AI Analysis',
    description: 'Analyzing content structure and optimization...',
    minProgress: 30,
    maxProgress: 70,
    duration: 3000,
  },
  {
    id: 'scoring',
    name: 'Calculating Scores',
    description: 'Computing readiness scores across all categories...',
    minProgress: 70,
    maxProgress: 90,
    duration: 1200,
  },
  {
    id: 'finalizing',
    name: 'Finalizing Report',
    description: 'Preparing comprehensive analysis results...',
    minProgress: 90,
    maxProgress: 100,
    duration: 500,
  },
];

export function useLoadingProgress(isActive: boolean) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const stageStartTimeRef = useRef<number>();

  const currentStage = LOADING_STAGES[currentStageIndex];

  const reset = useCallback(() => {
    setCurrentStageIndex(0);
    setProgress(0);
    setIsComplete(false);
    startTimeRef.current = undefined;
    stageStartTimeRef.current = undefined;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const animate = useCallback(() => {
    if (!isActive || isComplete) return;

    const now = Date.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = now;
      stageStartTimeRef.current = now;
    }

    const stageElapsed = now - (stageStartTimeRef.current || now);
    const stageProgress = Math.min(stageElapsed / currentStage.duration, 1);
    
    // Calculate progress within current stage
    const stageRange = currentStage.maxProgress - currentStage.minProgress;
    const currentProgress = currentStage.minProgress + (stageRange * stageProgress);
    
    // Add some variance to make it feel more natural
    const variance = Math.sin(now * 0.001) * 0.5;
    const adjustedProgress = Math.min(currentProgress + variance, currentStage.maxProgress);
    
    setProgress(adjustedProgress);

    // Move to next stage
    if (stageProgress >= 1 && currentStageIndex < LOADING_STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      stageStartTimeRef.current = now;
    } else if (stageProgress >= 1 && currentStageIndex === LOADING_STAGES.length - 1) {
      setProgress(100);
      setIsComplete(true);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isActive, isComplete, currentStageIndex, currentStage]);

  useEffect(() => {
    if (isActive && !isComplete) {
      animate();
    } else if (!isActive) {
      reset();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isComplete, animate, reset]);

  return {
    currentStage,
    progress: Math.round(progress),
    isComplete,
    stageIndex: currentStageIndex,
    totalStages: LOADING_STAGES.length,
    reset,
  };
}