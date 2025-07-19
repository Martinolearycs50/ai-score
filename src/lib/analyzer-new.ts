import axios from 'axios';
import * as cheerio from 'cheerio';
import { validateAndNormalizeUrl } from '@/utils/validators';
import { DEFAULT_HEADERS, TIMEOUTS } from '@/utils/constants';
import { score, type ScoringResult } from './scorer-new';
import type { PillarResults, WebsiteProfile, PageType } from './types';
import { ContentExtractor, type ExtractedContent } from './contentExtractor';

// Import audit modules
import * as retrieval from './audit/retrieval';
import * as factDensity from './audit/factDensity';
import * as structure from './audit/structure';
import * as trust from './audit/trust';
import * as recency from './audit/recency';

export interface DataSource {
  type: 'synthetic' | 'chrome-ux' | 'cloudflare-worker';
  metric: string;
  timestamp: number;
  success: boolean;
  details?: any;
}

export interface EnhancementData {
  enhanced: boolean;
  dataSource: string;
  cruxMetrics?: any;
  improvement?: number;
}

export interface AnalysisResultNew {
  url: string;
  aiSearchScore: number; // 0-100
  scoringResult: ScoringResult;
  timestamp: string;
  pageTitle?: string;
  pageDescription?: string;
  websiteProfile?: WebsiteProfile;
  extractedContent?: ExtractedContent;
  dataSources?: DataSource[];
  enhancementData?: EnhancementData;
  breakdown?: Record<string, any>;
}

export class AiSearchAnalyzer {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: TIMEOUTS.page_fetch,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });
  }

  async analyzeUrl(url: string): Promise<AnalysisResultNew> {
    console.log(`[AiSearchAnalyzer] Starting analysis for: ${url}`);
    
    // Validate and normalize URL
    const validation = validateAndNormalizeUrl(url);
    
    if (!validation.isValid) {
      throw new Error(`Invalid URL: ${validation.error}`);
    }

    const normalizedUrl = validation.normalizedUrl!;
    console.log(`[AiSearchAnalyzer] Using normalized URL: ${normalizedUrl}`);

    try {
      // Fetch page content
      const { data: html, headers } = await this.fetchPageContent(normalizedUrl);
      
      // Load HTML with Cheerio
      const $ = cheerio.load(html);
      
      // Extract comprehensive metadata for website profile
      // Clean up title text by removing common navigation patterns
      let pageTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      
      // Remove common navigation/UI text patterns from title
      pageTitle = pageTitle
        .replace(/\b(logo|icon|image|menu|nav|navigation|close|open|toggle)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const pageDescription = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '';
      
      // Extract content for dynamic recommendations
      let extractedContent;
      try {
        const contentExtractor = new ContentExtractor(html, normalizedUrl);
        extractedContent = contentExtractor.extract();
        console.log('[AiSearchAnalyzer] Content extracted successfully');
        console.log(`[AiSearchAnalyzer] Page type: ${extractedContent.pageType}, Primary topic: ${extractedContent.primaryTopic}`);
        console.log('[AiSearchAnalyzer] Detected page type:', extractedContent?.pageType);
        console.log('[AiSearchAnalyzer] Detected business type:', extractedContent?.businessType);
      } catch (error) {
        console.error('[AiSearchAnalyzer] Content extraction failed:', error);
        // Continue without extracted content - will use static recommendations
      }
      
      // Build website profile
      const websiteProfile = this.buildWebsiteProfile(normalizedUrl, $, pageTitle, pageDescription, extractedContent?.pageType || 'general');
      console.log('[AiSearchAnalyzer] Website profile built:', {
        domain: websiteProfile.domain,
        pageType: websiteProfile.pageType,
        contentType: websiteProfile.contentType,
        title: websiteProfile.title
      });

      // Track data sources
      const dataSources: DataSource[] = [];
      
      // Run all audit modules
      const pillarResults: PillarResults = {
        RETRIEVAL: await retrieval.run(html, normalizedUrl),
        FACT_DENSITY: await factDensity.run(html),
        STRUCTURE: await structure.run(html, normalizedUrl), // Pass URL for semantic URL check
        TRUST: await trust.run(html),
        RECENCY: await recency.run(html, headers),
      };
      
      // Check if CrUX data was used
      const capturedDomain = retrieval.capturedDomain;
      if (capturedDomain.cruxData?.hasData) {
        dataSources.push({
          type: 'chrome-ux',
          metric: 'ttfb',
          timestamp: Date.now(),
          success: true,
          details: {
            ttfb: capturedDomain.cruxData.ttfb,
            rating: capturedDomain.cruxData.ttfbRating
          }
        });
      } else {
        dataSources.push({
          type: 'synthetic',
          metric: 'ttfb',
          timestamp: Date.now(),
          success: true,
          details: {
            ttfb: capturedDomain.actualTtfb
          }
        });
      }

      // Calculate scores with extracted content
      const scoringResult = score(pillarResults, extractedContent);
      
      // Build breakdown for UI
      const breakdown = {
        RETRIEVAL: pillarResults.RETRIEVAL,
        FACT_DENSITY: pillarResults.FACT_DENSITY,
        STRUCTURE: pillarResults.STRUCTURE,
        TRUST: pillarResults.TRUST,
        RECENCY: pillarResults.RECENCY
      };

      return {
        url: normalizedUrl,
        aiSearchScore: scoringResult.total,
        scoringResult,
        timestamp: new Date().toISOString(),
        pageTitle,
        pageDescription,
        websiteProfile,
        extractedContent,
        dataSources,
        breakdown
      };
    } catch (error) {
      console.error('[AiSearchAnalyzer] Analysis failed:', error);
      throw error;
    }
  }

  private async fetchPageContent(url: string): Promise<{
    data: string;
    headers: Record<string, string>;
    status: number;
  }> {
    try {
      const response = await this.axiosInstance.get(url);
      
      // Convert headers to plain object
      const headers: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });

      return {
        data: response.data,
        headers,
        status: response.status,
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        throw new Error(`Server returned ${error.response.status}: ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Domain not found');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }

  private buildWebsiteProfile(url: string, $: cheerio.CheerioAPI, title: string, description: string, pageType: PageType): WebsiteProfile {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Detect language
    const language = $('html').attr('lang') || 
                    $('meta[property="og:locale"]').attr('content') || 
                    $('meta[name="language"]').attr('content') || 
                    'en';
    
    // Count words in main content
    const mainContent = $('main').text() || $('article').text() || $('body').text();
    const wordCount = mainContent.split(/\s+/).filter(word => word.length > 0).length;
    
    // Check for images
    const hasImages = $('img').length > 0;
    
    // Get OpenGraph image
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    
    // Detect content type based on various signals
    const contentType = this.detectContentType($, urlObj, title);
    
    // Extract primary topics (from headings and key content)
    const primaryTopics = this.extractPrimaryTopics($);
    
    return {
      domain,
      title: title || domain,
      description: description || `Analysis of ${domain}`,
      language: language.split('-')[0], // Just the language code, not locale
      contentType,
      primaryTopics,
      wordCount,
      hasImages,
      hasFavicon: this.checkFavicon($),
      ogImage,
      pageType,
    };
  }

  private detectContentType($: cheerio.CheerioAPI, urlObj: URL, title: string): WebsiteProfile['contentType'] {
    const path = urlObj.pathname.toLowerCase();
    const bodyText = $('body').text().toLowerCase();
    
    // E-commerce indicators
    if ($('.product, .price, .add-to-cart, .cart, .checkout').length > 0 ||
        bodyText.includes('add to cart') || bodyText.includes('buy now')) {
      return 'ecommerce';
    }
    
    // News indicators
    if ($('.article-date, .publish-date, .byline, .news-category').length > 0 ||
        path.includes('/news/') || path.includes('/article/') ||
        title.toLowerCase().includes('news')) {
      return 'news';
    }
    
    // Documentation indicators
    if ($('.docs, .documentation, .api-reference, .code-sample').length > 0 ||
        path.includes('/docs/') || path.includes('/documentation/') ||
        path.includes('/api/')) {
      return 'documentation';
    }
    
    // Blog indicators
    if ($('.blog-post, .post-date, .author-bio, .comments').length > 0 ||
        path.includes('/blog/') || path.includes('/post/')) {
      return 'blog';
    }
    
    // Corporate/business site
    if ($('.about-us, .services, .team, .contact-us').length > 0 ||
        bodyText.includes('about us') || bodyText.includes('our services')) {
      return 'corporate';
    }
    
    return 'other';
  }

  private extractPrimaryTopics($: cheerio.CheerioAPI): string[] {
    const topics = new Set<string>();
    
    // Extract from headings
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      // Extract key phrases (2-3 word combinations)
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.length >= 2) {
        topics.add(words.slice(0, 3).join(' '));
      }
    });
    
    // Extract from meta keywords if available
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      keywords.split(',').slice(0, 3).forEach(kw => topics.add(kw.trim()));
    }
    
    // Return top 5 topics
    return Array.from(topics).slice(0, 5);
  }

  private checkFavicon($: cheerio.CheerioAPI): boolean {
    return $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;
  }
}