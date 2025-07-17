'use client';

import { useTierContext } from '@/contexts/TierContext';
import { TierType, TierFeatures } from '@/lib/tierConfig';

/**
 * Custom hook for accessing tier features
 * Provides a simplified API for components to check features
 */
export function useTier() {
  const { tier, features, setTier, isLoading } = useTierContext();

  return {
    // Current tier
    tier,
    
    // All features as an object
    features,
    
    // Individual feature checks (for cleaner component code)
    canShowDetailedScores: features.showDetailedScores,
    canShowRecommendations: features.showRecommendations,
    canShowWebsiteProfile: features.showWebsiteProfile,
    canShowComparison: features.showComparisonMode,
    canShowExamples: features.showExamples,
    
    // Utility functions
    isFreeTier: tier === 'free',
    isProTier: tier === 'pro',
    
    // Tier management
    setTier,
    isLoading,
    
    // Helper function to check multiple features at once
    hasAllFeatures: (...featureKeys: (keyof TierFeatures)[]) => {
      return featureKeys.every(key => features[key]);
    },
    
    // Helper function to check if any feature is available
    hasAnyFeature: (...featureKeys: (keyof TierFeatures)[]) => {
      return featureKeys.some(key => features[key]);
    }
  };
}

/**
 * Hook for checking a specific feature
 * Useful when a component only cares about one feature
 */
export function useFeature(featureName: keyof TierFeatures): boolean {
  const { features } = useTierContext();
  return features[featureName] as boolean;
}

/**
 * Hook for getting the analysis limit
 */
export function useAnalysisLimit(): number {
  const { features } = useTierContext();
  return features.maxAnalysesPerMonth;
}