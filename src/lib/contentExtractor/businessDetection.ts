import * as cheerio from 'cheerio';

import type { ExtractedContent } from '../contentExtractor';

/**
 * Business-related detection methods for ContentExtractor
 */
export class BusinessDetection {
  private $: cheerio.CheerioAPI;
  private contentText: string;

  constructor($: cheerio.CheerioAPI, contentText: string) {
    this.$ = $;
    this.contentText = contentText;
  }

  detectBusinessType(topics: { all: string[] }): ExtractedContent['businessType'] {
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
        console.warn('[BusinessDetection] Error checking DOM elements:', e);
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
      console.warn('[BusinessDetection] detectBusinessType failed:', error);
      return 'other';
    }
  }

  extractBusinessAttributes(): ExtractedContent['businessAttributes'] {
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
      console.warn('[BusinessDetection] extractBusinessAttributes failed:', error);
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

  extractCompetitorMentions(): ExtractedContent['competitorMentions'] {
    try {
      const mentions: ExtractedContent['competitorMentions'] = [];

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
      console.warn('[BusinessDetection] extractCompetitorMentions failed:', error);
      return [];
    }
  }

  extractProductNames(): string[] {
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
            console.warn('[BusinessDetection] Error processing product name:', e);
          }
        });
      } catch (e) {
        console.warn('[BusinessDetection] Error matching product patterns:', e);
      }

      return Array.from(new Set(products)).slice(0, 10);
    } catch (error) {
      console.warn('[BusinessDetection] extractProductNames failed:', error);
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
