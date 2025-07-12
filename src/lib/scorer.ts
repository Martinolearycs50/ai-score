import type {
  AnalysisDetails,
  CategoryScores,
  Recommendation,
  CrawlerAccessibilityDetails,
  ContentStructureDetails,
  TechnicalSeoDetails,
  AiOptimizationDetails
} from './types';
import {
  SCORE_WEIGHTS,
  THRESHOLDS,
  RECOMMENDATION_TEMPLATES
} from '@/utils/constants';

export class AnalysisScorer {
  
  calculateCategoryScores(details: AnalysisDetails): CategoryScores {
    return {
      crawler_accessibility: this.scoreCrawlerAccessibility(details.crawler_accessibility),
      content_structure: this.scoreContentStructure(details.content_structure),
      technical_seo: this.scoreTechnicalSeo(details.technical_seo),
      ai_optimization: this.scoreAiOptimization(details.ai_optimization)
    };
  }

  private scoreCrawlerAccessibility(details: CrawlerAccessibilityDetails): number {
    let score = 0;
    const weights = SCORE_WEIGHTS.crawler_accessibility;

    // HTTPS enabled (5 points)
    if (details.https_enabled) {
      score += weights.https_enabled;
    }

    // Robots.txt accessible (3 points)
    if (details.robots_txt_found) {
      score += weights.robots_txt_accessible;
    }

    // AI crawlers allowed (8 points) - this is critical
    const allowedCount = Object.values(details.ai_crawlers_allowed).filter(Boolean).length;
    const allowedRatio = allowedCount / 4; // 4 AI platforms
    score += weights.ai_crawlers_allowed * allowedRatio;

    // Mobile friendly (5 points)
    if (details.mobile_friendly) {
      score += weights.mobile_friendly;
    }

    // Page accessible (4 points)
    if (details.page_accessible) {
      score += weights.page_accessible;
    }

    return Math.round(score);
  }

  private scoreContentStructure(details: ContentStructureDetails): number {
    let score = 0;
    const weights = SCORE_WEIGHTS.content_structure;

    // Proper heading hierarchy (6 points)
    if (details.heading_structure.proper_hierarchy && details.heading_structure.h1_count === 1) {
      score += weights.proper_heading_hierarchy;
    } else if (details.heading_structure.h1_count > 0) {
      score += weights.proper_heading_hierarchy * 0.5; // Partial credit
    }

    // Sufficient content length (5 points)
    const wordCount = details.content_metrics.word_count;
    if (wordCount >= THRESHOLDS.content.ideal_word_count) {
      score += weights.sufficient_content_length;
    } else if (wordCount >= THRESHOLDS.content.min_word_count) {
      const ratio = wordCount / THRESHOLDS.content.ideal_word_count;
      score += weights.sufficient_content_length * ratio;
    }

    // Has lists (4 points)
    if (details.content_metrics.list_count > 0) {
      score += weights.has_lists;
    }

    // Has FAQ section (6 points) - this is valuable for AI
    if (details.content_metrics.has_faq_section) {
      score += weights.has_faq;
    }

    // Readability (4 points)
    const avgSentenceLength = details.readability.avg_sentence_length;
    if (avgSentenceLength <= THRESHOLDS.readability.max_avg_sentence_length) {
      score += weights.readability;
    } else {
      // Reduce score based on how much it exceeds the threshold
      const penalty = Math.min(0.8, (avgSentenceLength - THRESHOLDS.readability.max_avg_sentence_length) / 10);
      score += weights.readability * (1 - penalty);
    }

    return Math.round(score);
  }

  private scoreTechnicalSeo(details: TechnicalSeoDetails): number {
    let score = 0;
    const weights = SCORE_WEIGHTS.technical_seo;

    // Meta tags complete (5 points)
    let metaScore = 0;
    if (details.meta_tags.title_present && 
        details.meta_tags.title_length >= THRESHOLDS.content.min_title_length &&
        details.meta_tags.title_length <= THRESHOLDS.content.max_title_length) {
      metaScore += 0.4; // 40% of meta score for good title
    } else if (details.meta_tags.title_present) {
      metaScore += 0.2; // 20% for having a title, even if not optimal
    }

    if (details.meta_tags.description_present &&
        details.meta_tags.description_length >= THRESHOLDS.content.min_description_length &&
        details.meta_tags.description_length <= THRESHOLDS.content.max_description_length) {
      metaScore += 0.4; // 40% for good description
    } else if (details.meta_tags.description_present) {
      metaScore += 0.2; // 20% for having a description
    }

    if (details.meta_tags.viewport_present) {
      metaScore += 0.2; // 20% for viewport meta tag
    }

    score += weights.meta_tags_complete * metaScore;

    // Schema markup (8 points) - critical for AI understanding
    if (details.schema_markup.has_schema) {
      let schemaScore = 0.5; // Base score for having any schema

      if (details.schema_markup.has_faq_schema) schemaScore += 0.3; // FAQ schema is highly valuable
      if (details.schema_markup.has_article_schema) schemaScore += 0.15;
      if (details.schema_markup.has_organization_schema) schemaScore += 0.05;

      score += weights.schema_markup * Math.min(1, schemaScore);
    }

    // Open Graph (3 points)
    if (details.open_graph.has_og_tags) {
      const ogCompleteness = [
        details.open_graph.og_title,
        details.open_graph.og_description,
        details.open_graph.og_image
      ].filter(Boolean).length / 3;
      
      score += weights.open_graph * ogCompleteness;
    }

    // Image optimization (4 points)
    if (details.performance.image_count > 0) {
      const altTextRatio = details.performance.images_with_alt / details.performance.image_count;
      score += weights.image_optimization * altTextRatio;
    } else {
      score += weights.image_optimization * 0.5; // Partial credit if no images
    }

    // Performance (5 points)
    let performanceScore = 1;
    if (details.performance.external_resources > THRESHOLDS.performance.max_external_resources) {
      performanceScore *= 0.7; // Penalty for too many external resources
    }
    score += weights.performance * performanceScore;

    return Math.round(score);
  }

  private scoreAiOptimization(details: AiOptimizationDetails): number {
    let score = 0;
    const weights = SCORE_WEIGHTS.ai_optimization;

    // Content freshness (6 points)
    const freshnessScore = details.content_freshness.estimated_freshness_score / 100;
    score += weights.content_freshness * freshnessScore;

    // Multimedia integration (4 points)
    let multimediaScore = 0;
    if (details.multimedia_integration.image_count > 0) {
      multimediaScore += 0.5;
      
      // Bonus for descriptive alt text
      const descriptiveRatio = details.multimedia_integration.images_with_descriptive_alt / 
                              details.multimedia_integration.image_count;
      multimediaScore += 0.3 * descriptiveRatio;
    }
    
    if (details.multimedia_integration.video_count > 0) {
      multimediaScore += 0.2;
    }
    
    score += weights.multimedia_integration * Math.min(1, multimediaScore);

    // Credibility signals (8 points) - very important for AI trust
    let credibilityScore = 0;
    if (details.credibility_signals.has_author_info) credibilityScore += 0.3;
    if (details.credibility_signals.has_contact_info) credibilityScore += 0.2;
    if (details.credibility_signals.has_about_page_link) credibilityScore += 0.1;
    
    // External links (citations and references)
    if (details.credibility_signals.external_links_count > 0) {
      credibilityScore += 0.2;
    }
    
    // Internal linking structure
    if (details.credibility_signals.internal_links_count > 2) {
      credibilityScore += 0.2;
    }
    
    score += weights.credibility_signals * Math.min(1, credibilityScore);

    // Content format (7 points) - how AI-friendly is the content structure
    let formatScore = 0;
    if (details.content_format.has_numbered_lists) formatScore += 0.2;
    if (details.content_format.has_bullet_points) formatScore += 0.2;
    if (details.content_format.has_comparison_content) formatScore += 0.2;
    if (details.content_format.has_data_statistics) formatScore += 0.2;
    if (details.content_format.has_source_citations) formatScore += 0.2;
    
    score += weights.content_format * Math.min(1, formatScore);

    return Math.round(score);
  }

  generateRecommendations(details: AnalysisDetails, categoryScores: CategoryScores): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let recommendationId = 1;

    // Crawler Accessibility Recommendations
    if (!details.crawler_accessibility.https_enabled) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'crawler_accessibility',
        priority: 'critical',
        title: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.title,
        description: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.description,
        impact_score: 5,
        difficulty: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.difficulty,
        estimated_time: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.estimated_time,
        platform_benefits: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.platform_benefits,
        code_example: RECOMMENDATION_TEMPLATES.ENABLE_HTTPS.code_example
      });
    }

    // Check if any AI crawlers are blocked
    const blockedCrawlers = Object.entries(details.crawler_accessibility.ai_crawlers_allowed)
      .filter(([_, allowed]) => !allowed)
      .map(([platform, _]) => platform);
    
    if (blockedCrawlers.length > 0) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'crawler_accessibility',
        priority: 'critical',
        title: 'Allow AI Crawlers in robots.txt',
        description: `Your robots.txt is blocking AI crawlers for: ${blockedCrawlers.join(', ')}. This prevents these platforms from indexing your content.`,
        impact_score: 8,
        difficulty: 'easy',
        estimated_time: '5-10 minutes',
        platform_benefits: blockedCrawlers.map(platform => 
          platform.charAt(0).toUpperCase() + platform.slice(1)
        ),
        code_example: `# Allow AI crawlers in robots.txt
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot  
Allow: /

User-agent: PerplexityBot
Allow: /`
      });
    }

    // Content Structure Recommendations
    if (!details.content_structure.heading_structure.proper_hierarchy || 
        details.content_structure.heading_structure.h1_count !== 1) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'content_structure',
        priority: 'high',
        title: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.title,
        description: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.description,
        impact_score: 6,
        difficulty: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.difficulty,
        estimated_time: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.estimated_time,
        platform_benefits: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.platform_benefits,
        code_example: RECOMMENDATION_TEMPLATES.IMPROVE_HEADINGS.code_example
      });
    }

    if (!details.content_structure.content_metrics.has_faq_section) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'content_structure',
        priority: 'high',
        title: 'Add FAQ Section',
        description: 'FAQ sections are ideal for AI platforms as they provide clear question-answer pairs that match user queries.',
        impact_score: 6,
        difficulty: 'medium',
        estimated_time: '30-60 minutes',
        platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini']
      });
    }

    // Technical SEO Recommendations
    if (!details.technical_seo.schema_markup.has_schema) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'technical_seo',
        priority: 'high',
        title: 'Add Schema Markup',
        description: 'Schema markup helps AI platforms understand your content structure and context.',
        impact_score: 8,
        difficulty: 'medium',
        estimated_time: '45-90 minutes',
        platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
        code_example: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-01"
}
</script>`
      });
    }

    if (!details.technical_seo.schema_markup.has_faq_schema && 
        details.content_structure.content_metrics.has_faq_section) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'technical_seo',
        priority: 'high',
        title: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.title,
        description: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.description,
        impact_score: 8,
        difficulty: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.difficulty,
        estimated_time: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.estimated_time,
        platform_benefits: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.platform_benefits,
        code_example: RECOMMENDATION_TEMPLATES.ADD_FAQ_SCHEMA.code_example
      });
    }

    // Meta tag recommendations
    if (!details.technical_seo.meta_tags.description_present) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'technical_seo',
        priority: 'medium',
        title: 'Add Meta Description',
        description: 'Meta descriptions help AI platforms understand your page content and improve click-through rates.',
        impact_score: 3,
        difficulty: 'easy',
        estimated_time: '10-15 minutes',
        platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
        code_example: `<meta name="description" content="Compelling description of your page content (120-160 characters)">`
      });
    }

    // AI Optimization Recommendations
    if (!details.ai_optimization.credibility_signals.has_author_info) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'ai_optimization',
        priority: 'medium',
        title: 'Add Author Information',
        description: 'Author information increases content credibility and trustworthiness for AI platforms.',
        impact_score: 4,
        difficulty: 'easy',
        estimated_time: '15-30 minutes',
        platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini']
      });
    }

    // Image optimization
    if (details.technical_seo.performance.image_count > 0 && 
        details.technical_seo.performance.images_with_alt / details.technical_seo.performance.image_count < 0.8) {
      recommendations.push({
        id: `rec-${recommendationId++}`,
        category: 'ai_optimization',
        priority: 'medium',
        title: 'Improve Image Alt Text',
        description: 'Descriptive alt text helps AI platforms understand your images and improves accessibility.',
        impact_score: 3,
        difficulty: 'easy',
        estimated_time: '20-40 minutes',
        platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'],
        code_example: `<!-- Good alt text example -->
<img src="chart.png" alt="Bar chart showing 25% increase in mobile traffic from 2023 to 2024">`
      });
    }

    // Sort recommendations by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact_score - a.impact_score; // Higher impact first
    });
  }
}