import { describe, expect, test, beforeEach } from '@jest/globals';
import { AnalysisScorer } from './scorer';
import type { AnalysisDetails } from './types';

describe('AnalysisScorer', () => {
  let scorer: AnalysisScorer;
  let mockDetails: AnalysisDetails;

  beforeEach(() => {
    scorer = new AnalysisScorer();
    mockDetails = {
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      crawler_accessibility: {
        https_enabled: true,
        robots_txt_found: true,
        ai_crawlers_allowed: {
          chatgpt: true,
          claude: true,
          perplexity: true,
          gemini: true
        },
        mobile_friendly: true,
        page_accessible: true,
        crawlability_errors: []
      },
      content_structure: {
        heading_structure: {
          h1_count: 1,
          h2_count: 3,
          h3_count: 5,
          proper_hierarchy: true,
          headings: []
        },
        content_metrics: {
          word_count: 1000,
          paragraph_count: 10,
          list_count: 2,
          has_faq_section: true
        },
        readability: {
          flesch_score: 65,
          avg_sentence_length: 15,
          reading_level: 'Standard'
        }
      },
      technical_seo: {
        meta_tags: {
          title_present: true,
          title_length: 55,
          description_present: true,
          description_length: 150,
          viewport_present: true
        },
        schema_markup: {
          has_schema: true,
          types: ['Article', 'FAQPage'],
          has_faq_schema: true,
          has_article_schema: true,
          has_organization_schema: false
        },
        open_graph: {
          has_og_tags: true,
          og_title: true,
          og_description: true,
          og_image: true
        },
        performance: {
          image_count: 5,
          images_with_alt: 5,
          external_resources: 3
        }
      },
      ai_optimization: {
        content_freshness: {
          has_date_info: true,
          estimated_freshness_score: 100
        },
        multimedia_integration: {
          image_count: 5,
          video_count: 1,
          images_with_descriptive_alt: 5
        },
        credibility_signals: {
          has_author_info: true,
          has_contact_info: true,
          has_about_page_link: true,
          external_links_count: 3,
          internal_links_count: 5
        },
        content_format: {
          has_numbered_lists: true,
          has_bullet_points: true,
          has_comparison_content: true,
          has_data_statistics: true,
          has_source_citations: true
        }
      }
    };
  });

  describe('calculateCategoryScores', () => {
    test('should calculate perfect scores', () => {
      const scores = scorer.calculateCategoryScores(mockDetails);
      
      expect(scores.crawler_accessibility).toBe(25); // Perfect score
      expect(scores.content_structure).toBe(25); // Perfect score
      expect(scores.technical_seo).toBe(25); // Perfect score
      expect(scores.ai_optimization).toBe(25); // Perfect score
    });

    test('should calculate partial scores', () => {
      // Modify details for partial scores
      mockDetails.crawler_accessibility.https_enabled = false;
      mockDetails.crawler_accessibility.ai_crawlers_allowed.chatgpt = false;
      mockDetails.crawler_accessibility.ai_crawlers_allowed.claude = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      expect(scores.crawler_accessibility).toBeLessThan(25);
      expect(scores.crawler_accessibility).toBeGreaterThan(0);
    });
  });

  describe('scoreCrawlerAccessibility', () => {
    test('should score HTTPS enabled', () => {
      const withHttps = scorer.calculateCategoryScores(mockDetails);
      mockDetails.crawler_accessibility.https_enabled = false;
      const withoutHttps = scorer.calculateCategoryScores(mockDetails);
      
      expect(withHttps.crawler_accessibility).toBeGreaterThan(withoutHttps.crawler_accessibility);
    });

    test('should score robots.txt accessibility', () => {
      const withRobots = scorer.calculateCategoryScores(mockDetails);
      mockDetails.crawler_accessibility.robots_txt_found = false;
      const withoutRobots = scorer.calculateCategoryScores(mockDetails);
      
      expect(withRobots.crawler_accessibility).toBeGreaterThan(withoutRobots.crawler_accessibility);
    });

    test('should score AI crawler allowance proportionally', () => {
      const allAllowed = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.crawler_accessibility.ai_crawlers_allowed.chatgpt = false;
      const threeAllowed = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.crawler_accessibility.ai_crawlers_allowed.claude = false;
      const twoAllowed = scorer.calculateCategoryScores(mockDetails);
      
      expect(allAllowed.crawler_accessibility).toBeGreaterThan(threeAllowed.crawler_accessibility);
      expect(threeAllowed.crawler_accessibility).toBeGreaterThan(twoAllowed.crawler_accessibility);
    });

    test('should score mobile friendliness', () => {
      const mobileFriendly = scorer.calculateCategoryScores(mockDetails);
      mockDetails.crawler_accessibility.mobile_friendly = false;
      const notMobileFriendly = scorer.calculateCategoryScores(mockDetails);
      
      expect(mobileFriendly.crawler_accessibility).toBeGreaterThan(notMobileFriendly.crawler_accessibility);
    });
  });

  describe('scoreContentStructure', () => {
    test('should score heading hierarchy', () => {
      const properHierarchy = scorer.calculateCategoryScores(mockDetails);
      mockDetails.content_structure.heading_structure.proper_hierarchy = false;
      const improperHierarchy = scorer.calculateCategoryScores(mockDetails);
      
      expect(properHierarchy.content_structure).toBeGreaterThan(improperHierarchy.content_structure);
    });

    test('should give partial credit for multiple H1s', () => {
      mockDetails.content_structure.heading_structure.h1_count = 3;
      const multipleH1s = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.content_structure.heading_structure.h1_count = 0;
      const noH1 = scorer.calculateCategoryScores(mockDetails);
      
      expect(multipleH1s.content_structure).toBeGreaterThan(noH1.content_structure);
    });

    test('should score content length proportionally', () => {
      const scores: number[] = [];
      const wordCounts = [0, 150, 300, 500, 800];
      
      wordCounts.forEach(count => {
        mockDetails.content_structure.content_metrics.word_count = count;
        scores.push(scorer.calculateCategoryScores(mockDetails).content_structure);
      });
      
      // Scores should increase with word count
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
      }
    });

    test('should score FAQ section presence', () => {
      const withFaq = scorer.calculateCategoryScores(mockDetails);
      mockDetails.content_structure.content_metrics.has_faq_section = false;
      const withoutFaq = scorer.calculateCategoryScores(mockDetails);
      
      expect(withFaq.content_structure).toBeGreaterThan(withoutFaq.content_structure);
    });

    test('should score readability with penalty for long sentences', () => {
      mockDetails.content_structure.readability.avg_sentence_length = 15;
      const goodReadability = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.content_structure.readability.avg_sentence_length = 30;
      const poorReadability = scorer.calculateCategoryScores(mockDetails);
      
      expect(goodReadability.content_structure).toBeGreaterThan(poorReadability.content_structure);
    });
  });

  describe('scoreTechnicalSeo', () => {
    test('should score meta tags completeness', () => {
      const complete = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.meta_tags.title_present = false;
      const noTitle = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.meta_tags.title_present = true;
      mockDetails.technical_seo.meta_tags.description_present = false;
      const noDescription = scorer.calculateCategoryScores(mockDetails);
      
      expect(complete.technical_seo).toBeGreaterThan(noTitle.technical_seo);
      expect(complete.technical_seo).toBeGreaterThan(noDescription.technical_seo);
    });

    test('should score optimal meta tag lengths', () => {
      const optimal = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.meta_tags.title_length = 20; // Too short
      const shortTitle = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.meta_tags.title_length = 80; // Too long
      const longTitle = scorer.calculateCategoryScores(mockDetails);
      
      expect(optimal.technical_seo).toBeGreaterThan(shortTitle.technical_seo);
      expect(optimal.technical_seo).toBeGreaterThan(longTitle.technical_seo);
    });

    test('should score schema markup presence and types', () => {
      const withSchema = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.schema_markup.has_schema = false;
      const withoutSchema = scorer.calculateCategoryScores(mockDetails);
      
      expect(withSchema.technical_seo).toBeGreaterThan(withoutSchema.technical_seo);
    });

    test('should give bonus for FAQ schema', () => {
      const withFaqSchema = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.schema_markup.has_faq_schema = false;
      const withoutFaqSchema = scorer.calculateCategoryScores(mockDetails);
      
      expect(withFaqSchema.technical_seo).toBeGreaterThan(withoutFaqSchema.technical_seo);
    });

    test('should score Open Graph completeness', () => {
      const complete = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.open_graph.og_image = false;
      const partialOg = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.open_graph.has_og_tags = false;
      const noOg = scorer.calculateCategoryScores(mockDetails);
      
      expect(complete.technical_seo).toBeGreaterThan(partialOg.technical_seo);
      expect(partialOg.technical_seo).toBeGreaterThan(noOg.technical_seo);
    });

    test('should score image optimization', () => {
      const allAlt = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.performance.images_with_alt = 2;
      const partialAlt = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.performance.images_with_alt = 0;
      const noAlt = scorer.calculateCategoryScores(mockDetails);
      
      expect(allAlt.technical_seo).toBeGreaterThan(partialAlt.technical_seo);
      expect(partialAlt.technical_seo).toBeGreaterThan(noAlt.technical_seo);
    });

    test('should penalize too many external resources', () => {
      const fewResources = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.technical_seo.performance.external_resources = 55;
      const manyResources = scorer.calculateCategoryScores(mockDetails);
      
      expect(fewResources.technical_seo).toBeGreaterThan(manyResources.technical_seo);
    });
  });

  describe('scoreAiOptimization', () => {
    test('should score content freshness proportionally', () => {
      const fresh = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.content_freshness.estimated_freshness_score = 50;
      const medium = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.content_freshness.estimated_freshness_score = 10;
      const stale = scorer.calculateCategoryScores(mockDetails);
      
      expect(fresh.ai_optimization).toBeGreaterThan(medium.ai_optimization);
      expect(medium.ai_optimization).toBeGreaterThan(stale.ai_optimization);
    });

    test('should score multimedia integration', () => {
      const withMultimedia = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.multimedia_integration.video_count = 0;
      const noVideo = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.multimedia_integration.image_count = 0;
      const noImages = scorer.calculateCategoryScores(mockDetails);
      
      expect(withMultimedia.ai_optimization).toBeGreaterThan(noVideo.ai_optimization);
      expect(noVideo.ai_optimization).toBeGreaterThan(noImages.ai_optimization);
    });

    test('should score credibility signals', () => {
      const fullCredibility = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.credibility_signals.has_author_info = false;
      const noAuthor = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.credibility_signals.external_links_count = 0;
      const noExternalLinks = scorer.calculateCategoryScores(mockDetails);
      
      expect(fullCredibility.ai_optimization).toBeGreaterThan(noAuthor.ai_optimization);
      expect(noAuthor.ai_optimization).toBeGreaterThan(noExternalLinks.ai_optimization);
    });

    test('should score content format comprehensively', () => {
      const fullFormat = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.content_format.has_numbered_lists = false;
      mockDetails.ai_optimization.content_format.has_bullet_points = false;
      const noLists = scorer.calculateCategoryScores(mockDetails);
      
      mockDetails.ai_optimization.content_format.has_data_statistics = false;
      mockDetails.ai_optimization.content_format.has_source_citations = false;
      const minimal = scorer.calculateCategoryScores(mockDetails);
      
      expect(fullFormat.ai_optimization).toBeGreaterThan(noLists.ai_optimization);
      expect(noLists.ai_optimization).toBeGreaterThan(minimal.ai_optimization);
    });
  });

  describe('generateRecommendations', () => {
    test('should generate critical recommendations for missing HTTPS', () => {
      mockDetails.crawler_accessibility.https_enabled = false;
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const httpsRec = recommendations.find(r => r.title.includes('HTTPS'));
      expect(httpsRec).toBeDefined();
      expect(httpsRec?.priority).toBe('critical');
    });

    test('should generate recommendations for blocked AI crawlers', () => {
      mockDetails.crawler_accessibility.ai_crawlers_allowed.chatgpt = false;
      mockDetails.crawler_accessibility.ai_crawlers_allowed.claude = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const crawlerRec = recommendations.find(r => r.title.includes('AI Crawlers'));
      expect(crawlerRec).toBeDefined();
      expect(crawlerRec?.priority).toBe('critical');
      expect(crawlerRec?.description).toContain('chatgpt');
      expect(crawlerRec?.description).toContain('claude');
    });

    test('should generate recommendations for poor heading structure', () => {
      mockDetails.content_structure.heading_structure.proper_hierarchy = false;
      mockDetails.content_structure.heading_structure.h1_count = 3;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const headingRec = recommendations.find(r => r.category === 'content_structure' && r.title.includes('Heading'));
      expect(headingRec).toBeDefined();
      expect(headingRec?.priority).toBe('high');
    });

    test('should recommend FAQ section when missing', () => {
      mockDetails.content_structure.content_metrics.has_faq_section = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const faqRec = recommendations.find(r => r.title.includes('FAQ Section'));
      expect(faqRec).toBeDefined();
      expect(faqRec?.platform_benefits).toContain('ChatGPT');
    });

    test('should recommend schema markup when missing', () => {
      mockDetails.technical_seo.schema_markup.has_schema = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const schemaRec = recommendations.find(r => r.title.includes('Schema Markup'));
      expect(schemaRec).toBeDefined();
      expect(schemaRec?.code_example).toContain('application/ld+json');
    });

    test('should recommend FAQ schema for existing FAQ content', () => {
      mockDetails.technical_seo.schema_markup.has_faq_schema = false;
      mockDetails.content_structure.content_metrics.has_faq_section = true;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const faqSchemaRec = recommendations.find(r => r.title.includes('FAQ Schema'));
      expect(faqSchemaRec).toBeDefined();
    });

    test('should recommend meta description when missing', () => {
      mockDetails.technical_seo.meta_tags.description_present = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const metaRec = recommendations.find(r => r.title.includes('Meta Description'));
      expect(metaRec).toBeDefined();
      expect(metaRec?.priority).toBe('medium');
    });

    test('should recommend author info when missing', () => {
      mockDetails.ai_optimization.credibility_signals.has_author_info = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const authorRec = recommendations.find(r => r.title.includes('Author Information'));
      expect(authorRec).toBeDefined();
    });

    test('should recommend image alt text improvements', () => {
      mockDetails.technical_seo.performance.images_with_alt = 2; // Less than 80%
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      const altRec = recommendations.find(r => r.title.includes('Image Alt Text'));
      expect(altRec).toBeDefined();
      expect(altRec?.code_example).toContain('alt=');
    });

    test('should sort recommendations by priority and impact', () => {
      // Create conditions for multiple recommendations
      mockDetails.crawler_accessibility.https_enabled = false;
      mockDetails.technical_seo.schema_markup.has_schema = false;
      mockDetails.technical_seo.meta_tags.description_present = false;
      
      const scores = scorer.calculateCategoryScores(mockDetails);
      const recommendations = scorer.generateRecommendations(mockDetails, scores);
      
      // Check that critical recommendations come first
      const priorities = recommendations.map(r => r.priority);
      const criticalIndex = priorities.lastIndexOf('critical');
      const highIndex = priorities.indexOf('high');
      const mediumIndex = priorities.indexOf('medium');
      
      if (criticalIndex >= 0 && highIndex >= 0) {
        expect(criticalIndex).toBeLessThan(highIndex);
      }
      if (highIndex >= 0 && mediumIndex >= 0) {
        expect(highIndex).toBeLessThan(mediumIndex);
      }
    });
  });
});