import { 
  getTierFeatures, 
  hasFeature, 
  getAvailableTiers,
  isValidTier,
  TIER_CONFIG,
  DEFAULT_TIER 
} from '../tierConfig';

describe('Tier Configuration', () => {
  describe('getTierFeatures', () => {
    it('returns correct features for free tier', () => {
      const features = getTierFeatures('free');
      
      expect(features.showDetailedScores).toBe(false);
      expect(features.showRecommendations).toBe(false);
      expect(features.showWebsiteProfile).toBe(false);
      expect(features.maxAnalysesPerMonth).toBe(5);
      expect(features.showUpgradeCTA).toBe(true);
    });

    it('returns correct features for pro tier', () => {
      const features = getTierFeatures('pro');
      
      expect(features.showDetailedScores).toBe(true);
      expect(features.showRecommendations).toBe(true);
      expect(features.showWebsiteProfile).toBe(true);
      expect(features.maxAnalysesPerMonth).toBe(30);
      expect(features.showUpgradeCTA).toBe(false);
    });
  });

  describe('hasFeature', () => {
    it('correctly checks feature availability for free tier', () => {
      expect(hasFeature('free', 'showDetailedScores')).toBe(false);
      expect(hasFeature('free', 'showEmotionalReveal')).toBe(true);
      expect(hasFeature('free', 'showUpgradeCTA')).toBe(true);
    });

    it('correctly checks feature availability for pro tier', () => {
      expect(hasFeature('pro', 'showDetailedScores')).toBe(true);
      expect(hasFeature('pro', 'showRecommendations')).toBe(true);
      expect(hasFeature('pro', 'showComparisonMode')).toBe(true);
    });
  });

  describe('getAvailableTiers', () => {
    it('returns all available tiers', () => {
      const tiers = getAvailableTiers();
      expect(tiers).toEqual(['free', 'pro']);
    });
  });

  describe('isValidTier', () => {
    it('validates tier strings correctly', () => {
      expect(isValidTier('free')).toBe(true);
      expect(isValidTier('pro')).toBe(true);
      expect(isValidTier('enterprise')).toBe(false);
      expect(isValidTier('invalid')).toBe(false);
      expect(isValidTier('')).toBe(false);
    });
  });

  describe('Configuration Integrity', () => {
    it('all tiers have the same feature keys', () => {
      const tiers = getAvailableTiers();
      const firstTierKeys = Object.keys(TIER_CONFIG[tiers[0]]).sort();
      
      tiers.forEach(tier => {
        const tierKeys = Object.keys(TIER_CONFIG[tier]).sort();
        expect(tierKeys).toEqual(firstTierKeys);
      });
    });

    it('default tier is valid', () => {
      expect(isValidTier(DEFAULT_TIER)).toBe(true);
    });

    it('free tier has upgrade CTA enabled', () => {
      expect(TIER_CONFIG.free.showUpgradeCTA).toBe(true);
    });

    it('pro tier has upgrade CTA disabled', () => {
      expect(TIER_CONFIG.pro.showUpgradeCTA).toBe(false);
    });

    it('pro tier has all features that free tier has', () => {
      const freeFeatures = getTierFeatures('free');
      const proFeatures = getTierFeatures('pro');
      
      Object.entries(freeFeatures).forEach(([key, value]) => {
        if (key === 'showUpgradeCTA') return; // Skip upgrade CTA
        if (typeof value === 'boolean' && value === true) {
          // If free tier has a feature, pro should also have it
          expect(proFeatures[key as keyof typeof proFeatures]).toBe(true);
        }
      });
    });
  });

  describe('Feature Limits', () => {
    it('pro tier has higher analysis limit than free tier', () => {
      const freeLimit = getTierFeatures('free').maxAnalysesPerMonth;
      const proLimit = getTierFeatures('pro').maxAnalysesPerMonth;
      
      expect(proLimit).toBeGreaterThan(freeLimit);
    });
  });
});