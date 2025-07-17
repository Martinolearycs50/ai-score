import { 
  getPageTypePriorityMultiplier, 
  getPageTypeCustomMessage, 
  shouldShowMetric,
  pageTypeRecommendations 
} from '../pageTypeRecommendations';
import type { PageType } from '../types';

describe('pageTypeRecommendations', () => {
  describe('getPageTypePriorityMultiplier', () => {
    it('should return higher multipliers for high-priority metrics', () => {
      // Homepage prioritizes structuredData
      expect(getPageTypePriorityMultiplier('homepage', 'structuredData')).toBe(1.5);
      expect(getPageTypePriorityMultiplier('homepage', 'mainContent')).toBe(1.3);
      expect(getPageTypePriorityMultiplier('homepage', 'uniqueStats')).toBe(1.2);
      
      // Article prioritizes lastModified
      expect(getPageTypePriorityMultiplier('article', 'lastModified')).toBe(1.5);
      expect(getPageTypePriorityMultiplier('article', 'authorBio')).toBe(1.3);
      
      // Product prioritizes structuredData
      expect(getPageTypePriorityMultiplier('product', 'structuredData')).toBe(1.5);
      expect(getPageTypePriorityMultiplier('product', 'uniqueStats')).toBe(1.3);
    });

    it('should return 1.0 for non-priority metrics', () => {
      // These metrics are not in the priority list for these page types
      expect(getPageTypePriorityMultiplier('homepage', 'listicleFormat')).toBe(1.0);
      expect(getPageTypePriorityMultiplier('article', 'napConsistency')).toBe(1.0);
      expect(getPageTypePriorityMultiplier('homepage', 'paywall')).toBe(1.0);
    });

    it('should return 1.1 for lower priority metrics (index 3-4)', () => {
      // authorBio is at index 4 for homepage
      expect(getPageTypePriorityMultiplier('homepage', 'authorBio')).toBe(1.1);
      // structuredData is at index 4 for article  
      expect(getPageTypePriorityMultiplier('article', 'structuredData')).toBe(1.1);
    });

    it('should return 0 for skipped metrics', () => {
      expect(getPageTypePriorityMultiplier('search', 'listicleFormat')).toBe(0);
      expect(getPageTypePriorityMultiplier('search', 'authorBio')).toBe(0);
    });

    it('should handle general page type with default priorities', () => {
      // General page type has empty priority array, so all metrics get 1.0
      expect(getPageTypePriorityMultiplier('general', 'structuredData')).toBe(1.0);
      expect(getPageTypePriorityMultiplier('general', 'uniqueStats')).toBe(1.0);
    });
  });

  describe('getPageTypeCustomMessage', () => {
    it('should return custom messages for homepage', () => {
      const message = getPageTypeCustomMessage('homepage', 'structuredData');
      expect(message).toBe('Organization schema is essential for homepages to establish your brand identity in AI search.');
      
      const statsMessage = getPageTypeCustomMessage('homepage', 'uniqueStats');
      expect(statsMessage).toBe('Homepages need trust signals like customer counts, years in business, or success metrics.');
    });

    it('should return custom messages for articles', () => {
      const message = getPageTypeCustomMessage('article', 'lastModified');
      expect(message).toBe('AI prioritizes recent content. Always show publish and update dates on articles.');
      
      const authorMessage = getPageTypeCustomMessage('article', 'authorBio');
      expect(authorMessage).toBe('Articles need clear author attribution with credentials for AI to trust the content.');
    });

    it('should return custom messages for product pages', () => {
      const message = getPageTypeCustomMessage('product', 'structuredData');
      expect(message).toBe('Product schema with price, availability, and reviews is crucial for AI shopping queries.');
    });

    it('should return null for metrics without custom messages', () => {
      expect(getPageTypeCustomMessage('homepage', 'ttfb')).toBeNull();
      expect(getPageTypeCustomMessage('general', 'structuredData')).toBeNull();
    });
  });

  describe('shouldShowMetric', () => {
    it('should filter out irrelevant metrics for search pages', () => {
      expect(shouldShowMetric('search', 'listicleFormat')).toBe(false);
      expect(shouldShowMetric('search', 'authorBio')).toBe(false);
      expect(shouldShowMetric('search', 'mainContent')).toBe(true);
    });

    it('should show all metrics for general pages', () => {
      expect(shouldShowMetric('general', 'listicleFormat')).toBe(true);
      expect(shouldShowMetric('general', 'authorBio')).toBe(true);
      expect(shouldShowMetric('general', 'structuredData')).toBe(true);
    });

    it('should show all metrics for pages without skip rules', () => {
      expect(shouldShowMetric('homepage', 'listicleFormat')).toBe(true);
      expect(shouldShowMetric('article', 'authorBio')).toBe(true);
      expect(shouldShowMetric('product', 'comparisonTables')).toBe(true);
    });
  });

  describe('pageTypeRecommendations configuration', () => {
    it('should have complete configuration for all page types', () => {
      const pageTypes: PageType[] = [
        'homepage', 'article', 'product', 'category', 
        'documentation', 'about', 'contact', 'search', 'general'
      ];
      
      pageTypes.forEach(pageType => {
        const config = pageTypeRecommendations[pageType];
        expect(config).toBeDefined();
        expect(config.priority).toBeDefined();
        expect(Array.isArray(config.priority)).toBe(true);
        expect(config.customMessages).toBeDefined();
        expect(typeof config.customMessages).toBe('object');
      });
    });

    it('should have valid priority metrics', () => {
      // Check that priority metrics are actual recommendation metrics
      const validMetrics = [
        'structuredData', 'mainContent', 'uniqueStats', 'ttfb', 'authorBio',
        'lastModified', 'directAnswers', 'comparisonTables', 'dataMarkup',
        'semanticUrl', 'htmlSize', 'listicleFormat', 'headingDepth',
        'llmsTxtFile', 'napConsistency'
      ];
      
      Object.values(pageTypeRecommendations).forEach(config => {
        config.priority.forEach(metric => {
          expect(validMetrics).toContain(metric);
        });
      });
    });
  });
});