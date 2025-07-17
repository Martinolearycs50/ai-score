import { DynamicRecommendationGenerator } from '../dynamicRecommendations';
import type { ExtractedContent } from '../contentExtractor';
import type { RecommendationTemplate } from '../types';

describe('DynamicRecommendationGenerator - Page Type Context', () => {
  const createMockContent = (pageType: ExtractedContent['pageType']): ExtractedContent => ({
    primaryTopic: 'AI optimization',
    detectedTopics: ['AI', 'search', 'optimization'],
    businessType: 'corporate',
    pageType,
    contentSamples: {
      title: 'Test Page',
      headings: [],
      paragraphs: ['Test content paragraph'],
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
    keyTerms: ['optimization', 'search'],
    productNames: [],
    technicalTerms: ['AI', 'SEO'],
    wordCount: 500,
    language: 'en',
  });

  const baseTemplate: RecommendationTemplate = {
    why: 'This is important for AI visibility.',
    fix: 'Here is how to fix it.',
    gain: 10,
  };

  describe('Homepage recommendations', () => {
    it('should add homepage context to why message', () => {
      const content = createMockContent('homepage');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('structuredData', baseTemplate);
      
      expect(result.why).toContain('As your homepage,');
      expect(result.why).toContain('This helps AI understand your entire site\'s purpose and structure.');
    });

    it('should add homepage-specific fix instructions', () => {
      const content = createMockContent('homepage');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('uniqueStats', baseTemplate);
      
      expect(result.fix).toContain('For homepages, include company metrics');
      expect(result.fix).toContain('serving 10,000+ customers');
    });
  });

  describe('Article recommendations', () => {
    it('should add article context to why message', () => {
      const content = createMockContent('article');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('lastModified', baseTemplate);
      
      expect(result.why).toContain('For blog content,');
      expect(result.why).toContain('This increases chances of being cited as a source by AI.');
    });

    it('should add article-specific fix instructions', () => {
      const content = createMockContent('article');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('uniqueStats', baseTemplate);
      
      expect(result.fix).toContain('Include research data, survey results, or case study metrics');
    });
  });

  describe('Product page recommendations', () => {
    it('should add product context to why message', () => {
      const content = createMockContent('product');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('structuredData', baseTemplate);
      
      expect(result.why).toContain('On product pages,');
      expect(result.why).toContain('This helps AI recommend your products in shopping queries.');
    });

    it('should add product-specific fix instructions', () => {
      const content = createMockContent('product');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('uniqueStats', baseTemplate);
      
      expect(result.fix).toContain('For products, add specifications like dimensions, weight, materials');
    });
  });

  describe('Documentation recommendations', () => {
    it('should add documentation context to why message', () => {
      const content = createMockContent('documentation');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('directAnswers', baseTemplate);
      
      expect(result.why).toContain('In documentation,');
      expect(result.why).toContain('This makes your docs the go-to reference for AI coding assistance.');
    });

    it('should add documentation-specific fix instructions', () => {
      const content = createMockContent('documentation');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('structuredData', baseTemplate);
      
      expect(result.fix).toContain('Use TechArticle or HowTo schema for technical content');
    });
  });

  describe('General page recommendations', () => {
    it('should use generic context for general pages', () => {
      const content = createMockContent('general');
      const generator = new DynamicRecommendationGenerator(content);
      const result = generator.generateRecommendation('structuredData', baseTemplate);
      
      // Should not have page-specific prefix
      expect(result.why).not.toContain('As your homepage,');
      expect(result.why).not.toContain('For blog content,');
      
      // Should have generic suffix
      expect(result.why).toContain('This improves overall AI comprehension of your content.');
    });
  });

  describe('Context preservation', () => {
    it('should preserve existing template content while adding context', () => {
      const content = createMockContent('homepage');
      const generator = new DynamicRecommendationGenerator(content);
      
      const customTemplate: RecommendationTemplate = {
        why: 'Critical for search visibility.',
        fix: 'Implement immediately.',
        gain: 15,
        example: {
          before: '<div>Old code</div>',
          after: '<main>New code</main>',
        },
      };
      
      const result = generator.generateRecommendation('mainContent', customTemplate);
      
      // Should contain both original and context
      expect(result.why).toContain('Critical for search visibility.');
      expect(result.why).toContain('As your homepage,');
      
      expect(result.fix).toContain('Implement immediately.');
      expect(result.fix).toContain('Ensure your value proposition and key services are inside <main> tags.');
      
      // Should preserve gain and example
      expect(result.gain).toBe(15);
      expect(result.example).toBeDefined();
    });
  });
});