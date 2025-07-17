/**
 * Tests for ContentExtractor business attribute enhancements
 * Separate file to avoid conflicts with existing tests
 */

// Mock cheerio to avoid DOM parsing issues in test environment
jest.mock('cheerio', () => {
  const actualCheerio = jest.requireActual('cheerio');
  return {
    ...actualCheerio,
    load: (html: string) => {
      const $ = actualCheerio.load(html);
      // Ensure remove() works on selections
      const originalFind = $.prototype.find;
      $.prototype.find = function(...args: any[]) {
        const result = originalFind.apply(this, args);
        if (!result.remove) {
          result.remove = () => result;
        }
        return result;
      };
      return $;
    }
  };
});

import { ContentExtractor } from '../contentExtractor';

describe('ContentExtractor Business Attributes', () => {
  describe('Business Attributes Extraction', () => {
    it('should extract industry from various patterns', () => {
      const html = `
        <html>
          <body>
            <h1>TechCorp Solutions</h1>
            <p>We are a leading software development company specializing in AI solutions.</p>
          </body>
        </html>
      `;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result.businessAttributes.industry).toBe('software development');
    });
    
    it('should extract target audience information', () => {
      const html = `
        <html>
          <body>
            <h1>DataPro Analytics</h1>
            <p>Built for enterprises who need real-time data insights.</p>
          </body>
        </html>
      `;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result.businessAttributes.targetAudience).toContain('enterprises');
    });
    
    it('should extract company metadata', () => {
      const html = `
        <html>
          <body>
            <h1>Innovation Labs</h1>
            <p>Founded in 2015, we've grown to serve thousands.</p>
            <p>Based in San Francisco with offices worldwide.</p>
            <p>Our team of 150+ employees is dedicated to excellence.</p>
          </body>
        </html>
      `;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result.businessAttributes.yearFounded).toBe('2015');
      expect(result.businessAttributes.location).toContain('San Francisco');
      expect(result.businessAttributes.teamSize).toBe('150+');
    });
  });
  
  describe('Competitor Mentions', () => {
    it('should detect competitor mentions with context', () => {
      const html = `
        <html>
          <body>
            <h1>BetterCRM</h1>
            <p>Unlike Salesforce, we offer unlimited customization.</p>
            <p>Better than HubSpot with our intuitive interface.</p>
          </body>
        </html>
      `;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result.competitorMentions.length).toBeGreaterThan(0);
      
      const salesforceMention = result.competitorMentions.find(m => m.name === 'Salesforce');
      expect(salesforceMention).toBeDefined();
      expect(salesforceMention?.sentiment).toBe('positive');
      expect(salesforceMention?.context).toContain('unlimited customization');
    });
    
    it('should detect sentiment correctly', () => {
      const html = `
        <html>
          <body>
            <p>We outperform Google Analytics in real-time processing.</p>
            <p>Mixpanel is a good tool but lacks our advanced features.</p>
          </body>
        </html>
      `;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      const googleMention = result.competitorMentions.find(m => m.name === 'Google Analytics');
      expect(googleMention?.sentiment).toBe('positive');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle missing attributes gracefully', () => {
      const html = `<html><body><p>Simple website content.</p></body></html>`;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result.businessAttributes.industry).toBeNull();
      expect(result.businessAttributes.yearFounded).toBeNull();
      expect(result.competitorMentions).toEqual([]);
    });
    
    it('should not crash on malformed HTML', () => {
      const html = `<h1>Broken <p>HTML`;
      
      const extractor = new ContentExtractor(html);
      const result = extractor.extract();
      
      expect(result).toBeDefined();
      expect(result.businessType).toBeDefined();
    });
  });
});