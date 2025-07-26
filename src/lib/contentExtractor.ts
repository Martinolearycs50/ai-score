import * as cheerio from 'cheerio';

import { BusinessDetection } from './contentExtractor/businessDetection';
import { ContentParsing } from './contentExtractor/contentParsing';
import { FeatureDetection } from './contentExtractor/featureDetection';
import type { PageType } from './types';

export interface ExtractedContent {
  // Core content identification
  primaryTopic: string;
  detectedTopics: string[];
  businessType:
    | 'payment'
    | 'ecommerce'
    | 'blog'
    | 'news'
    | 'documentation'
    | 'corporate'
    | 'educational'
    | 'other';
  pageType: PageType;

  // Enhanced business attributes for personalization
  businessAttributes: {
    industry: string | null;
    targetAudience: string | null;
    mainProduct: string | null;
    mainService: string | null;
    uniqueValue: string | null;
    missionStatement: string | null;
    yearFounded: string | null;
    location: string | null;
    teamSize: string | null;
  };

  // Competitor intelligence
  competitorMentions: Array<{
    name: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;

  // Extracted content samples
  contentSamples: {
    title: string;
    metaDescription: string;
    headings: Array<{
      level: number;
      text: string;
      content?: string;
    }>;
    paragraphs: string[];
    lists: Array<{
      type: 'ul' | 'ol';
      items: string[];
    }>;
    statistics: string[];
    comparisons: string[];
  };

  // Content patterns detected
  detectedFeatures: {
    hasPaymentForms: boolean;
    hasProductListings: boolean;
    hasAPIDocumentation: boolean;
    hasPricingInfo: boolean;
    hasBlogPosts: boolean;
    hasTutorials: boolean;
    hasComparisons: boolean;
    hasQuestions: boolean;
  };

  // Key terms and phrases
  keyTerms: string[];
  productNames: string[];
  technicalTerms: string[];

  // Metadata
  metaDescription?: string;
  wordCount: number;
  language: string;
}

/**
 * Extracts comprehensive content information from HTML for generating
 * content-aware recommendations
 */
export class ContentExtractor {
  private $: cheerio.CheerioAPI;
  private contentText: string;
  private pageUrl?: string;
  private businessDetection: BusinessDetection;
  private contentParsing: ContentParsing;
  private featureDetection: FeatureDetection;

  constructor(html: string, pageUrl?: string) {
    try {
      this.$ = cheerio.load(html || '');
      this.pageUrl = pageUrl;

      // Extract text with proper spacing
      const mainContent = this.$('main, article, [role="main"], .content, #content');
      if (mainContent.length > 0) {
        this.contentText = this.extractTextWithSpacing(mainContent);
      } else {
        this.contentText = this.extractTextWithSpacing(this.$('body'));
      }

      // Limit content size to prevent memory issues
      if (this.contentText.length > 100000) {
        console.warn('[ContentExtractor] Content too large, truncating to 100KB');
        this.contentText = this.contentText.substring(0, 100000);
      }

      // Initialize helper modules
      this.businessDetection = new BusinessDetection(this.$, this.contentText);
      this.contentParsing = new ContentParsing(this.$, this.contentText);
      this.featureDetection = new FeatureDetection(this.$, this.contentText, pageUrl);
    } catch (error) {
      console.error('[ContentExtractor] Failed to initialize:', error);
      this.$ = cheerio.load('<html><body></body></html>');
      this.contentText = '';

      // Initialize modules with empty data
      this.businessDetection = new BusinessDetection(this.$, '');
      this.contentParsing = new ContentParsing(this.$, '');
      this.featureDetection = new FeatureDetection(this.$, '', pageUrl);
    }
  }

  /**
   * Extract text from elements with proper spacing
   */
  private extractTextWithSpacing(elements: cheerio.Cheerio<any>): string {
    const textParts: string[] = [];

    // Define elements and text patterns to skip
    const skipPatterns = [
      /^(logo|icon|image|img|svg|close|open|toggle|menu|nav|navigation)$/i,
      /^(button|btn|link|click here|tap here|swipe)$/i,
      /^(loading|spinner|loader|processing)$/i,
      /^[<>×✕✖✗]$/, // Close button symbols
      /^(show|hide|expand|collapse|more|less)$/i,
    ];

    // Skip common navigation class/id patterns
    const skipSelectors = [
      '.nav',
      '.navigation',
      '.menu',
      '.header',
      '.footer',
      '[class*="logo"]',
      '[class*="icon"]',
      '[class*="button"]',
      '[id*="logo"]',
      '[id*="icon"]',
      '[id*="button"]',
      '.mobile-nav',
      '.mobile-menu',
      '#mobile-nav',
      '#mobile-menu',
      '[aria-label*="navigation"]',
      '[role="navigation"]',
      'button',
      'nav',
      'header',
      'footer',
    ];

    // Remove elements we want to skip
    try {
      const skipElements = elements.find(skipSelectors.join(', '));
      if (skipElements && skipElements.length > 0) {
        skipElements.remove();
      }
    } catch (e) {
      // Ignore errors when removing skip elements
    }

    // Process text nodes with proper spacing
    const processNode = (node: any) => {
      if (node.type === 'text') {
        const text = node.data.trim();
        if (text && text.length > 1) {
          // Check if text matches skip patterns
          const shouldSkip = skipPatterns.some((pattern) => pattern.test(text));
          if (!shouldSkip) {
            textParts.push(text);
          }
        }
      } else if (node.children) {
        // For block-level elements, add spacing
        const blockElements = [
          'p',
          'div',
          'section',
          'article',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'li',
          'td',
          'th',
          'blockquote',
          'pre',
        ];

        node.children.forEach((child: any) => {
          processNode(child);
          // Add space after block elements
          if (child.type === 'tag' && blockElements.includes(child.name)) {
            textParts.push(' ');
          }
        });
      }
    };

    elements.each((_, el) => {
      processNode(el);
    });

    // Join with spaces and clean up excessive whitespace
    return textParts
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();
  }

  /**
   * Extract all content information from the page
   */
  extract(): ExtractedContent {
    try {
      // Check if this is an error page first
      if (this.featureDetection.isErrorPage()) {
        console.log('[ContentExtractor] Error page detected, returning minimal content');
        return {
          primaryTopic: 'Error Page',
          detectedTopics: ['error'],
          businessType: 'other',
          pageType: 'general',
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
          competitorMentions: [],
          contentSamples: {
            title: this.contentParsing.extractTitle() || 'Error',
            metaDescription: this.contentParsing.extractMetaDescription() || '',
            headings: [],
            paragraphs: ['This page appears to be blocked or returning an error.'],
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
          metaDescription: '',
          wordCount: 0,
          language: 'en',
        };
      }

      const title = this.contentParsing.extractTitle();
      const headings = this.contentParsing.extractHeadings();
      const topics = this.contentParsing.detectTopics(title, headings);
      const businessType = this.businessDetection.detectBusinessType(topics);
      const pageType = this.featureDetection.detectPageType();
      const productNames = this.businessDetection.extractProductNames();

      // Update business attributes with product names
      const businessAttributes = this.businessDetection.extractBusinessAttributes();
      if (!businessAttributes.mainProduct && productNames.length > 0) {
        businessAttributes.mainProduct = productNames[0];
      }

      return {
        primaryTopic: topics.primary,
        detectedTopics: topics.all,
        businessType,
        pageType,
        businessAttributes,
        competitorMentions: this.businessDetection.extractCompetitorMentions(),
        contentSamples: {
          title,
          metaDescription: this.contentParsing.extractMetaDescription(),
          headings,
          paragraphs: this.contentParsing.extractParagraphs(),
          lists: this.contentParsing.extractLists(),
          statistics: this.contentParsing.extractStatistics(),
          comparisons: this.contentParsing.extractComparisons(),
        },
        detectedFeatures: this.featureDetection.detectFeatures(),
        keyTerms: this.contentParsing.extractKeyTerms(),
        productNames,
        technicalTerms: this.contentParsing.extractTechnicalTerms(),
        metaDescription: this.contentParsing.extractMetaDescription(),
        wordCount: this.contentText.split(/\s+/).filter((w) => w.length > 0).length,
        language: this.$('html').attr('lang')?.split('-')[0] || 'en',
      };
    } catch (error) {
      console.error('[ContentExtractor] Extract failed, returning defaults:', error);
      return this.getDefaultExtractedContent();
    }
  }

  private getDefaultExtractedContent(): ExtractedContent {
    return {
      primaryTopic: 'general content',
      detectedTopics: [],
      businessType: 'other',
      pageType: 'general',
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
      competitorMentions: [],
      contentSamples: {
        title: '',
        metaDescription: '',
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
      metaDescription: '',
      wordCount: 0,
      language: 'en',
    };
  }
}

// Add default export for better Next.js compatibility
export default ContentExtractor;
