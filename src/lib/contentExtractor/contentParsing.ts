import * as cheerio from 'cheerio';

/**
 * Content parsing methods for ContentExtractor
 */
export class ContentParsing {
  private $: cheerio.CheerioAPI;
  private contentText: string;

  constructor($: cheerio.CheerioAPI, contentText: string) {
    this.$ = $;
    this.contentText = contentText;
  }

  extractMetaDescription(): string {
    try {
      const metaDescription =
        this.$('meta[name="description"]').attr('content') ||
        this.$('meta[property="og:description"]').attr('content') ||
        this.$('meta[name="twitter:description"]').attr('content') ||
        '';

      console.log(
        '[ContentParsing] Extracted meta description:',
        metaDescription.substring(0, 100) + (metaDescription.length > 100 ? '...' : '')
      );
      console.log('[ContentParsing] Meta description length:', metaDescription.length);

      return metaDescription.trim();
    } catch (error) {
      console.error('[ContentParsing] Error extracting meta description:', error);
      return '';
    }
  }

  extractTitle(): string {
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

      // Don't truncate at separators - we need the full title including brand names
      // for accurate SEO analysis

      console.log('[ContentParsing] Extracted title:', title);

      return title.trim();
    } catch (error) {
      console.warn('[ContentParsing] extractTitle failed:', error);
      return '';
    }
  }

  extractHeadings(): Array<{ level: number; text: string; content?: string }> {
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
          console.warn('[ContentParsing] Error processing heading:', innerError);
        }
      });

      return headings.slice(0, 20); // Limit to first 20 headings
    } catch (error) {
      console.warn('[ContentParsing] extractHeadings failed:', error);
      return [];
    }
  }

  extractParagraphs(): string[] {
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
          console.warn('[ContentParsing] Error processing paragraph:', innerError);
        }
      });

      return paragraphs.slice(0, 10); // Limit to first 10 paragraphs
    } catch (error) {
      console.warn('[ContentParsing] extractParagraphs failed:', error);
      return [];
    }
  }

  extractLists(): Array<{ type: 'ul' | 'ol'; items: string[] }> {
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
              console.warn('[ContentParsing] Error processing list item:', innerError);
            }
          });

          if (items.length > 0) {
            lists.push({ type, items: items.slice(0, 10) }); // Limit items
          }
        } catch (innerError) {
          console.warn('[ContentParsing] Error processing list:', innerError);
        }
      });

      return lists.slice(0, 5); // Limit to first 5 lists
    } catch (error) {
      console.warn('[ContentParsing] extractLists failed:', error);
      return [];
    }
  }

  extractStatistics(): string[] {
    try {
      const stats: string[] = [];
      const text = this.contentText || '';

      // Safely extract percentages with context
      try {
        const percentages = text.match(/(\w+\s+)?(\d+(?:\.\d+)?%)/g) || [];
        stats.push(...percentages.slice(0, 5));
      } catch (e) {
        console.warn('[ContentParsing] Failed to extract percentages:', e);
      }

      // Safely extract numbers with units
      try {
        const measurements =
          text.match(
            /\d+(?:,\d+)*(?:\.\d+)?\s*(?:million|billion|thousand|users|customers|transactions|requests|visitors|downloads|installs)/gi
          ) || [];
        stats.push(...measurements.slice(0, 5));
      } catch (e) {
        console.warn('[ContentParsing] Failed to extract measurements:', e);
      }

      // Safely extract monetary values
      try {
        const money =
          text.match(/[$€£¥]\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:million|billion|k|K|M|B))?/g) || [];
        stats.push(...money.slice(0, 5));
      } catch (e) {
        console.warn('[ContentParsing] Failed to extract monetary values:', e);
      }

      return Array.from(new Set(stats)).slice(0, 10); // Unique stats, max 10
    } catch (error) {
      console.warn('[ContentParsing] extractStatistics failed:', error);
      return [];
    }
  }

  extractComparisons(): string[] {
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
          console.warn('[ContentParsing] Error processing comparison heading:', innerError);
        }
      });

      // Look for comparison phrases in content
      try {
        const comparisonPhrases =
          this.contentText.match(/\b\w+\s+(?:vs|versus|compared to)\s+\w+\b/gi) || [];
        comparisons.push(...comparisonPhrases);
      } catch (e) {
        console.warn('[ContentParsing] Failed to extract comparison phrases:', e);
      }

      return Array.from(new Set(comparisons)).slice(0, 5);
    } catch (error) {
      console.warn('[ContentParsing] extractComparisons failed:', error);
      return [];
    }
  }

  extractKeyTerms(): string[] {
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
        console.warn('[ContentParsing] Error extracting capitalized phrases:', e);
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
          console.warn('[ContentParsing] Error processing word for key terms:', e);
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
        console.warn('[ContentParsing] Error sorting word frequencies:', e);
      }

      return Array.from(new Set(terms)).slice(0, 15);
    } catch (error) {
      console.warn('[ContentParsing] extractKeyTerms failed:', error);
      return [];
    }
  }

  extractTechnicalTerms(): string[] {
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
          console.warn('[ContentParsing] Error matching technical pattern:', e);
        }
      });

      return Array.from(new Set(technical)).slice(0, 10);
    } catch (error) {
      console.warn('[ContentParsing] extractTechnicalTerms failed:', error);
      return [];
    }
  }

  detectTopics(
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
          console.warn('[ContentParsing] Error processing word:', e);
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
        console.warn('[ContentParsing] Error detecting topic patterns:', e);
      }

      return {
        primary: primaryTopic,
        all: Array.from(new Set(topics)).slice(0, 5),
      };
    } catch (error) {
      console.warn('[ContentParsing] detectTopics failed:', error);
      return {
        primary: 'general content',
        all: ['general content'],
      };
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
