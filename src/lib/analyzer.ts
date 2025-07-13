import axios from 'axios';
import * as cheerio from 'cheerio';
import type {
  AnalysisResult,
  AnalysisDetails,
  CrawlerAccessibilityDetails,
  ContentStructureDetails,
  TechnicalSeoDetails,
  AiOptimizationDetails,
  PageMetadata
} from './types';
import {
  validateAndNormalizeUrl,
  parseRobotsTxt,
  detectFaqContent,
  validateSchemaMarkup,
  calculateReadingLevel
} from '@/utils/validators';
import {
  DEFAULT_HEADERS,
  TIMEOUTS,
  AI_CRAWLERS,
  VALUABLE_SCHEMA_TYPES,
  AI_FRIENDLY_PATTERNS,
  FRESHNESS_INDICATORS
} from '@/utils/constants';
import { AnalysisScorer } from './scorer';

export class WebsiteAnalyzer {
  private axiosInstance;
  private scorer: AnalysisScorer;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: TIMEOUTS.page_fetch,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });
    this.scorer = new AnalysisScorer();
  }

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    console.log(`[Analyzer] Starting analysis for: ${url}`);
    console.log(`[Analyzer] URL type: ${typeof url}`);
    console.log(`[Analyzer] URL length: ${url?.length}`);
    
    // Validate and normalize URL
    const validation = validateAndNormalizeUrl(url);
    console.log(`[Analyzer] Validation result:`, validation);
    
    if (!validation.isValid) {
      console.error(`[Analyzer] Validation failed:`, validation.error);
      throw new Error(`Invalid URL: ${validation.error}`);
    }

    const normalizedUrl = validation.normalizedUrl!;
    console.log(`[Analyzer] Using normalized URL: ${normalizedUrl}`);
    const startTime = Date.now();

    try {
      // Fetch page content and robots.txt in parallel
      const [pageResponse, robotsResponse] = await Promise.allSettled([
        this.fetchPageContent(normalizedUrl),
        this.fetchRobotsTxt(normalizedUrl)
      ]);

      // Handle page fetch result
      if (pageResponse.status === 'rejected') {
        throw new Error(`Failed to fetch page: ${pageResponse.reason.message}`);
      }

      const { data: html, response } = pageResponse.value;
      const $ = cheerio.load(html);

      // Get robots.txt content
      const robotsContent = robotsResponse.status === 'fulfilled' 
        ? robotsResponse.value 
        : '';

      // Parse page metadata
      const pageMetadata = this.extractPageMetadata($, response, normalizedUrl);

      // Perform detailed analysis
      const analysisDetails: AnalysisDetails = {
        crawler_accessibility: await this.analyzeCrawlerAccessibility(
          normalizedUrl, 
          robotsContent, 
          response
        ),
        content_structure: this.analyzeContentStructure($),
        technical_seo: this.analyzeTechnicalSeo($),
        ai_optimization: this.analyzeAiOptimization($, response, normalizedUrl),
        page_metadata: pageMetadata
      };

      // Calculate scores using the scorer
      const categoryScores = this.scorer.calculateCategoryScores(analysisDetails);
      const overallScore = Math.round(
        categoryScores.crawler_accessibility + 
        categoryScores.content_structure + 
        categoryScores.technical_seo + 
        categoryScores.ai_optimization
      );

      // Generate recommendations
      const recommendations = this.scorer.generateRecommendations(analysisDetails, categoryScores);

      const result: AnalysisResult = {
        url: normalizedUrl,
        overall_score: overallScore,
        category_scores: categoryScores,
        recommendations,
        analysis_details: analysisDetails,
        timestamp: new Date().toISOString()
      };

      console.log(`Analysis completed in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Analysis failed');
    }
  }

  private async fetchPageContent(url: string): Promise<{ data: string; response: any }> {
    console.log(`[Analyzer] Fetching page content from: ${url}`);
    console.log(`[Analyzer] URL for axios:`, JSON.stringify(url));
    
    // Ensure URL is clean
    const cleanUrl = String(url).trim();
    
    try {
      const response = await this.axiosInstance.get(cleanUrl);
      
      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Invalid page content received');
      }

      return { data: response.data, response };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - page took too long to load');
        }
        if (error.response?.status === 404) {
          throw new Error('Page not found (404)');
        }
        if (error.response?.status === 403) {
          throw new Error('Access forbidden (403)');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error - please try again later');
        }
      }
      throw error;
    }
  }

  private async fetchRobotsTxt(url: string): Promise<string> {
    try {
      console.log(`[Analyzer] Creating robots.txt URL from base: ${url}`);
      let robotsUrl: string;
      
      try {
        robotsUrl = new URL('/robots.txt', url).toString();
      } catch (urlError) {
        console.error('[Analyzer] Failed to create robots.txt URL:', urlError);
        // Fallback: manually construct the robots.txt URL
        const baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
        robotsUrl = `${baseUrl}/robots.txt`;
      }
      
      console.log(`[Analyzer] Fetching robots.txt from: ${robotsUrl}`);
      const response = await this.axiosInstance.get(robotsUrl, {
        timeout: TIMEOUTS.robots_fetch
      });
      
      return response.status === 200 ? response.data : '';
    } catch (error) {
      console.log('[Analyzer] Robots.txt fetch failed (optional):', error instanceof Error ? error.message : 'Unknown error');
      // Robots.txt is optional, so we don't throw on failure
      return '';
    }
  }

  private extractPageMetadata($: cheerio.CheerioAPI, response: any, url: string): PageMetadata {
    const title = $('title').text().trim() || '';
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
    const language = $('html').attr('lang') || $('meta[http-equiv="content-language"]').attr('content') || null;
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="content-type"]').attr('content')?.match(/charset=([^;]+)/)?.[1] || null;

    return {
      title,
      url,
      canonical_url: canonicalUrl,
      language,
      charset,
      status_code: response.status,
      final_url: response.request?.responseURL || url
    };
  }

  private async analyzeCrawlerAccessibility(
    url: string, 
    robotsContent: string, 
    response: any
  ): Promise<CrawlerAccessibilityDetails> {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (urlError) {
      console.error('[Analyzer] Failed to parse URL in analyzeCrawlerAccessibility:', urlError);
      // Create a minimal URL object for fallback
      const match = url.match(/^(https?):\/\/([^\/]+)/);
      urlObj = {
        protocol: match ? match[1] + ':' : 'https:',
        hostname: match ? match[2] : 'unknown'
      };
    }
    
    // Parse robots.txt for AI crawler permissions
    const aiCrawlersAllowed = robotsContent 
      ? parseRobotsTxt(robotsContent)
      : { chatgpt: true, claude: true, perplexity: true, gemini: true };

    return {
      https_enabled: urlObj.protocol === 'https:',
      robots_txt_found: robotsContent.length > 0,
      ai_crawlers_allowed: aiCrawlersAllowed,
      mobile_friendly: this.checkMobileFriendly(response),
      page_accessible: response.status === 200,
      response_time_ms: response.config?.metadata?.endTime - response.config?.metadata?.startTime || 0
    };
  }

  private checkMobileFriendly(response: any): boolean {
    // This is a simplified check - in production you'd want more sophisticated mobile testing
    const contentType = response.headers['content-type'] || '';
    return contentType.includes('text/html');
  }

  private analyzeContentStructure($: cheerio.CheerioAPI): ContentStructureDetails {
    // Analyze heading structure
    const headingStructure = {
      h1_count: $('h1').length,
      h2_count: $('h2').length,
      h3_count: $('h3').length,
      h4_count: $('h4').length,
      h5_count: $('h5').length,
      h6_count: $('h6').length,
      proper_hierarchy: this.checkHeadingHierarchy($)
    };

    // Analyze content metrics
    const bodyText = $('body').text();
    const paragraphs = $('p');
    const lists = $('ul, ol');
    
    const contentMetrics = {
      word_count: bodyText.split(/\s+/).filter(word => word.length > 0).length,
      paragraph_count: paragraphs.length,
      list_count: lists.length,
      has_faq_section: detectFaqContent(bodyText),
      has_table_content: $('table').length > 0
    };

    // Calculate readability
    const readability = calculateReadingLevel(bodyText);

    return {
      heading_structure: headingStructure,
      content_metrics: contentMetrics,
      readability: {
        avg_sentence_length: readability.avgSentenceLength,
        reading_level: readability.level
      }
    };
  }

  private checkHeadingHierarchy($: cheerio.CheerioAPI): boolean {
    const headings = $('h1, h2, h3, h4, h5, h6').toArray();
    let currentLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel === 0) {
        // First heading should be H1
        if (level !== 1) return false;
      } else {
        // Subsequent headings should not skip levels
        if (level > currentLevel + 1) return false;
      }
      
      currentLevel = level;
    }

    return true;
  }

  private analyzeTechnicalSeo($: cheerio.CheerioAPI): TechnicalSeoDetails {
    // Analyze meta tags
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const viewport = $('meta[name="viewport"]').attr('content') || '';

    const metaTags = {
      title_present: title.length > 0,
      title_length: title.length,
      description_present: description.length > 0,
      description_length: description.length,
      viewport_present: viewport.length > 0
    };

    // Analyze schema markup
    const schemaScripts = $('script[type="application/ld+json"]');
    let schemaMarkup = {
      has_schema: false,
      schema_types: [] as string[],
      has_faq_schema: false,
      has_article_schema: false,
      has_organization_schema: false
    };

    schemaScripts.each((_, element) => {
      const schemaContent = $(element).html();
      if (schemaContent) {
        const validation = validateSchemaMarkup(schemaContent);
        if (validation.isValid) {
          schemaMarkup.has_schema = true;
          schemaMarkup.schema_types.push(...validation.types);
          if (validation.hasFaqSchema) schemaMarkup.has_faq_schema = true;
          if (validation.hasArticleSchema) schemaMarkup.has_article_schema = true;
          if (validation.hasOrganizationSchema) schemaMarkup.has_organization_schema = true;
        }
      }
    });

    // Analyze Open Graph tags
    const openGraph = {
      has_og_tags: $('meta[property^="og:"]').length > 0,
      og_title: $('meta[property="og:title"]').length > 0,
      og_description: $('meta[property="og:description"]').length > 0,
      og_image: $('meta[property="og:image"]').length > 0
    };

    // Analyze performance indicators
    const images = $('img');
    const imagesWithAlt = images.filter((_, img) => Boolean($(img).attr('alt'))).length;

    const performance = {
      page_size_kb: 0, // Would need actual page size calculation
      external_resources: $('link[href^="http"], script[src^="http"]').length,
      image_count: images.length,
      images_with_alt: imagesWithAlt
    };

    return {
      meta_tags: metaTags,
      schema_markup: schemaMarkup,
      open_graph: openGraph,
      performance: performance
    };
  }

  private analyzeAiOptimization($: cheerio.CheerioAPI, response: any, url: string): AiOptimizationDetails {
    // Analyze content freshness
    const lastModified = response.headers['last-modified'] || null;
    const bodyText = $('body').text();
    
    const contentFreshness = {
      last_modified: lastModified,
      has_date_indicators: /\b(20\d{2}|updated|published|modified)\b/i.test(bodyText),
      estimated_freshness_score: this.calculateFreshnessScore(lastModified, bodyText)
    };

    // Analyze multimedia
    const images = $('img');
    const videos = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    const descriptiveAltImages = images.filter((_, img) => {
      const alt = $(img).attr('alt') || '';
      return alt.length > 10; // Minimum length for descriptive alt text
    });

    const multimediaIntegration = {
      image_count: images.length,
      video_count: videos.length,
      images_with_descriptive_alt: descriptiveAltImages.length
    };

    // Analyze credibility signals
    const credibilitySignals = {
      has_author_info: /author|by\s+\w+/i.test(bodyText) || $('[class*="author"], [id*="author"]').length > 0,
      has_contact_info: /contact|email|phone/i.test(bodyText) || $('a[href^="mailto:"], a[href^="tel:"]').length > 0,
      has_about_page_link: $('a[href*="about"]').length > 0,
      external_links_count: (() => {
        try {
          const hostname = new URL(response.request?.responseURL || url).hostname;
          return $('a[href^="http"]:not([href*="' + hostname + '"])').length;
        } catch {
          return $('a[href^="http"]').length; // Fallback: count all external links
        }
      })(),
      internal_links_count: (() => {
        try {
          const hostname = new URL(response.request?.responseURL || url).hostname;
          return $('a[href^="/"], a[href*="' + hostname + '"]').length;
        } catch {
          return $('a[href^="/"]').length; // Fallback: count only relative links
        }
      })()
    };

    // Analyze content format
    const contentFormat = {
      has_comparison_content: AI_FRIENDLY_PATTERNS.comparison.some(pattern => pattern.test(bodyText)),
      has_numbered_lists: $('ol').length > 0,
      has_bullet_points: $('ul').length > 0,
      has_data_statistics: AI_FRIENDLY_PATTERNS.data.some(pattern => pattern.test(bodyText)),
      has_source_citations: $('cite, blockquote, a[href*="doi.org"], a[href*="pubmed"]').length > 0
    };

    return {
      content_freshness: contentFreshness,
      multimedia_integration: multimediaIntegration,
      credibility_signals: credibilitySignals,
      content_format: contentFormat
    };
  }

  private calculateFreshnessScore(lastModified: string | null, content: string): number {
    let score = 50; // Base score

    if (lastModified) {
      const modifiedDate = new Date(lastModified);
      const daysSinceModified = (Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceModified < 30) score += 30;
      else if (daysSinceModified < 90) score += 20;
      else if (daysSinceModified < 365) score += 10;
    }

    // Check for date indicators in content
    if (/\b20(2[0-9]|1[0-9])\b/.test(content)) score += 20;

    return Math.min(100, score);
  }

}