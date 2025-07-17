/**
 * Centralized Tier Configuration
 * Single source of truth for all tier-based features
 */

// Available tier types
export type TierType = 'free' | 'pro';

// Feature flags for each tier
export interface TierFeatures {
  // Display features
  showDetailedScores: boolean;
  showPillarBreakdown: boolean;
  showRecommendations: boolean;
  showWebsiteProfile: boolean;
  showComparisonMode: boolean;
  showImplementationTime: boolean;
  showExamples: boolean;
  
  // Limits
  maxAnalysesPerMonth: number;
  
  // UI features
  showEmotionalReveal: boolean;
  showParticleEffects: boolean;
  showUpgradeCTA: boolean;
  
  // Future features (easy to add)
  // showAPIAccess: boolean;
  // showBulkAnalysis: boolean;
  // showHistoricalData: boolean;
  // showTeamFeatures: boolean;
}

// Tier configuration mapping
export const TIER_CONFIG: Record<TierType, TierFeatures> = {
  free: {
    // Display features
    showDetailedScores: false,
    showPillarBreakdown: false,
    showRecommendations: false,
    showWebsiteProfile: false,
    showComparisonMode: true,
    showImplementationTime: false,
    showExamples: false,
    
    // Limits
    maxAnalysesPerMonth: 5,
    
    // UI features
    showEmotionalReveal: true, // Keep the nice animation even for free
    showParticleEffects: false,
    showUpgradeCTA: true,
  },
  pro: {
    // Display features
    showDetailedScores: true,
    showPillarBreakdown: true,
    showRecommendations: true,
    showWebsiteProfile: true,
    showComparisonMode: true,
    showImplementationTime: true,
    showExamples: true,
    
    // Limits
    maxAnalysesPerMonth: 30,
    
    // UI features
    showEmotionalReveal: true,
    showParticleEffects: true,
    showUpgradeCTA: false,
  }
} as const;

// Helper function to get features for a tier
export function getTierFeatures(tier: TierType): TierFeatures {
  return TIER_CONFIG[tier];
}

// Helper function to check if a feature is available
export function hasFeature(tier: TierType, feature: keyof TierFeatures): boolean {
  return TIER_CONFIG[tier][feature] as boolean;
}

// Get all available tiers
export function getAvailableTiers(): TierType[] {
  return Object.keys(TIER_CONFIG) as TierType[];
}

// Default tier (can be configured via environment variable in the future)
export const DEFAULT_TIER: TierType = 'free';

// Tier metadata for display purposes
export const TIER_METADATA: Record<TierType, { name: string; price: string; description: string }> = {
  free: {
    name: 'Free',
    price: '$0/month',
    description: 'Basic AI search analysis'
  },
  pro: {
    name: 'Pro',
    price: '$39/month',
    description: 'Full analysis with recommendations'
  }
};

// Type guard to check if a string is a valid tier
export function isValidTier(tier: string): tier is TierType {
  return tier === 'free' || tier === 'pro';
}