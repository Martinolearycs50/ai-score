import * as cheerio from 'cheerio';

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
    } catch (error) {
      console.error('[ContentExtractor] Failed to initialize:', error);
      this.$ = cheerio.load('<html><body></body></html>');
      this.contentText = '';
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
   * Detect if the page is an error or blocked page
   */
  private isErrorPage(): boolean {
    const errorIndicators = [
      // Common error messages
      'suite of APIs powering online payment processing',
      'Accept payments and scale faster',
      'error',
      '404',
      '403',
      '500',
      '502',
      '503',
      'page not found',
      'access denied',
      'forbidden',
      'blocked',
      'rate limit',
      'too many requests',
      // Bot detection messages
      'captcha',
      'verify you are human',
      'robot check',
      'cloudflare',
      'security check',
      // Empty content indicators
      'javascript is required',
      'enable javascript',
      'browser not supported',
    ];

    const lowerContent = this.contentText.toLowerCase();
    const lowerTitle = this.extractTitle().toLowerCase();

    // Check for error indicators in content
    for (const indicator of errorIndicators) {
      if (lowerContent.includes(indicator) || lowerTitle.includes(indicator)) {
        // Additional check: if the page has very little content and contains error words
        if (this.contentText.length < 500 || this.$('main, article').text().length < 100) {
          console.log(`[ContentExtractor] Detected error/blocked page: contains "${indicator}"`);
          return true;
        }
      }
    }

    // Check for Stripe-specific API description page
    if (
      lowerContent.includes('stripe is a suite of apis') &&
      lowerContent.includes('powering online payment') &&
      this.$('body').text().length < 1000
    ) {
      console.log('[ContentExtractor] Detected Stripe API error page');
      return true;
    }

    return false;
  }

  /**
   * Extract all content information from the page
   */
  extract(): ExtractedContent {
    try {
      // Check if this is an error page first
      if (this.isErrorPage()) {
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
            title: this.extractTitle() || 'Error',
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
          wordCount: 0,
          language: 'en',
        };
      }

      const title = this.extractTitle();
      const headings = this.extractHeadings();
      const topics = this.detectTopics(title, headings);
      const businessType = this.detectBusinessType(topics);
      const pageType = this.detectPageType();

      return {
        primaryTopic: topics.primary,
        detectedTopics: topics.all,
        businessType,
        pageType,
        businessAttributes: this.extractBusinessAttributes(),
        competitorMentions: this.extractCompetitorMentions(),
        contentSamples: {
          title,
          headings,
          paragraphs: this.extractParagraphs(),
          lists: this.extractLists(),
          statistics: this.extractStatistics(),
          comparisons: this.extractComparisons(),
        },
        detectedFeatures: this.detectFeatures(),
        keyTerms: this.extractKeyTerms(),
        productNames: this.extractProductNames(),
        technicalTerms: this.extractTechnicalTerms(),
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
      wordCount: 0,
      language: 'en',
    };
  }

  private extractTitle(): string {
    try {
      let title =
        this.$('title').text() ||
        this.$('meta[property="og:title"]').attr('content') ||
        this.$('h1').first().text() ||
        '';

      // Clean up title by removing common UI/navigation text patterns
      // Look for the actual title part (usually before the first occurrence of these patterns)
      const uiPatterns = [
        'logo',
        'icon',
        'navigation',
        'menu',
        'close',
        'open',
        'toggle',
        'button',
        'click',
        'tap',
        'swipe',
      ];

      // Find the first occurrence of any UI pattern
      let cutoffIndex = title.length;
      for (const pattern of uiPatterns) {
        const index = title.toLowerCase().indexOf(pattern);
        if (index > 0 && index < cutoffIndex) {
          cutoffIndex = index;
        }
      }

      // If we found UI patterns, truncate before them
      if (cutoffIndex < title.length) {
        title = title.substring(0, cutoffIndex).trim();
      }

      // Also handle common title separators
      const separators = ['|', '-', '–', '—', '::'];
      for (const sep of separators) {
        const parts = title.split(sep);
        if (parts.length > 1 && parts[0].trim().length > 5) {
          // Keep only the first meaningful part
          title = parts[0].trim();
          break;
        }
      }

      return title;
    } catch (error) {
      console.warn('[ContentExtractor] extractTitle failed:', error);
      return '';
    }
  }

  private extractHeadings(): Array<{ level: number; text: string; content?: string }> {
    try {
      const headings: Array<{ level: number; text: string; content?: string }> = [];

      this.$('h1, h2, h3, h4').each((_, el) => {
        try {
          const $heading = this.$(el);
          const level = parseInt(el.tagName.substring(1));
          const text = $heading.text().trim();

          if (text) {
            // Get content after heading (first 200 chars)
            let contentAfter = '';
            let $next = $heading.next();
            let iterations = 0;

            while (
              $next.length &&
              !$next.is('h1, h2, h3, h4') &&
              contentAfter.length < 200 &&
              iterations < 10
            ) {
              contentAfter += ' ' + $next.text();
              $next = $next.next();
              iterations++;
            }

            headings.push({
              level,
              text,
              content: contentAfter.trim().substring(0, 200),
            });
          }
        } catch (innerError) {
          console.warn('[ContentExtractor] Error processing heading:', innerError);
        }
      });

      return headings.slice(0, 20); // Limit to first 20 headings
    } catch (error) {
      console.warn('[ContentExtractor] extractHeadings failed:', error);
      return [];
    }
  }

  private extractParagraphs(): string[] {
    try {
      const paragraphs: string[] = [];

      this.$('p').each((_, el) => {
        try {
          const text = this.$(el).text().trim();
          if (text && text.length > 50) {
            // Only substantial paragraphs
            paragraphs.push(text);
          }
        } catch (innerError) {
          console.warn('[ContentExtractor] Error processing paragraph:', innerError);
        }
      });

      return paragraphs.slice(0, 10); // Limit to first 10 paragraphs
    } catch (error) {
      console.warn('[ContentExtractor] extractParagraphs failed:', error);
      return [];
    }
  }

  private extractLists(): Array<{ type: 'ul' | 'ol'; items: string[] }> {
    try {
      const lists: Array<{ type: 'ul' | 'ol'; items: string[] }> = [];

      this.$('ul, ol').each((_, el) => {
        try {
          const $list = this.$(el);
          const type = el.tagName.toLowerCase() as 'ul' | 'ol';
          const items: string[] = [];

          $list.find('> li').each((_, li) => {
            try {
              const text = this.$(li).text().trim();
              if (text) {
                items.push(text.substring(0, 100)); // Limit item length
              }
            } catch (innerError) {
              console.warn('[ContentExtractor] Error processing list item:', innerError);
            }
          });

          if (items.length > 0) {
            lists.push({ type, items: items.slice(0, 10) }); // Limit items
          }
        } catch (innerError) {
          console.warn('[ContentExtractor] Error processing list:', innerError);
        }
      });

      return lists.slice(0, 5); // Limit to first 5 lists
    } catch (error) {
      console.warn('[ContentExtractor] extractLists failed:', error);
      return [];
    }
  }

  private extractStatistics(): string[] {
    try {
      const stats: string[] = [];
      const text = this.contentText || '';

      // Safely extract percentages with context
      try {
        const percentages = text.match(/(\w+\s+)?(\d+(?:\.\d+)?%)/g) || [];
        stats.push(...percentages.slice(0, 5));
      } catch (e) {
        console.warn('[ContentExtractor] Failed to extract percentages:', e);
      }

      // Safely extract numbers with units
      try {
        const measurements =
          text.match(
            /\d+(?:,\d+)*(?:\.\d+)?\s*(?:million|billion|thousand|users|customers|transactions|requests|visitors|downloads|installs)/gi
          ) || [];
        stats.push(...measurements.slice(0, 5));
      } catch (e) {
        console.warn('[ContentExtractor] Failed to extract measurements:', e);
      }

      // Safely extract monetary values
      try {
        const money =
          text.match(/[$€£¥]\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:million|billion|k|K|M|B))?/g) || [];
        stats.push(...money.slice(0, 5));
      } catch (e) {
        console.warn('[ContentExtractor] Failed to extract monetary values:', e);
      }

      return Array.from(new Set(stats)).slice(0, 10); // Unique stats, max 10
    } catch (error) {
      console.warn('[ContentExtractor] extractStatistics failed:', error);
      return [];
    }
  }

  private extractComparisons(): string[] {
    try {
      const comparisons: string[] = [];

      // Look for comparison patterns in headings
      this.$('h1, h2, h3, h4').each((_, el) => {
        try {
          const text = this.$(el).text();
          if (
            text &&
            text.match(
              /\b(vs|versus|compared to|comparison|differences?|better than|alternative)\b/i
            )
          ) {
            comparisons.push(text);
          }
        } catch (innerError) {
          console.warn('[ContentExtractor] Error processing comparison heading:', innerError);
        }
      });

      // Look for comparison phrases in content
      try {
        const comparisonPhrases =
          this.contentText.match(/\b\w+\s+(?:vs|versus|compared to)\s+\w+\b/gi) || [];
        comparisons.push(...comparisonPhrases);
      } catch (e) {
        console.warn('[ContentExtractor] Failed to extract comparison phrases:', e);
      }

      return Array.from(new Set(comparisons)).slice(0, 5);
    } catch (error) {
      console.warn('[ContentExtractor] extractComparisons failed:', error);
      return [];
    }
  }

  private detectTopics(
    title: string,
    headings: Array<{ text: string }>
  ): { primary: string; all: string[] } {
    try {
      const allText = (title || '') + ' ' + headings.map((h) => h.text || '').join(' ');
      const words = allText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);

      // Count word frequency
      const wordFreq = new Map<string, number>();
      words.forEach((word) => {
        try {
          // Skip common words
          if (!this.isCommonWord(word)) {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
          }
        } catch (e) {
          console.warn('[ContentExtractor] Error processing word:', e);
        }
      });

      // Find most frequent meaningful words
      const topWords = Array.from(wordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

      // Extract phrases from title
      const titleWords = (title || '').split(/[\s\-–—:|]+/).filter((w) => w.length > 2);
      const primaryTopic = titleWords.slice(0, 3).join(' ') || topWords[0] || 'general content';

      // Build topic list
      const topics = [primaryTopic];

      // Add domain-specific topics
      try {
        if (allText.match(/\b(payment|transaction|checkout|billing|invoice)/i)) {
          topics.push('payment processing');
        }
        if (allText.match(/\b(product|shop|cart|buy|price|sale)/i)) {
          topics.push('e-commerce');
        }
        if (allText.match(/\b(api|endpoint|integration|sdk|documentation)/i)) {
          topics.push('technical documentation');
        }
        if (allText.match(/\b(blog|article|post|story|news)/i)) {
          topics.push('content publishing');
        }
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting topic patterns:', e);
      }

      return {
        primary: primaryTopic,
        all: Array.from(new Set(topics)).slice(0, 5),
      };
    } catch (error) {
      console.warn('[ContentExtractor] detectTopics failed:', error);
      return {
        primary: 'general content',
        all: ['general content'],
      };
    }
  }

  private detectBusinessType(topics: { all: string[] }): ExtractedContent['businessType'] {
    try {
      const allTopics = (topics?.all || []).join(' ').toLowerCase();
      const bodyText = (this.contentText || '').toLowerCase();

      // Check for specific business indicators
      if (
        bodyText.includes('payment') ||
        bodyText.includes('transaction') ||
        bodyText.includes('merchant')
      ) {
        return 'payment';
      }

      try {
        if (
          this.$('.product, .price, .add-to-cart, .shop').length > 0 ||
          bodyText.includes('buy now')
        ) {
          return 'ecommerce';
        }
        if (this.$('.blog-post, .article-date, .author').length > 0 || allTopics.includes('blog')) {
          return 'blog';
        }
        if (this.$('.news-item, .press-release').length > 0 || allTopics.includes('news')) {
          return 'news';
        }
        if (this.$('code, pre').length > 10) {
          return 'documentation';
        }
      } catch (e) {
        console.warn('[ContentExtractor] Error checking DOM elements:', e);
      }

      if (bodyText.includes('api') || bodyText.includes('documentation')) {
        return 'documentation';
      }
      if (
        bodyText.includes('about us') ||
        bodyText.includes('our services') ||
        bodyText.includes('company')
      ) {
        return 'corporate';
      }
      if (
        bodyText.includes('course') ||
        bodyText.includes('tutorial') ||
        bodyText.includes('learn')
      ) {
        return 'educational';
      }

      return 'other';
    } catch (error) {
      console.warn('[ContentExtractor] detectBusinessType failed:', error);
      return 'other';
    }
  }

  private detectFeatures(): ExtractedContent['detectedFeatures'] {
    try {
      const $ = this.$;
      const text = (this.contentText || '').toLowerCase();

      const features: ExtractedContent['detectedFeatures'] = {
        hasPaymentForms: false,
        hasProductListings: false,
        hasAPIDocumentation: false,
        hasPricingInfo: false,
        hasBlogPosts: false,
        hasTutorials: false,
        hasComparisons: false,
        hasQuestions: false,
      };

      try {
        features.hasPaymentForms =
          $('form').filter((_, el) => {
            try {
              const formText = $(el).text().toLowerCase();
              return (
                formText.includes('payment') ||
                formText.includes('card') ||
                formText.includes('checkout')
              );
            } catch (e) {
              return false;
            }
          }).length > 0;
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting payment forms:', e);
      }

      try {
        features.hasProductListings =
          $('.product, .item, .listing').length > 0 || text.includes('add to cart');
      } catch (e) {
        features.hasProductListings = text.includes('add to cart');
      }

      try {
        features.hasAPIDocumentation =
          $('code, pre').length > 5 || text.includes('endpoint') || text.includes('api');
      } catch (e) {
        features.hasAPIDocumentation = text.includes('endpoint') || text.includes('api');
      }

      try {
        features.hasPricingInfo =
          $('.price, .pricing').length > 0 || text.match(/[$€£¥]\d+/) !== null;
      } catch (e) {
        features.hasPricingInfo = text.match(/[$€£¥]\d+/) !== null;
      }

      try {
        features.hasBlogPosts =
          $('.post, .article, .blog-entry').length > 0 || $('article').length > 0;
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting blog posts:', e);
      }

      features.hasTutorials =
        text.includes('how to') || text.includes('step by step') || text.includes('tutorial');
      features.hasComparisons =
        text.includes(' vs ') || text.includes('versus') || text.includes('comparison');

      try {
        features.hasQuestions =
          $('h1, h2, h3, h4').filter((_, el) => {
            try {
              return $(el).text().includes('?');
            } catch (e) {
              return false;
            }
          }).length > 0;
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting questions:', e);
      }

      return features;
    } catch (error) {
      console.warn('[ContentExtractor] detectFeatures failed:', error);
      return {
        hasPaymentForms: false,
        hasProductListings: false,
        hasAPIDocumentation: false,
        hasPricingInfo: false,
        hasBlogPosts: false,
        hasTutorials: false,
        hasComparisons: false,
        hasQuestions: false,
      };
    }
  }

  private extractKeyTerms(): string[] {
    try {
      const terms: string[] = [];
      const words = (this.contentText || '').split(/\s+/);

      // Find capitalized phrases (likely important terms)
      try {
        for (let i = 0; i < Math.min(words.length - 1, 1000); i++) {
          // Limit iterations
          if (
            words[i] &&
            words[i + 1] &&
            words[i].match(/^[A-Z]/) &&
            words[i + 1].match(/^[A-Z]/)
          ) {
            terms.push(`${words[i]} ${words[i + 1]}`);
          }
        }
      } catch (e) {
        console.warn('[ContentExtractor] Error extracting capitalized phrases:', e);
      }

      // Find repeated significant words
      const wordCount = new Map<string, number>();
      const wordsToProcess = words.slice(0, 5000); // Limit words to process

      wordsToProcess.forEach((word) => {
        try {
          if (!word) return;
          const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleaned.length > 4 && !this.isCommonWord(cleaned)) {
            wordCount.set(cleaned, (wordCount.get(cleaned) || 0) + 1);
          }
        } catch (e) {
          console.warn('[ContentExtractor] Error processing word for key terms:', e);
        }
      });

      // Add frequently used terms
      try {
        Array.from(wordCount.entries())
          .filter(([_, count]) => count > 3)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([word]) => terms.push(word));
      } catch (e) {
        console.warn('[ContentExtractor] Error sorting word frequencies:', e);
      }

      return Array.from(new Set(terms)).slice(0, 15);
    } catch (error) {
      console.warn('[ContentExtractor] extractKeyTerms failed:', error);
      return [];
    }
  }

  private extractProductNames(): string[] {
    try {
      const products: string[] = [];

      // Look for capitalized product-like names
      try {
        // Limit the content to analyze to prevent regex catastrophic backtracking
        const contentToAnalyze = (this.contentText || '').substring(0, 50000);
        const matches =
          contentToAnalyze.match(
            /\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}(?:\s+(?:Pro|Plus|Premium|Enterprise|Basic|Standard|v?\d+(?:\.\d+)?))?/g
          ) || [];

        matches.slice(0, 50).forEach((match) => {
          // Limit matches to process
          try {
            if (match && match.length > 3 && !this.isCommonWord(match)) {
              products.push(match);
            }
          } catch (e) {
            console.warn('[ContentExtractor] Error processing product name:', e);
          }
        });
      } catch (e) {
        console.warn('[ContentExtractor] Error matching product patterns:', e);
      }

      return Array.from(new Set(products)).slice(0, 10);
    } catch (error) {
      console.warn('[ContentExtractor] extractProductNames failed:', error);
      return [];
    }
  }

  private extractTechnicalTerms(): string[] {
    try {
      const technical: string[] = [];

      // Limit content to analyze
      const contentToAnalyze = (this.contentText || '').substring(0, 50000);

      // Common technical patterns
      const patterns = [
        /\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/g, // Acronyms like API, REST API
        /\b\w+(?:js|JS|py|\.io|\.ai|\.com)\b/g, // Tech names
        /\b(?:API|SDK|REST|JSON|XML|HTML|CSS|SQL)\b/gi,
      ];

      patterns.forEach((pattern) => {
        try {
          const matches = contentToAnalyze.match(pattern) || [];
          technical.push(...matches.slice(0, 20)); // Limit matches per pattern
        } catch (e) {
          console.warn('[ContentExtractor] Error matching technical pattern:', e);
        }
      });

      return Array.from(new Set(technical)).slice(0, 10);
    } catch (error) {
      console.warn('[ContentExtractor] extractTechnicalTerms failed:', error);
      return [];
    }
  }

  /**
   * Detect the type of page based on URL patterns, Schema.org markup, and DOM analysis
   * Enhanced detection with focus on three main types: homepage, blog/article, product
   */
  private detectPageType(): PageType {
    try {
      // URL-based detection
      let path = '';
      let hostname = '';
      let subdomain = '';

      if (this.pageUrl) {
        const url = new URL(this.pageUrl);
        path = url.pathname.toLowerCase();
        hostname = url.hostname.toLowerCase();

        // Extract subdomain
        const parts = hostname.split('.');
        if (parts.length > 2) {
          subdomain = parts[0];
        }
      }

      // 1. Homepage Detection (highest priority)
      // Check URL patterns first
      if (
        path === '/' ||
        path === '' ||
        path === '/index' ||
        path === '/index.html' ||
        path === '/index.php' ||
        path === '/home' ||
        path === '/homepage' ||
        path === '/default.html' ||
        path === '/default.aspx'
      ) {
        console.log(
          `[ContentExtractor] Detected homepage by URL pattern: ${this.pageUrl} (path: "${path}")`
        );
        return 'homepage';
      }

      // Check language variants (e.g., /en/, /en-us/, /fr/)
      if (path.match(/^\/[a-z]{2}(-[a-z]{2})?\/$/i)) {
        console.log(`[ContentExtractor] Detected homepage by language variant: ${this.pageUrl}`);
        return 'homepage';
      }

      // Check for Organization schema (strong homepage indicator)
      const orgSchema = this.$('script[type="application/ld+json"]')
        .toArray()
        .some((script) => {
          const text = this.$(script).text();
          return (
            text.includes('"@type":"Organization"') || text.includes('"@type": "Organization"')
          );
        });

      // Organization schema with short path strongly indicates homepage
      if (
        orgSchema &&
        (path === '/' || path.length < 20 || path.split('/').filter((p) => p).length <= 1)
      ) {
        console.log(`[ContentExtractor] Detected homepage by Organization schema: ${this.pageUrl}`);
        return 'homepage';
      }

      // 2. Blog/Article Detection
      // Check URL patterns for blog/article
      const blogPatterns = [
        '/blog/',
        '/blogs/',
        '/post/',
        '/posts/',
        '/article/',
        '/articles/',
        '/news/',
        '/insights/',
        '/resources/',
        '/stories/',
        '/updates/',
        '/press/',
        '/media/',
        '/journal/',
        '/magazine/',
      ];

      if (blogPatterns.some((pattern) => path.includes(pattern))) {
        console.log(`[ContentExtractor] Detected blog/article by URL pattern: ${this.pageUrl}`);
        return 'blog';
      }

      // Check for blog subdomain
      if (subdomain && ['blog', 'news', 'insights', 'stories'].includes(subdomain)) {
        console.log(`[ContentExtractor] Detected blog/article by subdomain: ${this.pageUrl}`);
        return 'blog';
      }

      // Check for date patterns in URL (YYYY/MM/DD or YYYY-MM-DD)
      if (path.match(/\/\d{4}\/\d{1,2}\//) || path.match(/\/\d{4}-\d{2}-\d{2}/)) {
        console.log(
          `[ContentExtractor] Detected blog/article by date pattern in URL: ${this.pageUrl}`
        );
        return 'blog';
      }

      // Check for Article or BlogPosting schema
      const articleSchema = this.$('script[type="application/ld+json"]')
        .toArray()
        .some((script) => {
          const text = this.$(script).text();
          return (
            text.includes('"@type":"Article"') ||
            text.includes('"@type":"BlogPosting"') ||
            text.includes('"@type":"NewsArticle"') ||
            text.includes('"@type": "Article"')
          );
        });

      if (articleSchema) {
        console.log(`[ContentExtractor] Detected blog/article by schema markup: ${this.pageUrl}`);
        return 'blog';
      }

      // Check for article-specific elements
      const hasAuthor =
        this.$('[rel="author"], .author, .by-author, .post-author, .article-author').length > 0;
      const hasPublishDate =
        this.$('[datetime], .publish-date, .post-date, .article-date, time').length > 0;
      const hasArticleTag = this.$('article, .article, .post, .blog-post').length > 0;

      if ((hasAuthor && hasPublishDate) || (hasArticleTag && hasPublishDate)) {
        console.log(
          `[ContentExtractor] Detected blog/article by content patterns: ${this.pageUrl}`
        );
        return 'blog';
      }

      // 3. Product Page Detection
      // Check URL patterns
      const productPatterns = [
        '/product/',
        '/products/',
        '/item/',
        '/items/',
        '/p/',
        '/shop/',
        '/store/',
        '/catalog/',
        '/catalogue/',
        '/merchandise/',
      ];

      if (productPatterns.some((pattern) => path.includes(pattern))) {
        console.log(`[ContentExtractor] Detected product page by URL pattern: ${this.pageUrl}`);
        return 'product';
      }

      // Platform-specific patterns
      if (
        path.includes('/dp/') || // Amazon
        (path.includes('/products/') && hostname.includes('shopify')) || // Shopify
        (path.includes('/p/') && path.split('/').length > 3)
      ) {
        // Generic product
        console.log(
          `[ContentExtractor] Detected product page by platform pattern: ${this.pageUrl}`
        );
        return 'product';
      }

      // Check for Product schema
      const productSchema = this.$('script[type="application/ld+json"]')
        .toArray()
        .some((script) => {
          const text = this.$(script).text();
          return text.includes('"@type":"Product"') || text.includes('"@type": "Product"');
        });

      if (productSchema) {
        console.log(`[ContentExtractor] Detected product page by schema markup: ${this.pageUrl}`);
        return 'product';
      }

      // Check for price and add to cart elements
      const hasPrice = this.$('[itemprop="price"], .price, .product-price, .cost').length > 0;
      const hasAddToCart =
        this.$('button[class*="cart"], button[id*="cart"], .add-to-cart, #add-to-cart').length > 0;
      const hasProductInfo =
        this.$('.product-info, .product-details, .product-description').length > 0;

      if (hasPrice && (hasAddToCart || hasProductInfo)) {
        console.log(
          `[ContentExtractor] Detected product page by price/cart elements: ${this.pageUrl}`
        );
        return 'product';
      }

      // 4. Additional checks for other types
      // Check for article/blog patterns if not already detected
      if (this.hasArticleSignals(path)) {
        return 'article';
      }

      // Documentation detection
      if (
        path.includes('/docs') ||
        path.includes('/documentation') ||
        path.includes('/api') ||
        path.includes('/guide') ||
        path.includes('/manual') ||
        path.includes('/wiki') ||
        this.$('.docs-content, .documentation, .api-reference').length > 0
      ) {
        return 'documentation';
      }

      // 5. Fallback detection based on content patterns
      // Check DOM for navigation-heavy structure (homepage indicator)
      const navElements = this.$('nav, .navigation, .menu').length;
      const linkElements = this.$('a').length;
      const contentRatio = this.$('p, article, section').length / Math.max(linkElements, 1);

      if (navElements > 2 && contentRatio < 0.2) {
        console.log(
          `[ContentExtractor] Detected homepage by navigation-heavy structure: ${this.pageUrl}`
        );
        return 'homepage';
      }

      // Default to 'blog' if uncertain (as per requirements)
      console.log(`[ContentExtractor] Defaulting to blog for: ${this.pageUrl}`);
      return 'blog';
    } catch (error) {
      console.warn('[ContentExtractor] detectPageType failed:', error);
      // Default to 'blog' if uncertain
      return 'blog';
    }
  }

  /**
   * Check if URL or content indicates an article/blog post
   */
  private hasArticleSignals(path: string): boolean {
    // URL patterns for articles
    if (
      path.includes('/blog/') ||
      path.includes('/post/') ||
      path.includes('/article/') ||
      path.includes('/news/') ||
      path.includes('/story/')
    ) {
      return true;
    }

    // Date patterns in URL (e.g., /2023/07/article-title)
    if (path.match(/\/\d{4}\/\d{2}\//)) {
      return true;
    }

    // Check DOM for article indicators
    if (
      this.$('article, .article, .post, .blog-post').length > 0 ||
      this.$('[itemtype*="Article"], [itemtype*="BlogPosting"]').length > 0 ||
      this.$('.publish-date, .post-date, .article-date, .byline, .author-info').length > 0
    ) {
      return true;
    }

    return false;
  }

  /**
   * Extract detailed business attributes for personalization
   */
  private extractBusinessAttributes(): ExtractedContent['businessAttributes'] {
    try {
      const attributes: ExtractedContent['businessAttributes'] = {
        industry: null,
        targetAudience: null,
        mainProduct: null,
        mainService: null,
        uniqueValue: null,
        missionStatement: null,
        yearFounded: null,
        location: null,
        teamSize: null,
      };

      const text = this.contentText.toLowerCase();
      const $ = this.$;

      // Extract industry
      const industryPatterns = [
        /(?:we are|we're|company is|business is)\s+(?:a|an)?\s*([\w\s]+)\s+(?:company|business|startup|agency|firm)/i,
        /(?:leading|premier|top)\s+([\w\s]+)\s+(?:provider|solution|platform|service)/i,
        /in the\s+([\w\s]+)\s+(?:industry|sector|space|market)/i,
      ];

      for (const pattern of industryPatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.industry = match[1].trim();
          break;
        }
      }

      // Extract target audience
      const audiencePatterns = [
        /(?:built for|designed for|made for|created for)\s+([\w\s,]+)/i,
        /(?:help|helps|helping|serve|serves|serving)\s+([\w\s,]+)\s+(?:to|with|by)/i,
        /for\s+(businesses|companies|enterprises|startups|developers|teams|professionals|individuals)\s+(?:who|that)/i,
      ];

      for (const pattern of audiencePatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.targetAudience = match[1].trim().substring(0, 100);
          break;
        }
      }

      // Extract main product/service
      const productNames = this.extractProductNames();
      if (productNames.length > 0) {
        attributes.mainProduct = productNames[0];
      }

      // Look for service descriptions
      const servicePatterns = [
        /we\s+(?:provide|offer|deliver)\s+([\w\s]+)\s+(?:services|solutions)/i,
        /our\s+([\w\s]+)\s+(?:service|solution|platform|software)/i,
      ];

      for (const pattern of servicePatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.mainService = match[1].trim();
          break;
        }
      }

      // Extract unique value proposition
      const valuePatterns = [
        /(?:only|first|unique)\s+([^.]+)\s+(?:that|to|in the)/i,
        /unlike\s+(?:other|traditional)\s+[\w\s]+,\s+(?:we|our)\s+([^.]+)/i,
        /what makes us different[:\s]+([^.]+)/i,
      ];

      for (const pattern of valuePatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.uniqueValue = match[1].trim().substring(0, 200);
          break;
        }
      }

      // Extract mission statement
      const missionPatterns = [
        /(?:our mission|mission is|we believe)\s*[:\s]+([^.]+)/i,
        /(?:committed to|dedicated to)\s+([^.]+)/i,
      ];

      for (const pattern of missionPatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.missionStatement = match[1].trim().substring(0, 200);
          break;
        }
      }

      // Extract year founded
      const yearMatch = this.contentText.match(
        /(?:founded|established|started|since)\s+(?:in\s+)?(\d{4})/i
      );
      if (yearMatch) {
        attributes.yearFounded = yearMatch[1];
      }

      // Extract location
      const locationPatterns = [
        /(?:based in|located in|headquarters in)\s+([\w\s,]+)/i,
        /(?:offices in|presence in)\s+([\w\s,]+)/i,
      ];

      for (const pattern of locationPatterns) {
        const match = this.contentText.match(pattern);
        if (match) {
          attributes.location = match[1].trim().substring(0, 100);
          break;
        }
      }

      // Extract team size
      const teamMatch = this.contentText.match(/(\d+[\+]?)\s*(?:employees|team members|people)/i);
      if (teamMatch) {
        attributes.teamSize = teamMatch[1];
      }

      return attributes;
    } catch (error) {
      console.warn('[ContentExtractor] extractBusinessAttributes failed:', error);
      return {
        industry: null,
        targetAudience: null,
        mainProduct: null,
        mainService: null,
        uniqueValue: null,
        missionStatement: null,
        yearFounded: null,
        location: null,
        teamSize: null,
      };
    }
  }

  /**
   * Extract competitor mentions for competitive intelligence
   */
  private extractCompetitorMentions(): ExtractedContent['competitorMentions'] {
    try {
      const mentions: ExtractedContent['competitorMentions'] = [];
      const comparisons = this.extractComparisons();

      // Look for direct competitor mentions
      const competitorPatterns = [
        /(?:unlike|compared to|vs\.?|versus)\s+([A-Z][\w\s]+)/gi,
        /([A-Z][\w\s]+)\s+(?:alternative|competitor)/gi,
        /better than\s+([A-Z][\w\s]+)/gi,
        /(?:compete with|competing with)\s+([A-Z][\w\s]+)/gi,
      ];

      const processedNames = new Set<string>();

      for (const pattern of competitorPatterns) {
        let match;
        while ((match = pattern.exec(this.contentText)) !== null) {
          const name = match[1].trim();

          // Filter out common words and very long matches
          if (name.length > 2 && name.length < 50 && !this.isCommonWord(name.toLowerCase())) {
            const normalizedName = name.replace(/\s+/g, ' ');

            if (!processedNames.has(normalizedName.toLowerCase())) {
              processedNames.add(normalizedName.toLowerCase());

              // Extract context around the mention
              const startIndex = Math.max(0, match.index - 100);
              const endIndex = Math.min(
                this.contentText.length,
                match.index + match[0].length + 100
              );
              const context = this.contentText.substring(startIndex, endIndex).trim();

              // Determine sentiment
              let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
              const contextLower = context.toLowerCase();

              if (
                contextLower.includes('better than') ||
                contextLower.includes('superior to') ||
                contextLower.includes('outperform') ||
                contextLower.includes('advantage over')
              ) {
                sentiment = 'positive';
              } else if (
                contextLower.includes('worse than') ||
                contextLower.includes('inferior') ||
                contextLower.includes('lacking') ||
                contextLower.includes('behind')
              ) {
                sentiment = 'negative';
              }

              mentions.push({
                name: normalizedName,
                context: context,
                sentiment: sentiment,
              });
            }
          }
        }
      }

      return mentions.slice(0, 10); // Limit to 10 competitor mentions
    } catch (error) {
      console.warn('[ContentExtractor] extractCompetitorMentions failed:', error);
      return [];
    }
  }

  private isCommonWord(word: string): boolean {
    const common = [
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'in',
      'that',
      'have',
      'i',
      'it',
      'for',
      'not',
      'on',
      'with',
      'he',
      'as',
      'you',
      'do',
      'at',
      'this',
      'but',
      'his',
      'by',
      'from',
      'they',
      'we',
      'say',
      'her',
      'she',
      'or',
      'an',
      'will',
      'my',
      'one',
      'all',
      'would',
      'there',
      'their',
      'what',
      'so',
      'up',
      'out',
      'if',
      'about',
      'who',
      'get',
      'which',
      'go',
      'me',
      'when',
      'make',
      'can',
      'like',
      'time',
      'no',
      'just',
      'him',
      'know',
      'take',
      'people',
      'into',
      'year',
      'your',
      'good',
      'some',
      'could',
      'them',
      'see',
      'other',
      'than',
      'then',
      'now',
      'look',
      'only',
      'come',
      'its',
      'over',
    ];
    return common.includes(word.toLowerCase());
  }
}

// Add default export for better Next.js compatibility
export default ContentExtractor;
