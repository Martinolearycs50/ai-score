import * as cheerio from 'cheerio';

import type { ExtractedContent } from '../contentExtractor';
import type { PageType } from '../types';

/**
 * Feature detection methods for ContentExtractor
 */
export class FeatureDetection {
  private $: cheerio.CheerioAPI;
  private contentText: string;
  private pageUrl?: string;

  constructor($: cheerio.CheerioAPI, contentText: string, pageUrl?: string) {
    this.$ = $;
    this.contentText = contentText;
    this.pageUrl = pageUrl;
  }

  detectFeatures(): ExtractedContent['detectedFeatures'] {
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
        console.warn('[FeatureDetection] Error detecting payment forms:', e);
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
        console.warn('[FeatureDetection] Error detecting blog posts:', e);
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
        console.warn('[FeatureDetection] Error detecting questions:', e);
      }

      return features;
    } catch (error) {
      console.warn('[FeatureDetection] detectFeatures failed:', error);
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

  /**
   * Detect the type of page based on URL patterns, Schema.org markup, and DOM analysis
   * Enhanced detection with focus on three main types: homepage, blog/article, product
   */
  detectPageType(): PageType {
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
          `[FeatureDetection] Detected homepage by URL pattern: ${this.pageUrl} (path: "${path}")`
        );
        return 'homepage';
      }

      // Check language variants (e.g., /en/, /en-us/, /fr/)
      if (path.match(/^\/[a-z]{2}(-[a-z]{2})?\/$/i)) {
        console.log(`[FeatureDetection] Detected homepage by language variant: ${this.pageUrl}`);
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
        console.log(`[FeatureDetection] Detected homepage by Organization schema: ${this.pageUrl}`);
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
        console.log(`[FeatureDetection] Detected blog/article by URL pattern: ${this.pageUrl}`);
        return 'blog';
      }

      // Check for blog subdomain
      if (subdomain && ['blog', 'news', 'insights', 'stories'].includes(subdomain)) {
        console.log(`[FeatureDetection] Detected blog/article by subdomain: ${this.pageUrl}`);
        return 'blog';
      }

      // Check for date patterns in URL (YYYY/MM/DD or YYYY-MM-DD)
      if (path.match(/\/\d{4}\/\d{1,2}\//) || path.match(/\/\d{4}-\d{2}-\d{2}/)) {
        console.log(
          `[FeatureDetection] Detected blog/article by date pattern in URL: ${this.pageUrl}`
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
        console.log(`[FeatureDetection] Detected blog/article by schema markup: ${this.pageUrl}`);
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
          `[FeatureDetection] Detected blog/article by content patterns: ${this.pageUrl}`
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
        console.log(`[FeatureDetection] Detected product page by URL pattern: ${this.pageUrl}`);
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
          `[FeatureDetection] Detected product page by platform pattern: ${this.pageUrl}`
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
        console.log(`[FeatureDetection] Detected product page by schema markup: ${this.pageUrl}`);
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
          `[FeatureDetection] Detected product page by price/cart elements: ${this.pageUrl}`
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
          `[FeatureDetection] Detected homepage by navigation-heavy structure: ${this.pageUrl}`
        );
        return 'homepage';
      }

      // Default to 'blog' if uncertain (as per requirements)
      console.log(`[FeatureDetection] Defaulting to blog for: ${this.pageUrl}`);
      return 'blog';
    } catch (error) {
      console.warn('[FeatureDetection] detectPageType failed:', error);
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
   * Detect if the page is an error or blocked page
   */
  isErrorPage(): boolean {
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
      // Additional bot-blocking indicators
      'please wait while we check',
      'checking your browser',
      'ddos protection',
      'one more step',
      'please complete the security check',
    ];

    const lowerContent = this.contentText.toLowerCase();
    const lowerTitle = this.$('title').text().toLowerCase();

    // Check for extremely short content (likely blocked)
    if (this.contentText.length < 200) {
      console.log(`[FeatureDetection] Detected error/blocked page: content too short (${this.contentText.length} chars)`);
      return true;
    }

    // Check if page has no meaningful content (only navigation)
    const mainContent = this.$('main, article, .content, #content').text().trim();
    if (mainContent.length === 0 && this.contentText.length < 1000) {
      console.log('[FeatureDetection] Detected error/blocked page: no main content found');
      return true;
    }

    // Check for error indicators in content
    for (const indicator of errorIndicators) {
      if (lowerContent.includes(indicator) || lowerTitle.includes(indicator)) {
        // Additional check: if the page has very little content and contains error words
        if (this.contentText.length < 500 || this.$('main, article').text().length < 100) {
          console.log(`[FeatureDetection] Detected error/blocked page: contains "${indicator}"`);
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
      console.log('[FeatureDetection] Detected Stripe API error page');
      return true;
    }

    // Check for pages with only repetitive navigation text
    const words = this.contentText.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionRatio = words.length / uniqueWords.size;
    if (repetitionRatio > 5 && this.contentText.length < 1000) {
      console.log('[FeatureDetection] Detected error/blocked page: high text repetition');
      return true;
    }

    return false;
  }
}
