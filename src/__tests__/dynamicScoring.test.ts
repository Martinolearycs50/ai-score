import { score } from '@/lib/scorer-new';
import { DYNAMIC_SCORING_WEIGHTS, PAGE_TYPE_WEIGHT_MAP, PILLARS } from '@/utils/constants';
import type { PillarResults, ExtractedContent } from '@/lib/types';

describe('Dynamic Scoring System', () => {
  // Mock pillar results with perfect scores
  const perfectPillarResults: PillarResults = {
    RETRIEVAL: {
      ttfb: 5,
      responseTime: 5,
      robotsAccess: 5,
      sitemapPresence: 5,
      mobileResponsive: 5,
    },
    FACT_DENSITY: {
      statistics: 5,
      entities: 5,
      citations: 4,
      examples: 3,
      structured_data: 3,
    },
    STRUCTURE: {
      headingHierarchy: 6,
      schemaMarkup: 6,
      semanticHTML: 6,
      contentSections: 6,
      faqPresence: 6,
    },
    TRUST: {
      https: 3,
      authorInfo: 3,
      publicationDate: 3,
      aboutPage: 3,
      externalCitations: 3,
    },
    RECENCY: {
      lastModified: 3,
      recentUpdates: 3,
      currentYearRef: 2,
      freshExamples: 2,
    },
  };

  // Mock extracted content
  const mockExtractedContent: ExtractedContent = {
    title: 'Test Page',
    description: 'Test description',
    content: 'Test content',
    wordCount: 1000,
    headingStructure: [],
    images: [],
    links: { internal: [], external: [] },
    metadata: {},
    schema: [],
    pageType: 'homepage',
    businessType: 'other',
    hasPaywall: false,
    hasCookieWall: false,
    competitors: [],
    primaryTopics: [],
    businessAttributes: {},
  };

  describe('Page Type Detection', () => {
    it('should apply homepage weights correctly', () => {
      const homepageContent = { ...mockExtractedContent, pageType: 'homepage' as const };
      const result = score(perfectPillarResults, homepageContent);

      expect(result.dynamicScoring).toBeDefined();
      expect(result.dynamicScoring?.pageType).toBe('homepage');
      expect(result.dynamicScoring?.weights).toEqual(DYNAMIC_SCORING_WEIGHTS.homepage);
      expect(result.dynamicScoring?.appliedWeights).toBe(true);
    });

    it('should apply blog/article weights correctly', () => {
      const blogContent = { ...mockExtractedContent, pageType: 'blog' as const };
      const result = score(perfectPillarResults, blogContent);

      expect(result.dynamicScoring?.pageType).toBe('blog');
      expect(result.dynamicScoring?.weights).toEqual(DYNAMIC_SCORING_WEIGHTS.blog);
    });

    it('should apply product page weights correctly', () => {
      const productContent = { ...mockExtractedContent, pageType: 'product' as const };
      const result = score(perfectPillarResults, productContent);

      expect(result.dynamicScoring?.pageType).toBe('product');
      expect(result.dynamicScoring?.weights).toEqual(DYNAMIC_SCORING_WEIGHTS.product);
    });

    it('should apply default weights for general pages', () => {
      const generalContent = { ...mockExtractedContent, pageType: 'general' as const };
      const result = score(perfectPillarResults, generalContent);

      expect(result.dynamicScoring?.pageType).toBe('general');
      expect(result.dynamicScoring?.weights).toEqual(DYNAMIC_SCORING_WEIGHTS.default);
    });
  });

  describe('Weight Application', () => {
    it('should calculate weighted scores correctly', () => {
      const homepageContent = { ...mockExtractedContent, pageType: 'homepage' as const };
      const result = score(perfectPillarResults, homepageContent);

      // Check that weights were applied
      expect(result.dynamicScoring?.rawScores).toEqual({
        RETRIEVAL: 25,
        FACT_DENSITY: 20,
        STRUCTURE: 30,
        TRUST: 15,
        RECENCY: 10,
      });

      // Check weighted scores
      expect(result.dynamicScoring?.weightedScores).toEqual({
        RETRIEVAL: 35, // Perfect score with homepage weight
        FACT_DENSITY: 15, // Perfect score with homepage weight
        STRUCTURE: 25, // Perfect score with homepage weight
        TRUST: 20, // Perfect score with homepage weight
        RECENCY: 5, // Perfect score with homepage weight
      });

      // Total should be sum of weighted scores
      expect(result.total).toBe(100);
    });

    it('should handle partial scores correctly', () => {
      const partialResults: PillarResults = {
        RETRIEVAL: {
          ttfb: 3,
          responseTime: 2,
          robotsAccess: 5,
          sitemapPresence: 0,
          mobileResponsive: 5,
        }, // 15/25 = 60%
        FACT_DENSITY: {
          statistics: 2,
          entities: 2,
          citations: 2,
          examples: 2,
          structured_data: 2,
        }, // 10/20 = 50%
        STRUCTURE: {
          headingHierarchy: 3,
          schemaMarkup: 3,
          semanticHTML: 3,
          contentSections: 3,
          faqPresence: 3,
        }, // 15/30 = 50%
        TRUST: {
          https: 3,
          authorInfo: 0,
          publicationDate: 3,
          aboutPage: 0,
          externalCitations: 0,
        }, // 6/15 = 40%
        RECENCY: {
          lastModified: 0,
          recentUpdates: 0,
          currentYearRef: 2,
          freshExamples: 2,
        }, // 4/10 = 40%
      };

      const blogContent = { ...mockExtractedContent, pageType: 'blog' as const };
      const result = score(partialResults, blogContent);

      // Blog weights: RETRIEVAL: 25, FACT_DENSITY: 35, STRUCTURE: 20, TRUST: 10, RECENCY: 10
      expect(result.dynamicScoring?.weightedScores).toEqual({
        RETRIEVAL: 15, // 60% of 25 = 15
        FACT_DENSITY: 18, // 50% of 35 = 17.5 → 18
        STRUCTURE: 10, // 50% of 20 = 10
        TRUST: 4, // 40% of 10 = 4
        RECENCY: 4, // 40% of 10 = 4
      });
    });
  });

  describe('Dynamic Scoring Toggle', () => {
    it('should not apply dynamic scoring when disabled', () => {
      const homepageContent = { ...mockExtractedContent, pageType: 'homepage' as const };
      const result = score(perfectPillarResults, homepageContent, false);

      expect(result.dynamicScoring).toBeUndefined();
      expect(result.total).toBe(100); // Should use base weights
    });

    it('should not apply dynamic scoring when page type is missing', () => {
      const contentWithoutPageType = { ...mockExtractedContent, pageType: undefined as any };
      const result = score(perfectPillarResults, contentWithoutPageType);

      expect(result.dynamicScoring).toBeUndefined();
    });
  });

  describe('Weight Configuration Integrity', () => {
    it('should have weights that sum to 100 for all page types', () => {
      Object.entries(DYNAMIC_SCORING_WEIGHTS).forEach(([pageType, weights]) => {
        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        expect(total).toBe(100);
      });
    });

    it('should have all required pillars in each weight configuration', () => {
      const requiredPillars = Object.keys(PILLARS);
      
      Object.entries(DYNAMIC_SCORING_WEIGHTS).forEach(([pageType, weights]) => {
        const configPillars = Object.keys(weights);
        expect(configPillars.sort()).toEqual(requiredPillars.sort());
      });
    });

    it('should map all page types correctly', () => {
      const pageTypes = ['homepage', 'article', 'blog', 'product', 'documentation', 'category', 'about', 'contact', 'search', 'general'];
      
      pageTypes.forEach(pageType => {
        const weightKey = PAGE_TYPE_WEIGHT_MAP[pageType];
        expect(weightKey).toBeDefined();
        expect(DYNAMIC_SCORING_WEIGHTS[weightKey]).toBeDefined();
      });
    });
  });
});