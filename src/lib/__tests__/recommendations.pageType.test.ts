import { generateRecommendations } from '../recommendations';
import type { ExtractedContent } from '../contentExtractor';
import type { PillarResults } from '../types';

describe('generateRecommendations - Page Type Integration', () => {
  const createMockPillarResults = (): PillarResults => ({
    RETRIEVAL: {
      ttfb: 5,  // Failed (max 10)
      paywall: 5,
      mainContent: 0,  // Failed (max 5)
      htmlSize: 10,
    },
    FACT_DENSITY: {
      uniqueStats: 0,  // Failed (max 10)
      dataMarkup: 5,
      citations: 10,
      deduplication: 10,
    },
    STRUCTURE: {
      headingFrequency: 10,
      headingDepth: 5,
      structuredData: 0,  // Failed (max 5)
      rssFeed: 0,  // Failed (max 5)
    },
    TRUST: {
      authorBio: 0,  // Failed (max 5)
      napConsistency: 5,
      license: 5,
    },
    RECENCY: {
      lastModified: 0,  // Failed (max 5)
      stableCanonical: 5,
    },
  });

  const createMockContent = (pageType: ExtractedContent['pageType']): ExtractedContent => ({
    primaryTopic: 'Test Topic',
    detectedTopics: ['test', 'topic'],
    businessType: 'corporate',
    pageType,
    contentSamples: {
      title: 'Test Page',
      headings: [
        { level: 1, text: 'Main Heading', content: 'Content after heading' },
        { level: 2, text: 'Sub Heading', content: 'More content' },
      ],
      paragraphs: ['Test paragraph content'],
      lists: [],
      statistics: ['100 users', '50% growth'],
      comparisons: [],
    },
    detectedFeatures: {
      hasPaymentForms: false,
      hasProductListings: false,
      hasAPIDocumentation: false,
      hasPricingInfo: false,
      hasBlogPosts: false,
      hasTutorials: false,
      hasComparisons: false,
      hasQuestions: true,
    },
    keyTerms: ['test', 'optimization'],
    productNames: [],
    technicalTerms: ['API', 'SEO'],
    wordCount: 1000,
    language: 'en',
  });

  describe('Homepage recommendations', () => {
    it('should prioritize homepage-specific metrics', () => {
      const content = createMockContent('homepage');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      // Find structuredData recommendation (homepage priority #1)
      const structuredDataRec = recommendations.find(r => r.metric === 'structuredData');
      expect(structuredDataRec).toBeDefined();
      
      // Should have custom homepage message
      expect(structuredDataRec?.template.why).toContain('Organization schema is essential for homepages');
      
      // Should have higher priority due to multiplier
      expect(structuredDataRec?.priority).toBeGreaterThan(structuredDataRec?.template.gain || 0);
    });

    it('should sort homepage recommendations by adjusted priority', () => {
      const content = createMockContent('homepage');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      // Check that recommendations are sorted by priority
      for (let i = 1; i < recommendations.length; i++) {
        const prevPriority = recommendations[i - 1].priority || recommendations[i - 1].template.gain;
        const currPriority = recommendations[i].priority || recommendations[i].template.gain;
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });
  });

  describe('Article recommendations', () => {
    it('should prioritize freshness for articles', () => {
      const content = createMockContent('article');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      // Find lastModified recommendation (article priority #1)
      const lastModifiedRec = recommendations.find(r => r.metric === 'lastModified');
      expect(lastModifiedRec).toBeDefined();
      
      // Should have custom article message
      expect(lastModifiedRec?.template.why).toContain('AI prioritizes recent content');
      
      // Should have multiplier of 1.5 for top priority
      const expectedPriority = (lastModifiedRec?.template.gain || 0) * 1.5;
      expect(lastModifiedRec?.priority).toBe(expectedPriority);
    });

    it('should include author bio as high priority for articles', () => {
      const content = createMockContent('article');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      const authorBioRec = recommendations.find(r => r.metric === 'authorBio');
      expect(authorBioRec).toBeDefined();
      expect(authorBioRec?.template.why).toContain('Articles need clear author attribution');
    });
  });

  describe('Search page recommendations', () => {
    it('should filter out irrelevant metrics for search pages', () => {
      const content = createMockContent('search');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      // Should not include listicleFormat or authorBio
      const listicleRec = recommendations.find(r => r.metric === 'listicleFormat');
      const authorRec = recommendations.find(r => r.metric === 'authorBio');
      
      expect(listicleRec).toBeUndefined();
      expect(authorRec).toBeUndefined();
      
      // Should still include relevant metrics
      const mainContentRec = recommendations.find(r => r.metric === 'mainContent');
      expect(mainContentRec).toBeDefined();
    });
  });

  describe('Product page recommendations', () => {
    it('should emphasize specifications for product pages', () => {
      const content = createMockContent('product');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      const uniqueStatsRec = recommendations.find(r => r.metric === 'uniqueStats');
      expect(uniqueStatsRec).toBeDefined();
      
      // Should have product-specific fix instructions
      expect(uniqueStatsRec?.template.fix).toContain('dimensions, weight, materials');
    });
  });

  describe('Dynamic content personalization', () => {
    it('should generate personalized examples based on actual content', () => {
      const content = createMockContent('homepage');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      // Should use actual content in recommendations
      const rec = recommendations[0];
      if (rec.template.example) {
        // Examples should be contextual
        expect(rec.template.example.before).toBeTruthy();
        expect(rec.template.example.after).toBeTruthy();
      }
    });
  });

  describe('Priority calculation', () => {
    it('should calculate correct priorities with multipliers', () => {
      const content = createMockContent('documentation');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      recommendations.forEach(rec => {
        expect(rec.priority).toBeDefined();
        expect(rec.priority).toBeGreaterThan(0);
        
        // Priority should be gain * multiplier
        expect(rec.priority).toBeLessThanOrEqual(rec.template.gain * 1.5);
      });
    });
  });

  describe('Complete recommendation structure', () => {
    it('should return complete recommendation objects', () => {
      const content = createMockContent('homepage');
      const recommendations = generateRecommendations(createMockPillarResults(), content);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec.metric).toBeDefined();
        expect(rec.template).toBeDefined();
        expect(rec.template.why).toBeDefined();
        expect(rec.template.fix).toBeDefined();
        expect(rec.template.gain).toBeDefined();
        expect(rec.pillar).toBeDefined();
        expect(rec.priority).toBeDefined();
      });
    });
  });
});