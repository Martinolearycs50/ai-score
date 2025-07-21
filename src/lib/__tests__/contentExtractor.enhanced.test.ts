import { ContentExtractor } from '../contentExtractor';

describe('ContentExtractor - Enhanced Business Attributes', () => {
  describe('Business Attributes Extraction', () => {
    it('should extract industry information', () => {
      const html = `
        <html>
          <body>
            <h1>TechCorp Solutions</h1>
            <p>We are a leading software development company specializing in AI solutions.</p>
            <p>As pioneers in the technology industry, we help businesses transform.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.industry).toBe('software development');
    });

    it('should extract target audience', () => {
      const html = `
        <html>
          <body>
            <h1>DataPro Analytics</h1>
            <p>Built for enterprises who need real-time data insights.</p>
            <p>We help Fortune 500 companies make data-driven decisions.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.targetAudience).toBe(
        'enterprises who need real-time data insights'
      );
    });

    it('should extract main product and service', () => {
      const html = `
        <html>
          <body>
            <h1>CloudSync Pro - Enterprise Backup Solution</h1>
            <p>We provide automated cloud backup services for businesses.</p>
            <p>Our CloudSync Pro platform ensures your data is always safe.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.mainProduct).toBe('CloudSync Pro');
      expect(result.businessAttributes.mainService).toBe('automated cloud backup');
    });

    it('should extract unique value proposition', () => {
      const html = `
        <html>
          <body>
            <h1>FastShip Logistics</h1>
            <p>Unlike other shipping companies, we guarantee same-day delivery in major cities.</p>
            <p>We're the only logistics provider that offers real-time package tracking with AI predictions.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.uniqueValue).toContain('guarantee same-day delivery');
    });

    it('should extract company metadata', () => {
      const html = `
        <html>
          <body>
            <h1>Innovation Labs</h1>
            <p>Founded in 2015, we've grown to serve thousands of clients.</p>
            <p>Based in San Francisco with offices in New York and London.</p>
            <p>Our team of 150+ employees is dedicated to your success.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.yearFounded).toBe('2015');
      expect(result.businessAttributes.location).toBe(
        'San Francisco with offices in New York and London'
      );
      expect(result.businessAttributes.teamSize).toBe('150+');
    });

    it('should handle missing business attributes gracefully', () => {
      const html = `
        <html>
          <body>
            <h1>Simple Website</h1>
            <p>Welcome to our website.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.businessAttributes.industry).toBeNull();
      expect(result.businessAttributes.targetAudience).toBeNull();
      expect(result.businessAttributes.mainProduct).toBeNull();
      expect(result.businessAttributes.yearFounded).toBeNull();
    });
  });

  describe('Competitor Intelligence Extraction', () => {
    it('should detect direct competitor mentions', () => {
      const html = `
        <html>
          <body>
            <h1>BetterCRM Solutions</h1>
            <p>Unlike Salesforce, we offer unlimited customization at half the price.</p>
            <p>Compared to HubSpot, our platform is easier to use and more affordable.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.competitorMentions).toHaveLength(2);
      expect(result.competitorMentions[0].name).toBe('Salesforce');
      expect(result.competitorMentions[1].name).toBe('HubSpot');
    });

    it('should detect competitor sentiment', () => {
      const html = `
        <html>
          <body>
            <h1>SuperAnalytics Pro</h1>
            <p>We offer better insights than Google Analytics with real-time processing.</p>
            <p>While Mixpanel is good, we provide superior user tracking capabilities.</p>
            <p>Adobe Analytics is a strong competitor in the enterprise space.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      const googleMention = result.competitorMentions.find((m) => m.name === 'Google Analytics');
      const mixpanelMention = result.competitorMentions.find((m) => m.name === 'Mixpanel');
      const adobeMention = result.competitorMentions.find((m) => m.name === 'Adobe Analytics');

      expect(googleMention?.sentiment).toBe('positive'); // "better than"
      expect(mixpanelMention?.sentiment).toBe('positive'); // "superior"
      expect(adobeMention?.sentiment).toBe('neutral'); // just mentioned
    });

    it('should include context for competitor mentions', () => {
      const html = `
        <html>
          <body>
            <h1>FastDeploy CI/CD</h1>
            <p>Our deployment pipeline is 3x faster than Jenkins and requires no configuration.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      const jenkinsMention = result.competitorMentions.find((m) => m.name === 'Jenkins');
      expect(jenkinsMention?.context).toContain('3x faster');
      expect(jenkinsMention?.context).toContain('no configuration');
    });

    it('should handle no competitor mentions', () => {
      const html = `
        <html>
          <body>
            <h1>Unique Solutions Inc</h1>
            <p>We provide innovative solutions for modern businesses.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result.competitorMentions).toEqual([]);
    });

    it('should filter out false positive competitor mentions', () => {
      const html = `
        <html>
          <body>
            <h1>Writing Tools Pro</h1>
            <p>Better than ever, our tools help you write effectively.</p>
            <p>Compared to last year, we've added many features.</p>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      // Should not pick up "ever" or "last year" as competitors
      expect(result.competitorMentions.every((m) => m.name !== 'ever')).toBe(true);
      expect(result.competitorMentions.every((m) => m.name !== 'last year')).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed HTML gracefully', () => {
      const html = `<h1>Broken <p>HTML</h1> content here`;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result).toBeDefined();
      expect(result.businessType).toBe('other');
      expect(result.businessAttributes.industry).toBeNull();
    });

    it('should handle empty HTML', () => {
      const html = '';

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result).toBeDefined();
      expect(result.primaryTopic).toBe('general content');
      expect(result.competitorMentions).toEqual([]);
    });

    it('should handle very large content without crashing', () => {
      // Generate large HTML content
      const largeContent = 'Lorem ipsum '.repeat(20000);
      const html = `<html><body><p>${largeContent}</p></body></html>`;

      const extractor = new ContentExtractor(html);
      const result = extractor.extract();

      expect(result).toBeDefined();
      expect(result.wordCount).toBeLessThanOrEqual(100000); // Should be truncated
    });

    it('should extract attributes from complex real-world HTML', () => {
      const html = `
        <html>
          <head><title>TechStart - AI Solutions for Modern Business</title></head>
          <body>
            <nav>Home Products About Contact</nav>
            <main>
              <section class="hero">
                <h1>Transform Your Business with AI</h1>
                <p>Founded in 2018, TechStart is a premier AI consulting firm based in Austin, Texas.</p>
              </section>
              <section class="about">
                <h2>Who We Serve</h2>
                <p>Built for mid-market companies who want to leverage AI without the enterprise complexity.</p>
                <p>Unlike IBM Watson or Google Cloud AI, we provide hands-on implementation support.</p>
              </section>
              <section class="team">
                <p>Our team of 75 experts is committed to making AI accessible for every business.</p>
              </section>
            </main>
            <footer>© 2024 TechStart Inc.</footer>
          </body>
        </html>
      `;

      const extractor = new ContentExtractor(html, 'https://techstart.com');
      const result = extractor.extract();

      expect(result.businessType).toBe('corporate');
      expect(result.businessAttributes.industry).toBe('AI consulting firm');
      expect(result.businessAttributes.yearFounded).toBe('2018');
      expect(result.businessAttributes.location).toBe('Austin, Texas');
      expect(result.businessAttributes.teamSize).toBe('75');
      expect(result.businessAttributes.targetAudience).toContain('mid-market companies');
      expect(result.competitorMentions).toHaveLength(2);
      expect(result.competitorMentions.map((m) => m.name)).toContain('IBM Watson');
      expect(result.competitorMentions.map((m) => m.name)).toContain('Google Cloud AI');
    });
  });
});
