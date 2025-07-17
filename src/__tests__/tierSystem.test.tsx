import React from 'react';
import { render, screen } from '@testing-library/react';
import { TierProvider } from '@/contexts/TierContext';
import { useTier } from '@/hooks/useTier';
import { getTierFeatures, TIER_CONFIG, isValidTier } from '@/lib/tierConfig';
import PillarScoreDisplayV2 from '@/components/PillarScoreDisplayV2';
import Navigation from '@/components/Navigation';

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

// Test component to verify tier context
function TierTestComponent() {
  const { tier, features } = useTier();
  return (
    <div>
      <div data-testid="current-tier">{tier}</div>
      <div data-testid="show-recommendations">{features.showRecommendations.toString()}</div>
      <div data-testid="show-detailed-scores">{features.showDetailedScores.toString()}</div>
      <div data-testid="show-upgrade-cta">{features.showUpgradeCTA.toString()}</div>
    </div>
  );
}

describe('Tier System Tests', () => {
  beforeEach(() => {
    mockSearchParams.delete('tier');
  });

  describe('Tier Configuration', () => {
    it('should have correct feature flags for free tier', () => {
      const freeFeatures = getTierFeatures('free');
      expect(freeFeatures.showDetailedScores).toBe(false);
      expect(freeFeatures.showRecommendations).toBe(false);
      expect(freeFeatures.showWebsiteProfile).toBe(false);
      expect(freeFeatures.showUpgradeCTA).toBe(true);
      expect(freeFeatures.showComparisonMode).toBe(true);
    });

    it('should have correct feature flags for pro tier', () => {
      const proFeatures = getTierFeatures('pro');
      expect(proFeatures.showDetailedScores).toBe(true);
      expect(proFeatures.showRecommendations).toBe(true);
      expect(proFeatures.showWebsiteProfile).toBe(true);
      expect(proFeatures.showUpgradeCTA).toBe(false);
      expect(proFeatures.showComparisonMode).toBe(true);
    });

    it('should validate tier types correctly', () => {
      expect(isValidTier('free')).toBe(true);
      expect(isValidTier('pro')).toBe(true);
      expect(isValidTier('consultation')).toBe(true);
      expect(isValidTier('invalid')).toBe(false);
    });
  });

  describe('TierProvider', () => {
    it('should default to free tier when no URL param', () => {
      render(
        <TierProvider>
          <TierTestComponent />
        </TierProvider>
      );

      expect(screen.getByTestId('current-tier')).toHaveTextContent('free');
      expect(screen.getByTestId('show-recommendations')).toHaveTextContent('false');
      expect(screen.getByTestId('show-upgrade-cta')).toHaveTextContent('true');
    });

    it('should read tier from URL parameter', () => {
      mockSearchParams.set('tier', 'pro');
      
      render(
        <TierProvider>
          <TierTestComponent />
        </TierProvider>
      );

      expect(screen.getByTestId('current-tier')).toHaveTextContent('pro');
      expect(screen.getByTestId('show-recommendations')).toHaveTextContent('true');
      expect(screen.getByTestId('show-upgrade-cta')).toHaveTextContent('false');
    });

    it('should ignore invalid tier parameters', () => {
      mockSearchParams.set('tier', 'invalid');
      
      render(
        <TierProvider>
          <TierTestComponent />
        </TierProvider>
      );

      expect(screen.getByTestId('current-tier')).toHaveTextContent('free');
    });
  });

  describe('Component Tier Restrictions', () => {
    const mockResult = {
      url: 'https://example.com',
      aiSearchScore: 75,
      performanceRating: 'Good' as const,
      scoringResult: {
        total: 75,
        breakdown: [
          { pillar: 'RETRIEVAL', earned: 20, max: 25, details: {} },
          { pillar: 'FACT_DENSITY', earned: 15, max: 20, details: {} },
          { pillar: 'STRUCTURE', earned: 25, max: 30, details: {} },
          { pillar: 'TRUST', earned: 10, max: 15, details: {} },
          { pillar: 'RECENCY', earned: 5, max: 10, details: {} },
        ],
        pillarScores: {
          RETRIEVAL: 20,
          FACT_DENSITY: 15,
          STRUCTURE: 25,
          TRUST: 10,
          RECENCY: 5,
        },
        recommendations: [
          {
            metric: 'Test Metric',
            why: 'Test why',
            fix: 'Test fix',
            gain: 5,
            pillar: 'RETRIEVAL',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    it('should show only basic score for free tier', () => {
      mockSearchParams.delete('tier');
      
      render(
        <TierProvider>
          <PillarScoreDisplayV2 result={mockResult} />
        </TierProvider>
      );

      // Should show overall score
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Your AI Search Score')).toBeInTheDocument();
      
      // Should NOT show detailed breakdown
      expect(screen.queryByText('RETRIEVAL')).not.toBeInTheDocument();
      expect(screen.queryByText('20/25')).not.toBeInTheDocument();
      
      // Should show upgrade CTA
      expect(screen.getByText('Get Your Full Analysis')).toBeInTheDocument();
    });

    it('should show detailed scores for pro tier', () => {
      mockSearchParams.set('tier', 'pro');
      
      render(
        <TierProvider>
          <PillarScoreDisplayV2 result={mockResult} />
        </TierProvider>
      );

      // Should show overall score
      expect(screen.getByText('75')).toBeInTheDocument();
      
      // Should show detailed breakdown
      expect(screen.getByText('AI Search Readiness Score')).toBeInTheDocument();
      
      // Check for pillar details (they are rendered differently)
      const container = screen.getByText('75').closest('div');
      expect(container).toBeInTheDocument();
      
      // Should NOT show upgrade CTA
      expect(screen.queryByText('Get Your Full Analysis')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Tier Awareness', () => {
    it('should show upgrade button for free tier', () => {
      mockSearchParams.delete('tier');
      
      render(
        <TierProvider>
          <Navigation />
        </TierProvider>
      );

      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });

    it('should hide upgrade button for pro tier', () => {
      mockSearchParams.set('tier', 'pro');
      
      render(
        <TierProvider>
          <Navigation />
        </TierProvider>
      );

      expect(screen.queryByText('Upgrade to Pro')).not.toBeInTheDocument();
    });
  });

  describe('Feature Flag Enforcement', () => {
    it('free tier should not have pro features', () => {
      const freeFeatures = TIER_CONFIG.free;
      
      // Critical features that must be restricted
      expect(freeFeatures.showDetailedScores).toBe(false);
      expect(freeFeatures.showPillarBreakdown).toBe(false);
      expect(freeFeatures.showRecommendations).toBe(false);
      expect(freeFeatures.showWebsiteProfile).toBe(false);
      expect(freeFeatures.showImplementationTime).toBe(false);
      expect(freeFeatures.showExamples).toBe(false);
      
      // Features that should be enabled
      expect(freeFeatures.showComparisonMode).toBe(true);
      expect(freeFeatures.showEmotionalReveal).toBe(true);
      expect(freeFeatures.showUpgradeCTA).toBe(true);
    });

    it('pro tier should have all features enabled', () => {
      const proFeatures = TIER_CONFIG.pro;
      
      expect(proFeatures.showDetailedScores).toBe(true);
      expect(proFeatures.showPillarBreakdown).toBe(true);
      expect(proFeatures.showRecommendations).toBe(true);
      expect(proFeatures.showWebsiteProfile).toBe(true);
      expect(proFeatures.showImplementationTime).toBe(true);
      expect(proFeatures.showExamples).toBe(true);
      expect(proFeatures.showComparisonMode).toBe(true);
      expect(proFeatures.showEmotionalReveal).toBe(true);
      expect(proFeatures.showUpgradeCTA).toBe(false);
    });
  });
});