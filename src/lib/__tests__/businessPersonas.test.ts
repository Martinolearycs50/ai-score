import {
  businessPersonas,
  getBusinessPersona,
  getPriorityImprovements,
  getTypicalCompetitors,
  personalizeNarrative,
} from '../businessPersonas';
import type { ExtractedContent } from '../contentExtractor';

describe('Business Personas', () => {
  // Mock extracted content for testing
  const mockExtractedContent: ExtractedContent = {
    primaryTopic: 'payment processing',
    detectedTopics: ['payment', 'fintech', 'api'],
    businessType: 'payment',
    pageType: 'homepage',
    businessAttributes: {
      industry: 'financial technology',
      targetAudience: 'online businesses',
      mainProduct: 'PayFlow Pro',
      mainService: 'payment processing API',
      uniqueValue: 'instant settlements worldwide',
      missionStatement: 'making payments simple',
      yearFounded: '2020',
      location: 'San Francisco, CA',
      teamSize: '50',
    },
    competitorMentions: [],
    contentSamples: {
      title: 'PayFlow Pro - Modern Payment Processing',
      headings: [],
      paragraphs: [],
      lists: [],
      statistics: [],
      comparisons: [],
    },
    detectedFeatures: {
      hasPaymentForms: true,
      hasProductListings: false,
      hasAPIDocumentation: true,
      hasPricingInfo: true,
      hasBlogPosts: false,
      hasTutorials: true,
      hasComparisons: true,
      hasQuestions: true,
    },
    keyTerms: ['payment', 'api', 'processing'],
    productNames: ['PayFlow Pro'],
    technicalTerms: ['API', 'REST', 'webhook'],
    wordCount: 1500,
    language: 'en',
  };

  describe('getBusinessPersona', () => {
    it('should return correct persona for payment business', () => {
      const persona = getBusinessPersona(mockExtractedContent);

      expect(persona.type).toBe('payment');
      expect(persona.displayName).toBe('Payment Processing Platform');
      expect(persona.characteristics.primaryGoals).toContain(
        'Build trust with financial institutions'
      );
    });

    it('should return correct persona for each business type', () => {
      const businessTypes: ExtractedContent['businessType'][] = [
        'payment',
        'ecommerce',
        'blog',
        'news',
        'documentation',
        'corporate',
        'educational',
        'other',
      ];

      businessTypes.forEach((type) => {
        const testContent = { ...mockExtractedContent, businessType: type };
        const persona = getBusinessPersona(testContent);

        expect(persona.type).toBe(type);
        expect(persona.displayName).toBeDefined();
        expect(persona.characteristics).toBeDefined();
        expect(persona.narratives).toBeDefined();
        expect(persona.recommendations).toBeDefined();
      });
    });
  });

  describe('personalizeNarrative', () => {
    it('should replace placeholders with actual business data', () => {
      const template =
        "Analyzing {companyName}... We see you're selling {mainProduct} to {targetAudience}.";
      const result = personalizeNarrative(template, mockExtractedContent);

      expect(result).toBe(
        "Analyzing PayFlow Pro... We see you're selling PayFlow Pro to online businesses."
      );
    });

    it('should handle missing data gracefully', () => {
      const template = 'Your {industry} company in {location}';
      const minimalContent: ExtractedContent = {
        ...mockExtractedContent,
        businessAttributes: {
          industry: null,
          targetAudience: null,
          mainProduct: null,
          mainService: null,
          uniqueValue: null,
          missionStatement: null,
          yearFounded: null,
          location: null,
          teamSize: null,
        },
      };

      const result = personalizeNarrative(template, minimalContent);
      expect(result).toBe('Your your industry company in your area');
    });

    it('should accept additional data for personalization', () => {
      const template = "You're losing {visitorCount} visitors to {competitor}";
      const result = personalizeNarrative(template, mockExtractedContent, {
        visitorCount: 500,
        competitor: 'Stripe',
      });

      expect(result).toBe("You're losing 500 visitors to Stripe");
    });

    it('should extract company name from title', () => {
      const template = 'Welcome to {companyName}';
      const contentWithTitle = {
        ...mockExtractedContent,
        contentSamples: {
          ...mockExtractedContent.contentSamples,
          title: 'TechCorp - Leading Innovation',
        },
      };

      const result = personalizeNarrative(template, contentWithTitle);
      expect(result).toBe('Welcome to TechCorp');
    });
  });

  describe('getTypicalCompetitors', () => {
    it('should return competitors for payment business', () => {
      const competitors = getTypicalCompetitors('payment');

      expect(competitors).toContain('Stripe');
      expect(competitors).toContain('PayPal');
      expect(competitors.length).toBeGreaterThan(0);
    });

    it('should return different competitors for different business types', () => {
      const ecommerceCompetitors = getTypicalCompetitors('ecommerce');
      const blogCompetitors = getTypicalCompetitors('blog');

      expect(ecommerceCompetitors).toContain('Amazon');
      expect(blogCompetitors).toContain('Medium articles');
      expect(ecommerceCompetitors).not.toEqual(blogCompetitors);
    });
  });

  describe('getPriorityImprovements', () => {
    it('should return quick wins for low scores', () => {
      const improvements = getPriorityImprovements('payment', 30);
      const persona = businessPersonas.payment;

      expect(improvements).toEqual(persona.recommendations.quickWins);
    });

    it('should return specific tips for medium scores', () => {
      const improvements = getPriorityImprovements('payment', 60);
      const persona = businessPersonas.payment;

      expect(improvements).toEqual(persona.recommendations.specificTips);
    });

    it('should return maintenance tips for high scores', () => {
      const improvements = getPriorityImprovements('payment', 85);

      expect(improvements).toContain('Maintain content freshness with regular updates');
      expect(improvements).toContain('Monitor competitor changes and adapt');
    });

    it('should handle edge case scores', () => {
      const zeroScore = getPriorityImprovements('blog', 0);
      const perfectScore = getPriorityImprovements('blog', 100);

      expect(zeroScore).toBeDefined();
      expect(zeroScore.length).toBeGreaterThan(0);
      expect(perfectScore).toBeDefined();
      expect(perfectScore.length).toBeGreaterThan(0);
    });
  });

  describe('Business Persona Content Validation', () => {
    it('should have complete data for all personas', () => {
      Object.entries(businessPersonas).forEach(([type, persona]) => {
        // Check characteristics
        expect(persona.characteristics.primaryGoals.length).toBeGreaterThan(0);
        expect(persona.characteristics.painPoints.length).toBeGreaterThan(0);
        expect(persona.characteristics.aiSearchNeeds.length).toBeGreaterThan(0);
        expect(persona.characteristics.typicalCompetitors.length).toBeGreaterThan(0);

        // Check narratives
        expect(persona.narratives.recognition).toBeTruthy();
        expect(persona.narratives.curiosityGap).toBeTruthy();
        expect(persona.narratives.concernTrigger).toBeTruthy();
        expect(persona.narratives.hopeTrigger).toBeTruthy();
        expect(persona.narratives.celebrationMessage).toBeTruthy();

        // Check recommendations
        expect(persona.recommendations.priorities.length).toBeGreaterThan(0);
        expect(persona.recommendations.quickWins.length).toBeGreaterThan(0);
        expect(persona.recommendations.specificTips.length).toBeGreaterThan(0);
      });
    });

    it('should have unique narratives for each persona', () => {
      const allRecognitionMessages = Object.values(businessPersonas).map(
        (p) => p.narratives.recognition
      );

      const uniqueMessages = new Set(allRecognitionMessages);
      expect(uniqueMessages.size).toBe(allRecognitionMessages.length);
    });

    it('should have appropriate priorities for each business type', () => {
      // Payment should prioritize TRUST
      expect(businessPersonas.payment.recommendations.priorities).toContain('TRUST');

      // E-commerce should prioritize STRUCTURE
      expect(businessPersonas.ecommerce.recommendations.priorities).toContain('STRUCTURE');

      // News should prioritize RECENCY
      expect(businessPersonas.news.recommendations.priorities).toContain('RECENCY');

      // Documentation should prioritize STRUCTURE
      expect(businessPersonas.documentation.recommendations.priorities).toContain('STRUCTURE');
    });
  });
});
