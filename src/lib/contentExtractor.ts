import * as cheerio from 'cheerio';

export interface ExtractedContent {
  // Core content identification
  primaryTopic: string;
  detectedTopics: string[];
  businessType: 'payment' | 'ecommerce' | 'blog' | 'news' | 'documentation' | 'corporate' | 'educational' | 'other';
  
  // Extracted content samples
  contentSamples: {
    title: string;
    headings: Array<{ level: number; text: string; content?: string }>;
    paragraphs: string[];
    lists: Array<{ type: 'ul' | 'ol'; items: string[] }>;
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
  
  constructor(html: string) {
    try {
      this.$ = cheerio.load(html || '');
      // Get main content area or fallback to body
      this.contentText = this.$('main, article, [role="main"], .content, #content').text() || this.$('body').text() || '';
      
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
   * Extract all content information from the page
   */
  extract(): ExtractedContent {
    try {
      const title = this.extractTitle();
      const headings = this.extractHeadings();
      const topics = this.detectTopics(title, headings);
      const businessType = this.detectBusinessType(topics);
      
      return {
        primaryTopic: topics.primary,
        detectedTopics: topics.all,
        businessType,
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
        wordCount: this.contentText.split(/\s+/).filter(w => w.length > 0).length,
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
      return this.$('title').text() || 
             this.$('meta[property="og:title"]').attr('content') || 
             this.$('h1').first().text() || 
             '';
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
            while ($next.length && !$next.is('h1, h2, h3, h4') && contentAfter.length < 200 && iterations < 10) {
              contentAfter += ' ' + $next.text();
              $next = $next.next();
              iterations++;
            }
            
            headings.push({
              level,
              text,
              content: contentAfter.trim().substring(0, 200)
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
          if (text && text.length > 50) { // Only substantial paragraphs
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
        const measurements = text.match(/\d+(?:,\d+)*(?:\.\d+)?\s*(?:million|billion|thousand|users|customers|transactions|requests|visitors|downloads|installs)/gi) || [];
        stats.push(...measurements.slice(0, 5));
      } catch (e) {
        console.warn('[ContentExtractor] Failed to extract measurements:', e);
      }
      
      // Safely extract monetary values
      try {
        const money = text.match(/[$€£¥]\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:million|billion|k|K|M|B))?/g) || [];
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
          if (text && text.match(/\b(vs|versus|compared to|comparison|differences?|better than|alternative)\b/i)) {
            comparisons.push(text);
          }
        } catch (innerError) {
          console.warn('[ContentExtractor] Error processing comparison heading:', innerError);
        }
      });
      
      // Look for comparison phrases in content
      try {
        const comparisonPhrases = this.contentText.match(/\b\w+\s+(?:vs|versus|compared to)\s+\w+\b/gi) || [];
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
  
  private detectTopics(title: string, headings: Array<{ text: string }>): { primary: string; all: string[] } {
    try {
      const allText = (title || '') + ' ' + headings.map(h => h.text || '').join(' ');
      const words = allText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      // Count word frequency
      const wordFreq = new Map<string, number>();
      words.forEach(word => {
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
      const titleWords = (title || '').split(/[\s\-–—:|]+/).filter(w => w.length > 2);
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
        all: Array.from(new Set(topics)).slice(0, 5)
      };
    } catch (error) {
      console.warn('[ContentExtractor] detectTopics failed:', error);
      return {
        primary: 'general content',
        all: ['general content']
      };
    }
  }
  
  private detectBusinessType(topics: { all: string[] }): ExtractedContent['businessType'] {
    try {
      const allTopics = (topics?.all || []).join(' ').toLowerCase();
      const bodyText = (this.contentText || '').toLowerCase();
      
      // Check for specific business indicators
      if (bodyText.includes('payment') || bodyText.includes('transaction') || bodyText.includes('merchant')) {
        return 'payment';
      }
      
      try {
        if (this.$('.product, .price, .add-to-cart, .shop').length > 0 || bodyText.includes('buy now')) {
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
      if (bodyText.includes('about us') || bodyText.includes('our services') || bodyText.includes('company')) {
        return 'corporate';
      }
      if (bodyText.includes('course') || bodyText.includes('tutorial') || bodyText.includes('learn')) {
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
        features.hasPaymentForms = $('form').filter((_, el) => {
          try {
            const formText = $(el).text().toLowerCase();
            return formText.includes('payment') || formText.includes('card') || formText.includes('checkout');
          } catch (e) {
            return false;
          }
        }).length > 0;
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting payment forms:', e);
      }
      
      try {
        features.hasProductListings = $('.product, .item, .listing').length > 0 || text.includes('add to cart');
      } catch (e) {
        features.hasProductListings = text.includes('add to cart');
      }
      
      try {
        features.hasAPIDocumentation = $('code, pre').length > 5 || text.includes('endpoint') || text.includes('api');
      } catch (e) {
        features.hasAPIDocumentation = text.includes('endpoint') || text.includes('api');
      }
      
      try {
        features.hasPricingInfo = $('.price, .pricing').length > 0 || text.match(/[$€£¥]\d+/) !== null;
      } catch (e) {
        features.hasPricingInfo = text.match(/[$€£¥]\d+/) !== null;
      }
      
      try {
        features.hasBlogPosts = $('.post, .article, .blog-entry').length > 0 || $('article').length > 0;
      } catch (e) {
        console.warn('[ContentExtractor] Error detecting blog posts:', e);
      }
      
      features.hasTutorials = text.includes('how to') || text.includes('step by step') || text.includes('tutorial');
      features.hasComparisons = text.includes(' vs ') || text.includes('versus') || text.includes('comparison');
      
      try {
        features.hasQuestions = $('h1, h2, h3, h4').filter((_, el) => {
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
        for (let i = 0; i < Math.min(words.length - 1, 1000); i++) { // Limit iterations
          if (words[i] && words[i + 1] && words[i].match(/^[A-Z]/) && words[i + 1].match(/^[A-Z]/)) {
            terms.push(`${words[i]} ${words[i + 1]}`);
          }
        }
      } catch (e) {
        console.warn('[ContentExtractor] Error extracting capitalized phrases:', e);
      }
      
      // Find repeated significant words
      const wordCount = new Map<string, number>();
      const wordsToProcess = words.slice(0, 5000); // Limit words to process
      
      wordsToProcess.forEach(word => {
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
        const matches = contentToAnalyze.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}(?:\s+(?:Pro|Plus|Premium|Enterprise|Basic|Standard|v?\d+(?:\.\d+)?))?/g) || [];
        
        matches.slice(0, 50).forEach(match => { // Limit matches to process
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
      
      patterns.forEach(pattern => {
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
  
  private isCommonWord(word: string): boolean {
    const common = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over'
    ];
    
    return common.includes(word.toLowerCase());
  }
}

// Add default export for better Next.js compatibility
export default ContentExtractor;