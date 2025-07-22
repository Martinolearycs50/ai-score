/**
 * Centralized Tier Configuration
 * Single source of truth for all tier-based features
 */

// Available tier types
export type TierType = 'free' | 'pro' | 'consultation';

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
  maxAnalysesPerDay: number;
  maxUrlLength: number;

  // UI features
  showEmotionalReveal: boolean;
  showParticleEffects: boolean;
  showUpgradeCTA: boolean;

  // Pro features
  showAPIAccess: boolean;
  showBulkAnalysis: boolean;
  showHistoricalData: boolean;
  showTeamFeatures: boolean;
  showCustomReports: boolean;
  showWhitelabeling: boolean;
  showPrioritySupport: boolean;

  // Beta features
  showBetaFeatures: boolean;
}

// Tier configuration mapping
export const TIER_CONFIG: Record<TierType, TierFeatures> = {
  free: {
    // Display features
    showDetailedScores: true, // Show basic scores for free tier
    showPillarBreakdown: true, // Show visual pillar breakdown for free tier
    showRecommendations: false, // Hide detailed recommendations for free tier
    showWebsiteProfile: true, // Show website profile for free tier
    showComparisonMode: true, // Enable comparison for free tier
    showImplementationTime: false,
    showExamples: false,

    // Limits
    maxAnalysesPerMonth: Infinity,
    maxAnalysesPerDay: 50,
    maxUrlLength: 500,

    // UI features
    showEmotionalReveal: true, // Keep the nice animation even for free
    showParticleEffects: false,
    showUpgradeCTA: true,

    // Pro features
    showAPIAccess: false,
    showBulkAnalysis: false,
    showHistoricalData: false,
    showTeamFeatures: false,
    showCustomReports: false,
    showWhitelabeling: false,
    showPrioritySupport: false,

    // Beta features
    showBetaFeatures: false,
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
    maxAnalysesPerMonth: 1000,
    maxAnalysesPerDay: 100,
    maxUrlLength: 2000,

    // UI features
    showEmotionalReveal: true,
    showParticleEffects: true,
    showUpgradeCTA: false,

    // Pro features
    showAPIAccess: true,
    showBulkAnalysis: true,
    showHistoricalData: true,
    showTeamFeatures: true,
    showCustomReports: true,
    showWhitelabeling: false,
    showPrioritySupport: true,

    // Beta features
    showBetaFeatures: true,
  },

  consultation: {
    // Display features
    showDetailedScores: true,
    showPillarBreakdown: true,
    showRecommendations: true,
    showWebsiteProfile: true,
    showComparisonMode: true,
    showImplementationTime: true,
    showExamples: true,

    // Limits
    maxAnalysesPerMonth: Infinity,
    maxAnalysesPerDay: Infinity,
    maxUrlLength: 5000,

    // UI features
    showEmotionalReveal: true,
    showParticleEffects: true,
    showUpgradeCTA: false,

    // Pro features
    showAPIAccess: true,
    showBulkAnalysis: true,
    showHistoricalData: true,
    showTeamFeatures: true,
    showCustomReports: true,
    showWhitelabeling: true,
    showPrioritySupport: true,

    // Beta features
    showBetaFeatures: true,
  },
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
export const TIER_METADATA: Record<TierType, { name: string; price: string; description: string }> =
  {
    free: {
      name: 'Free',
      price: '$0/month',
      description: 'Basic AI search analysis',
    },
    pro: {
      name: 'Pro',
      price: '$29/month',
      description: 'Full analysis with recommendations',
    },
    consultation: {
      name: 'Consultation',
      price: 'Custom',
      description: '1-on-1 expert consultancy',
    },
  };

// Type guard to check if a string is a valid tier
export function isValidTier(tier: string): tier is TierType {
  return tier === 'free' || tier === 'pro' || tier === 'consultation';
}

// Check if pro features are enabled via environment variable
export function isProFeaturesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PRO_FEATURES === 'true';
}

// Helper function to check if a specific pro feature is enabled
export function isProFeatureEnabled(feature: string, userTier: TierType = 'free'): boolean {
  // First check if pro features are enabled globally
  if (!isProFeaturesEnabled()) {
    return false;
  }

  // Then check if the user's tier has access to the feature
  const features = getTierFeatures(userTier);
  return feature in features ? (features as any)[feature] : false;
}

// Get the list of pro-only features
export function getProOnlyFeatures(): (keyof TierFeatures)[] {
  const freeFeatures = getTierFeatures('free');
  const proFeatures = getTierFeatures('pro');

  return (Object.keys(proFeatures) as (keyof TierFeatures)[]).filter(
    (key) => !freeFeatures[key] && proFeatures[key]
  );
}

// Get feature comparison between tiers
export function getFeatureComparison(): Record<
  keyof TierFeatures,
  Record<TierType, boolean | number>
> {
  const features: Record<string, Record<TierType, boolean | number>> = {};
  const tiers: TierType[] = ['free', 'pro', 'consultation'];

  // Get all feature keys from pro tier (most comprehensive)
  const allFeatures = Object.keys(getTierFeatures('pro')) as (keyof TierFeatures)[];

  allFeatures.forEach((feature) => {
    features[feature] = {};
    tiers.forEach((tier) => {
      features[feature][tier] = getTierFeatures(tier)[feature];
    });
  });

  return features as Record<keyof TierFeatures, Record<TierType, boolean | number>>;
}
