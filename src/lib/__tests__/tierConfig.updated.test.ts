import { TIER_CONFIG, getTierFeatures, hasFeature, isValidTier } from '../tierConfig';

describe('tierConfig - Updated', () => {
  describe('Free tier configuration', () => {
    it('should have comparison mode disabled for free tier', () => {
      expect(TIER_CONFIG.free.showComparisonMode).toBe(false);
    });

    it('should have unlimited analyses for free tier', () => {
      expect(TIER_CONFIG.free.maxAnalysesPerMonth).toBe(Infinity);
    });

    it('should hide pro features in free tier', () => {
      const freeTier = TIER_CONFIG.free;
      expect(freeTier.showDetailedScores).toBe(false);
      expect(freeTier.showPillarBreakdown).toBe(false);
      expect(freeTier.showRecommendations).toBe(false);
      expect(freeTier.showWebsiteProfile).toBe(false);
    });

    it('should show upgrade CTA in free tier', () => {
      expect(TIER_CONFIG.free.showUpgradeCTA).toBe(true);
    });
  });

  describe('Pro tier configuration', () => {
    it('should have comparison mode enabled for pro tier', () => {
      expect(TIER_CONFIG.pro.showComparisonMode).toBe(true);
    });

    it('should have 30 analyses per month for pro tier', () => {
      expect(TIER_CONFIG.pro.maxAnalysesPerMonth).toBe(30);
    });

    it('should show all features in pro tier', () => {
      const proTier = TIER_CONFIG.pro;
      expect(proTier.showDetailedScores).toBe(true);
      expect(proTier.showPillarBreakdown).toBe(true);
      expect(proTier.showRecommendations).toBe(true);
      expect(proTier.showWebsiteProfile).toBe(true);
      expect(proTier.showComparisonMode).toBe(true);
    });

    it('should not show upgrade CTA in pro tier', () => {
      expect(TIER_CONFIG.pro.showUpgradeCTA).toBe(false);
    });
  });

  describe('Helper functions', () => {
    it('getTierFeatures should return correct features', () => {
      const freeFeatures = getTierFeatures('free');
      expect(freeFeatures.showComparisonMode).toBe(false);
      expect(freeFeatures.maxAnalysesPerMonth).toBe(Infinity);

      const proFeatures = getTierFeatures('pro');
      expect(proFeatures.showComparisonMode).toBe(true);
      expect(proFeatures.maxAnalysesPerMonth).toBe(30);
    });

    it('hasFeature should correctly check feature availability', () => {
      expect(hasFeature('free', 'showComparisonMode')).toBe(false);
      expect(hasFeature('pro', 'showComparisonMode')).toBe(true);
      expect(hasFeature('free', 'showUpgradeCTA')).toBe(true);
      expect(hasFeature('pro', 'showUpgradeCTA')).toBe(false);
    });

    it('isValidTier should validate tier strings', () => {
      expect(isValidTier('free')).toBe(true);
      expect(isValidTier('pro')).toBe(true);
      expect(isValidTier('consultation')).toBe(true);
      expect(isValidTier('invalid')).toBe(false);
      expect(isValidTier('')).toBe(false);
    });
  });
});
