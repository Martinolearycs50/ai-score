/**
 * Integration test to verify complete page-type aware recommendation flow
 * Tests the entire pipeline from content extraction to recommendation display
 */

import { generateRecommendations } from '../recommendations';
import type { ExtractedContent } from '../contentExtractor';
import type { PillarResults } from '../types';

// Test different URLs and verify correct behavior
describe('Page Type Integration - Real World Scenarios', () => {
  // Mock pillar results with some failures to generate recommendations
  const mockPillarResults: PillarResults = {
    RETRIEVAL: {
      ttfb: 5,         // Failed (slow)
      paywall: 5,
      mainContent: 0,  // Failed (no main tag)
      htmlSize: 10,
    },
    FACT_DENSITY: {
      uniqueStats: 0,  // Failed (no stats)
      dataMarkup: 5,
      citations: 10,
      deduplication: 10,
    },
    STRUCTURE: {
      headingFrequency: 10,
      headingDepth: 5,
      structuredData: 0,  // Failed (no schema)
      rssFeed: 5,
    },
    TRUST: {
      authorBio: 0,     // Failed (no author)
      napConsistency: 5,
      license: 5,
    },
    RECENCY: {
      lastModified: 0,  // Failed (no dates)
      stableCanonical: 5,
    },
  };

  describe('Homepage Analysis', () => {
    const homepageContent: ExtractedContent = {
      primaryTopic: 'AI Search Optimization Services',
      detectedTopics: ['AI', 'search', 'optimization', 'services'],
      businessType: 'corporate',
      pageType: 'homepage',
      contentSamples: {
        title: 'AI Search Pro - Optimize Your Site for AI',
        headings: [
          { level: 1, text: 'Welcome to AI Search Pro', content: 'We help websites get cited by AI' },
          { level: 2, text: 'Our Services', content: 'Complete AI optimization solutions' },
        ],
        paragraphs: ['Leading AI optimization company serving 5000+ clients'],
        lists: [],
        statistics: ['5000+ clients', '98% success rate'],
        comparisons: [],
      },
      detectedFeatures: {
        hasPaymentForms: false,
        hasProductListings: false,
        hasAPIDocumentation: false,
        hasPricingInfo: true,
        hasBlogPosts: false,
        hasTutorials: false,
        hasComparisons: false,
        hasQuestions: false,
      },
      keyTerms: ['AI optimization', 'search visibility'],
      productNames: ['AI Search Pro'],
      technicalTerms: ['SEO', 'AI'],
      wordCount: 2000,
      language: 'en',
    };

    it('should prioritize Organization schema for homepage', () => {
      const recommendations = generateRecommendations(mockPillarResults, homepageContent);
      
      // First recommendation should be structuredData due to homepage priority
      expect(recommendations[0].metric).toBe('structuredData');
      expect(recommendations[0].priority).toBe(5 * 1.5); // gain of 5 * 1.5 multiplier
      
      // Should have homepage-specific messaging
      expect(recommendations[0].template.why).toContain('Organization schema is essential for homepages');
      expect(recommendations[0].template.why).toContain('As your homepage,');
      expect(recommendations[0].template.fix).toContain('Use Organization schema with complete NAP');
    });

    it('should recommend trust signals for homepage', () => {
      const recommendations = generateRecommendations(mockPillarResults, homepageContent);
      const statsRec = recommendations.find(r => r.metric === 'uniqueStats');
      
      expect(statsRec).toBeDefined();
      expect(statsRec?.template.why).toContain('Homepages need trust signals');
      expect(statsRec?.template.fix).toContain('serving 10,000+ customers');
    });
  });

  describe('Article/Blog Analysis', () => {
    const articleContent: ExtractedContent = {
      primaryTopic: 'How to Optimize for AI Search in 2025',
      detectedTopics: ['AI search', 'optimization', 'guide', '2025'],
      businessType: 'blog',
      pageType: 'article',
      contentSamples: {
        title: 'Ultimate Guide to AI Search Optimization 2025',
        headings: [
          { level: 1, text: 'How to Optimize for AI Search?', content: 'AI search requires new strategies' },
          { level: 2, text: 'Understanding AI Crawlers', content: 'How AI bots read your content' },
        ],
        paragraphs: ['In this comprehensive guide, we explore the latest AI search strategies...'],
        lists: [{ type: 'ol', items: ['Step 1: Audit your site', 'Step 2: Add schema'] }],
        statistics: [],
        comparisons: ['ChatGPT vs Perplexity rankings'],
      },
      detectedFeatures: {
        hasPaymentForms: false,
        hasProductListings: false,
        hasAPIDocumentation: false,
        hasPricingInfo: false,
        hasBlogPosts: true,
        hasTutorials: true,
        hasComparisons: true,
        hasQuestions: true,
      },
      keyTerms: ['AI search', 'optimization guide'],
      productNames: [],
      technicalTerms: ['schema', 'crawlers'],
      wordCount: 3500,
      language: 'en',
    };

    it('should prioritize freshness for articles', () => {
      const recommendations = generateRecommendations(mockPillarResults, articleContent);
      
      // lastModified should be high priority for articles
      const lastModRec = recommendations.find(r => r.metric === 'lastModified');
      expect(lastModRec?.priority).toBe(5 * 1.5); // Top priority for articles
      
      expect(lastModRec?.template.why).toContain('AI prioritizes recent content');
      expect(lastModRec?.template.why).toContain('For blog content,');
    });

    it('should emphasize author credibility for articles', () => {
      const recommendations = generateRecommendations(mockPillarResults, articleContent);
      const authorRec = recommendations.find(r => r.metric === 'authorBio');
      
      expect(authorRec).toBeDefined();
      expect(authorRec?.priority).toBe(5 * 1.3); // Second priority
      expect(authorRec?.template.why).toContain('Articles need clear author attribution');
    });
  });

  describe('Product Page Analysis', () => {
    const productContent: ExtractedContent = {
      primaryTopic: 'Professional AI Search Scanner Tool',
      detectedTopics: ['AI scanner', 'tool', 'software', 'professional'],
      businessType: 'ecommerce',
      pageType: 'product',
      contentSamples: {
        title: 'AI Search Scanner Pro - $99',
        headings: [
          { level: 1, text: 'AI Search Scanner Pro', content: 'Professional scanning tool' },
          { level: 2, text: 'Features', content: 'Real-time analysis, detailed reports' },
          { level: 2, text: 'Specifications', content: 'Cloud-based, API access' },
        ],
        paragraphs: ['Professional-grade AI search analysis tool with real-time monitoring'],
        lists: [{ type: 'ul', items: ['Real-time scanning', 'Detailed reports', 'API access'] }],
        statistics: ['99.9% uptime', '< 1s scan time'],
        comparisons: [],
      },
      detectedFeatures: {
        hasPaymentForms: true,
        hasProductListings: false,
        hasAPIDocumentation: true,
        hasPricingInfo: true,
        hasBlogPosts: false,
        hasTutorials: false,
        hasComparisons: false,
        hasQuestions: false,
      },
      keyTerms: ['AI scanner', 'professional tool'],
      productNames: ['AI Search Scanner Pro'],
      technicalTerms: ['API', 'cloud-based'],
      wordCount: 1500,
      language: 'en',
    };

    it('should prioritize Product schema for product pages', () => {
      const recommendations = generateRecommendations(mockPillarResults, productContent);
      
      expect(recommendations[0].metric).toBe('structuredData');
      expect(recommendations[0].template.why).toContain('Product schema with price, availability, and reviews');
      expect(recommendations[0].template.fix).toContain('Implement Product schema');
    });

    it('should recommend specifications for products', () => {
      const recommendations = generateRecommendations(mockPillarResults, productContent);
      const statsRec = recommendations.find(r => r.metric === 'uniqueStats');
      
      expect(statsRec?.template.fix).toContain('dimensions, weight, materials, and performance metrics');
    });
  });

  describe('Search Results Page Analysis', () => {
    const searchContent: ExtractedContent = {
      primaryTopic: 'Search Results for AI Tools',
      detectedTopics: ['search', 'results', 'AI tools'],
      businessType: 'other',
      pageType: 'search',
      contentSamples: {
        title: 'Search Results: AI Tools',
        headings: [
          { level: 1, text: '25 Results for "AI Tools"', content: 'Showing 1-10 of 25' },
        ],
        paragraphs: [],
        lists: [],
        statistics: ['25 results found'],
        comparisons: [],
      },
      detectedFeatures: {
        hasPaymentForms: false,
        hasProductListings: true,
        hasAPIDocumentation: false,
        hasPricingInfo: false,
        hasBlogPosts: false,
        hasTutorials: false,
        hasComparisons: false,
        hasQuestions: false,
      },
      keyTerms: ['search results'],
      productNames: [],
      technicalTerms: [],
      wordCount: 500,
      language: 'en',
    };

    it('should skip irrelevant metrics for search pages', () => {
      const recommendations = generateRecommendations(mockPillarResults, searchContent);
      
      // Should not include listicleFormat or authorBio
      expect(recommendations.find(r => r.metric === 'listicleFormat')).toBeUndefined();
      expect(recommendations.find(r => r.metric === 'authorBio')).toBeUndefined();
      
      // Should include relevant metrics
      expect(recommendations.find(r => r.metric === 'mainContent')).toBeDefined();
    });
  });

  describe('Recommendation Sorting and Priority', () => {
    it('should sort recommendations by adjusted priority', () => {
      const content = createMockContent('homepage');
      const recommendations = generateRecommendations(mockPillarResults, content);
      
      // Verify sorting
      for (let i = 1; i < recommendations.length; i++) {
        const prevPriority = recommendations[i - 1].priority || 0;
        const currPriority = recommendations[i].priority || 0;
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
      
      // Top recommendation should be homepage's #1 priority with highest gain
      expect(recommendations[0].metric).toBe('structuredData');
    });
  });
});

function createMockContent(pageType: ExtractedContent['pageType']): ExtractedContent {
  return {
    primaryTopic: 'Test Content',
    detectedTopics: ['test'],
    businessType: 'corporate',
    pageType,
    contentSamples: {
      title: 'Test',
      headings: [],
      paragraphs: [],
      lists: [],
      statistics: [],
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
      hasQuestions: false,
    },
    keyTerms: [],
    productNames: [],
    technicalTerms: [],
    wordCount: 100,
    language: 'en',
  };
}