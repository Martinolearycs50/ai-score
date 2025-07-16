import { describe, it, expect, beforeEach } from '@jest/globals';
import { ContentExtractor } from '../lib/contentExtractor';
import { DynamicRecommendationGenerator } from '../lib/dynamicRecommendations';
import { generateRecommendations } from '../lib/recommendations';
import { score } from '../lib/scorer-new';
import type { PillarResults } from '../lib/types';

// Mock HTML for different website types
const TAP_PAYMENT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>TAP Payments - Online Payment Gateway Solutions</title>
  <meta name="description" content="Accept local, regional, and global payments with ease. TAP Payments offers comprehensive payment gateway solutions.">
</head>
<body>
  <main>
    <h1>TAP Payments - Leading Payment Gateway</h1>
    <h2>What is TAP Payments?</h2>
    <p>TAP Payments is a leading online payment gateway and financial technology company based in the UAE.</p>
    
    <h2>Our Payment Solutions</h2>
    <p>We support multiple payment methods including Apple Pay, Visa, Mastercard, and Amex. Process payments instantly with our secure gateway.</p>
    
    <h2>Why Choose TAP?</h2>
    <ul>
      <li>Instant payment processing</li>
      <li>Support for 100+ currencies</li>
      <li>PCI DSS compliant</li>
      <li>24/7 merchant support</li>
    </ul>
    
    <h2>Integration Options</h2>
    <p>Easy API integration for developers. Our RESTful API supports all major programming languages.</p>
    
    <div class="stats">
      <p>Processing over $2 billion annually</p>
      <p>Trusted by 50,000+ merchants</p>
      <p>99.9% uptime guarantee</p>
    </div>
  </main>
</body>
</html>
`;

const BLOG_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Tech Blog - Latest in Software Development</title>
</head>
<body>
  <main>
    <article>
      <h1>Understanding Microservices Architecture</h1>
      <h2>What are Microservices?</h2>
      <p>Microservices are a software development technique that structures applications as loosely coupled services.</p>
      
      <h2>Benefits of Microservices</h2>
      <p>Improved scalability, flexibility, and faster deployment cycles.</p>
      
      <h2>How to Implement Microservices?</h2>
      <p>Start by identifying bounded contexts in your application...</p>
    </article>
  </main>
</body>
</html>
`;

const ECOMMERCE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Fashion Store - Buy Trendy Clothes Online</title>
</head>
<body>
  <main>
    <h1>Summer Collection 2024</h1>
    <div class="product">
      <h2>Designer T-Shirts</h2>
      <p class="price">$29.99</p>
      <button class="add-to-cart">Add to Cart</button>
    </div>
    <p>Free shipping on orders over $50</p>
    <p>30-day return policy</p>
  </main>
</body>
</html>
`;

describe('Content-Aware Recommendations', () => {
  describe('Content Extraction', () => {
    it('should correctly identify TAP as a payment company', () => {
      const extractor = new ContentExtractor(TAP_PAYMENT_HTML);
      const content = extractor.extract();
      
      expect(content.businessType).toBe('payment');
      expect(content.primaryTopic).toContain('TAP Payments');
      expect(content.keyTerms).toContain('payment gateway');
      expect(content.detectedFeatures.hasPaymentForms).toBe(false); // No actual form in this HTML
      expect(content.contentSamples.statistics).toContain('$2 billion annually');
      expect(content.contentSamples.statistics).toContain('50,000+ merchants');
    });
    
    it('should correctly identify blog content', () => {
      const extractor = new ContentExtractor(BLOG_HTML);
      const content = extractor.extract();
      
      expect(content.businessType).toBe('blog');
      expect(content.primaryTopic).toContain('Tech Blog');
      expect(content.detectedFeatures.hasBlogPosts).toBe(true);
      expect(content.detectedFeatures.hasQuestions).toBe(true);
    });
    
    it('should correctly identify e-commerce content', () => {
      const extractor = new ContentExtractor(ECOMMERCE_HTML);
      const content = extractor.extract();
      
      expect(content.businessType).toBe('ecommerce');
      expect(content.detectedFeatures.hasProductListings).toBe(true);
      expect(content.detectedFeatures.hasPricingInfo).toBe(true);
      expect(content.contentSamples.statistics).toContain('$29.99');
    });
  });
  
  describe('Dynamic Recommendation Generation', () => {
    it('should generate payment-specific recommendations for TAP', () => {
      const extractor = new ContentExtractor(TAP_PAYMENT_HTML);
      const content = extractor.extract();
      const generator = new DynamicRecommendationGenerator(content);
      
      // Test listicle recommendation
      const listicleRec = generator.generateRecommendation('listicleFormat', {
        why: 'Generic why',
        fix: 'Generic fix',
        gain: 10,
      });
      
      expect(listicleRec.example?.after).toMatch(/Essential.*Payment.*Features/);
      expect(listicleRec.example?.after).not.toContain('AI Search Guide');
      
      // Test structured data recommendation
      const schemaRec = generator.generateRecommendation('structuredData', {
        why: 'Generic why',
        fix: 'Generic fix',
        gain: 5,
      });
      
      expect(schemaRec.example?.after).toContain('FinancialService');
      expect(schemaRec.example?.after).not.toContain('Article');
    });
    
    it('should generate blog-specific recommendations', () => {
      const extractor = new ContentExtractor(BLOG_HTML);
      const content = extractor.extract();
      const generator = new DynamicRecommendationGenerator(content);
      
      const listicleRec = generator.generateRecommendation('listicleFormat', {
        why: 'Generic why',
        fix: 'Generic fix',
        gain: 10,
      });
      
      expect(listicleRec.example?.after).toMatch(/\d+.*Strategies/);
      expect(listicleRec.example?.before).toBe('Tech Blog - Latest in Software Development');
    });
    
    it('should use actual content in direct answer examples', () => {
      const extractor = new ContentExtractor(TAP_PAYMENT_HTML);
      const content = extractor.extract();
      const generator = new DynamicRecommendationGenerator(content);
      
      const directAnswerRec = generator.generateRecommendation('directAnswers', {
        why: 'Generic why',
        fix: 'Generic fix',
        gain: 5,
      });
      
      expect(directAnswerRec.example?.before).toContain('What is TAP Payments?');
      expect(directAnswerRec.example?.after).toContain('TAP Payments is');
    });
  });
  
  describe('End-to-End Recommendation Flow', () => {
    it('should generate relevant recommendations for TAP payment site', () => {
      const extractor = new ContentExtractor(TAP_PAYMENT_HTML);
      const extractedContent = extractor.extract();
      
      // Mock pillar results with some failed checks
      const pillarResults: PillarResults = {
        RETRIEVAL: { ttfb: 3, paywall: 5, mainContent: 5, htmlSize: 5 },
        FACT_DENSITY: { uniqueStats: 3, dataMarkup: 0, citations: 0, deduplication: 5 },
        STRUCTURE: { headingFrequency: 5, headingDepth: 5, structuredData: 0, rssFeed: 0 },
        TRUST: { authorBio: 0, napConsistency: 0, license: 0 },
        RECENCY: { lastModified: 0, stableCanonical: 5 },
      };
      
      const recommendations = generateRecommendations(pillarResults, extractedContent);
      
      // Find listicle recommendation
      const listicleRec = recommendations.find(r => r.metric === 'listicleFormat');
      expect(listicleRec).toBeUndefined(); // Should not exist as listicle check passed
      
      // Check that recommendations are relevant to payment content
      const structuredDataRec = recommendations.find(r => r.metric === 'structuredData');
      expect(structuredDataRec?.template.example?.after).toContain('FinancialService');
      
      // Verify personalized why messages
      expect(structuredDataRec?.template.why).toContain('payment content');
    });
    
    it('should not show generic AI recommendations for non-AI sites', () => {
      const extractor = new ContentExtractor(ECOMMERCE_HTML);
      const extractedContent = extractor.extract();
      
      const pillarResults: PillarResults = {
        RETRIEVAL: { ttfb: 5, paywall: 5, mainContent: 5, htmlSize: 5 },
        FACT_DENSITY: { uniqueStats: 0, dataMarkup: 5, citations: 5, deduplication: 5 },
        STRUCTURE: { headingFrequency: 0, headingDepth: 5, structuredData: 5, rssFeed: 5 },
        TRUST: { authorBio: 5, napConsistency: 5, license: 5 },
        RECENCY: { lastModified: 5, stableCanonical: 5 },
      };
      
      const recommendations = generateRecommendations(pillarResults, extractedContent);
      
      // Check all recommendations don't mention AI unnecessarily
      recommendations.forEach(rec => {
        expect(rec.template.why).not.toMatch(/AI Search Guide/i);
        if (rec.template.example?.after) {
          expect(rec.template.example.after).not.toMatch(/AI Search Guide/i);
        }
      });
    });
  });
  
  describe('Scoring with Content Awareness', () => {
    it('should pass extracted content through scoring pipeline', () => {
      const extractor = new ContentExtractor(TAP_PAYMENT_HTML);
      const extractedContent = extractor.extract();
      
      const pillarResults: PillarResults = {
        RETRIEVAL: { ttfb: 3, paywall: 5, mainContent: 5, htmlSize: 5 },
        FACT_DENSITY: { uniqueStats: 3, dataMarkup: 0, citations: 0, deduplication: 5 },
        STRUCTURE: { headingFrequency: 5, headingDepth: 5, structuredData: 0, rssFeed: 0 },
        TRUST: { authorBio: 0, napConsistency: 0, license: 0 },
        RECENCY: { lastModified: 0, stableCanonical: 5 },
      };
      
      const scoringResult = score(pillarResults, extractedContent);
      
      // Verify recommendations have examples
      expect(scoringResult.recommendations.length).toBeGreaterThan(0);
      scoringResult.recommendations.forEach(rec => {
        if (['structuredData', 'dataMarkup', 'uniqueStats'].includes(rec.metric)) {
          expect(rec.example).toBeDefined();
        }
      });
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty content gracefully', () => {
    const emptyHTML = '<html><body></body></html>';
    const extractor = new ContentExtractor(emptyHTML);
    const content = extractor.extract();
    
    expect(content.businessType).toBe('other');
    expect(content.primaryTopic).toBe('general content');
    expect(content.contentSamples.headings).toHaveLength(0);
  });
  
  it('should handle missing titles', () => {
    const noTitleHTML = '<html><body><p>Some content</p></body></html>';
    const extractor = new ContentExtractor(noTitleHTML);
    const content = extractor.extract();
    
    expect(content.contentSamples.title).toBe('');
  });
  
  it('should work without extracted content (backwards compatibility)', () => {
    const pillarResults: PillarResults = {
      RETRIEVAL: { ttfb: 0, paywall: 5, mainContent: 5, htmlSize: 5 },
      FACT_DENSITY: { uniqueStats: 5, dataMarkup: 5, citations: 5, deduplication: 5 },
      STRUCTURE: { headingFrequency: 5, headingDepth: 5, structuredData: 5, rssFeed: 5 },
      TRUST: { authorBio: 5, napConsistency: 5, license: 5 },
      RECENCY: { lastModified: 5, stableCanonical: 5 },
    };
    
    // Should not throw when no content provided
    const recommendations = generateRecommendations(pillarResults);
    expect(recommendations).toBeDefined();
    expect(recommendations[0].template.example).toBeDefined(); // Should use static examples
  });
});