import type { AnalysisResultNew } from '../analyzer-new';
import type { ExtractedContent } from '../contentExtractor';
import { NarrativeEngine, type StoryArc } from '../narrativeEngine';

describe('NarrativeEngine', () => {
  // Mock analysis result
  const mockAnalysisResult: AnalysisResultNew = {
    url: 'https://example.com',
    pageTitle: 'Example Payment Platform',
    aiSearchScore: 45,
    overallRating: 'fair',
    websiteProfile: {
      domain: 'example.com',
      title: 'Example Payment Platform',
      description: 'Modern payment processing',
      industry: 'fintech',
      type: 'business',
    },
    scoringResult: {
      pillars: {
        RETRIEVAL: { score: 15, maxScore: 30, percentage: 50, issues: [] },
        FACT_DENSITY: { score: 10, maxScore: 25, percentage: 40, issues: [] },
        STRUCTURE: { score: 8, maxScore: 20, percentage: 40, issues: [] },
        TRUST: { score: 7, maxScore: 15, percentage: 47, issues: [] },
        RECENCY: { score: 5, maxScore: 10, percentage: 50, issues: [] },
      },
      recommendations: [
        {
          title: 'Add security certifications',
          description: 'Display your compliance badges',
          impact: 'high',
          effort: 'low',
          priority: 'high',
          category: 'trust',
          estimatedScoreImpact: 10,
          implementationTime: '30 minutes',
          pillar: 'TRUST',
          beforeExample: 'No security info',
          afterExample: 'PCI-DSS compliant badge',
          whyItMatters: 'Builds trust with users',
        },
      ],
      totalScore: 45,
      performanceInsights: {},
    },
  };

  // Mock extracted content
  const mockExtractedContent: ExtractedContent = {
    primaryTopic: 'payment processing',
    detectedTopics: ['payment', 'fintech', 'api'],
    businessType: 'payment',
    pageType: 'homepage',
    businessAttributes: {
      industry: 'financial technology',
      targetAudience: 'online businesses',
      mainProduct: 'PaymentPro',
      mainService: 'payment processing API',
      uniqueValue: 'instant settlements',
      missionStatement: 'making payments simple',
      yearFounded: '2020',
      location: 'San Francisco',
      teamSize: '50',
    },
    competitorMentions: [
      { name: 'Stripe', context: 'Unlike Stripe, we offer...', sentiment: 'positive' },
      { name: 'PayPal', context: 'Compared to PayPal...', sentiment: 'neutral' },
    ],
    contentSamples: {
      title: 'Example Payment Platform',
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
    productNames: ['PaymentPro'],
    technicalTerms: ['API', 'REST'],
    wordCount: 1500,
    language: 'en',
  };

  describe('Story Arc Generation', () => {
    it('should generate complete story arc with all stages', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.stages).toBeDefined();
      expect(storyArc.stages.recognition).toBeDefined();
      expect(storyArc.stages.curiosity).toBeDefined();
      expect(storyArc.stages.revelation).toBeDefined();
      expect(storyArc.stages.concern).toBeDefined();
      expect(storyArc.stages.hope).toBeDefined();
      expect(storyArc.stages.action).toBeDefined();
      expect(storyArc.stages.celebration).toBeDefined();
    });

    it('should include metadata about the analysis', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.metadata.businessType).toBe('payment');
      expect(storyArc.metadata.competitorCount).toBeGreaterThanOrEqual(2); // Includes extracted + typical
      expect(storyArc.metadata.improvementPotential).toBeGreaterThan(0);
      expect(storyArc.metadata.estimatedLostTraffic).toBeGreaterThan(0);
    });
  });

  describe('Stage Content Generation', () => {
    it('should personalize recognition stage with business data', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();
      const recognition = storyArc.stages.recognition;

      expect(recognition.message).toContain('payment platform');
      expect(recognition.message).toContain('financial technology');
      expect(recognition.emotion).toBe('neutral');
      expect(recognition.visualHint).toBe('loading');
    });

    it('should create curiosity with competitor mentions', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();
      const curiosity = storyArc.stages.curiosity;

      // The message should contain something about AI recommendations
      expect(curiosity.message).toContain('AI');
      expect(curiosity.emotion).toBe('curious');
      expect(curiosity.data?.competitorsFound).toBe(2);
      expect(curiosity.data?.topCompetitor).toBe('Stripe');
    });

    it('should show appropriate concern based on score', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();
      const revelation = storyArc.stages.revelation;

      // Score is 45, should show medium concern
      expect(revelation.title).toBe('AI Search Score: 45');
      expect(revelation.emotion).toBe('hopeful'); // 45 is in hopeful range
      expect(revelation.data?.currentScore).toBe(45);
    });

    it('should calculate realistic improvement potential', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      const potential = storyArc.metadata.improvementPotential;
      // For payment type with score 45, expect reasonable improvement
      expect(potential).toBeGreaterThan(20);
      expect(potential).toBeLessThan(50);
    });
  });

  describe('Different Score Scenarios', () => {
    it('should show concern emotion for low scores', () => {
      const lowScoreResult = {
        ...mockAnalysisResult,
        aiSearchScore: 25,
      };

      const engine = new NarrativeEngine(lowScoreResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.stages.revelation.emotion).toBe('concerned');
      expect(storyArc.stages.revelation.visualHint).toBe('warning');
    });

    it('should show celebration for high scores', () => {
      const highScoreResult = {
        ...mockAnalysisResult,
        aiSearchScore: 85,
      };

      const engine = new NarrativeEngine(highScoreResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.stages.revelation.message).toContain('already performing well');
      expect(storyArc.metadata.improvementPotential).toBeLessThan(20);
    });
  });

  describe('Business Type Variations', () => {
    it('should adapt narrative for e-commerce sites', () => {
      const ecommerceContent: ExtractedContent = {
        ...mockExtractedContent,
        businessType: 'ecommerce',
        businessAttributes: {
          ...mockExtractedContent.businessAttributes,
          mainProduct: 'Handmade Jewelry',
          targetAudience: 'fashion-conscious shoppers',
        },
      };

      const engine = new NarrativeEngine(mockAnalysisResult, ecommerceContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.stages.recognition.message).toContain('e-commerce store');
      expect(storyArc.stages.concern.data?.dailyLoss).toBeGreaterThan(0);
    });

    it('should adapt narrative for blogs', () => {
      const blogContent: ExtractedContent = {
        ...mockExtractedContent,
        businessType: 'blog',
        primaryTopic: 'technology insights',
      };

      const engine = new NarrativeEngine(mockAnalysisResult, blogContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.stages.recognition.message).toContain('blog');
      expect(storyArc.stages.recognition.message).toContain('technology insights');
    });
  });

  describe('Progress Narrative', () => {
    it('should generate positive narrative for improvements', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const progressNarrative = engine.generateProgressNarrative(35);

      expect(progressNarrative.title).toContain("You've Improved by 10 Points!");
      expect(progressNarrative.emotion).toBe('celebratory');
      expect(progressNarrative.data?.improvement).toBe(10);
    });

    it('should generate concern narrative for decreases', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const progressNarrative = engine.generateProgressNarrative(55);

      expect(progressNarrative.title).toContain('Time for a Refresh');
      expect(progressNarrative.emotion).toBe('concerned');
      expect(progressNarrative.data?.decrease).toBe(10);
    });

    it('should handle stable scores', () => {
      const engine = new NarrativeEngine(mockAnalysisResult, mockExtractedContent);
      const progressNarrative = engine.generateProgressNarrative(45);

      expect(progressNarrative.title).toContain('Maintaining Your Position');
      expect(progressNarrative.emotion).toBe('neutral');
      expect(progressNarrative.data?.status).toBe('stable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing competitor data', () => {
      const noCompetitorContent: ExtractedContent = {
        ...mockExtractedContent,
        competitorMentions: [],
      };

      const engine = new NarrativeEngine(mockAnalysisResult, noCompetitorContent);
      const storyArc = engine.generateStoryArc();

      // Should still generate a curiosity message even without competitor data
      expect(storyArc.stages.curiosity.message).toBeDefined();
      expect(storyArc.stages.curiosity.data?.topCompetitor).toContain('Stripe'); // Uses typical competitors
      expect(storyArc.metadata.competitorCount).toBeGreaterThan(0); // Should use typical competitors
    });

    it('should handle missing business attributes', () => {
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

      const engine = new NarrativeEngine(mockAnalysisResult, minimalContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc).toBeDefined();
      expect(storyArc.stages.recognition.subMessage).toBe('');
    });

    it('should handle perfect score scenario', () => {
      const perfectScoreResult = {
        ...mockAnalysisResult,
        aiSearchScore: 100,
      };

      const engine = new NarrativeEngine(perfectScoreResult, mockExtractedContent);
      const storyArc = engine.generateStoryArc();

      expect(storyArc.metadata.improvementPotential).toBe(0);
      expect(storyArc.stages.hope.message).toBeDefined();
    });
  });

  describe('Implementation Time Estimates', () => {
    it('should estimate longer time for lower scores', () => {
      const testCases = [
        { score: 20, expected: '2-3 days' },
        { score: 40, expected: '1-2 days' },
        { score: 60, expected: '4-8 hours' },
        { score: 80, expected: '2-4 hours' },
      ];

      testCases.forEach(({ score, expected }) => {
        const result = { ...mockAnalysisResult, aiSearchScore: score };
        const engine = new NarrativeEngine(result, mockExtractedContent);
        const storyArc = engine.generateStoryArc();

        expect(storyArc.stages.action.data?.estimatedTime).toBe(expected);
      });
    });
  });
});
