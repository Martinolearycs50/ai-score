import { run } from '../trust';
import { WELL_OPTIMIZED_HTML } from './fixtures';

describe('Trust Audit Module', () => {
  describe('Well-optimized content', () => {
    it('should score well for trustworthy content', async () => {
      const scores = await run(WELL_OPTIMIZED_HTML);
      
      expect(scores.authorBio).toBe(5); // Has author bio
      expect(scores.napConsistency).toBe(5); // Has company info
      expect(scores.license).toBe(5); // Has CC-BY license
    });
  });

  describe('Author bio detection', () => {
    it('should detect author in schema.org', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "author": {
              "@type": "Person",
              "name": "Jane Doe"
            }
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });

    it('should detect author meta tags', async () => {
      const html = `
        <html>
          <head>
            <meta name="author" content="John Smith">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });

    it('should detect author bio sections', async () => {
      const html = `
        <html><body>
          <div class="author-bio">
            <h3>About the Author</h3>
            <p>Jane is an expert in AI.</p>
          </div>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });

    it('should detect various author class patterns', async () => {
      const html = `
        <html><body>
          <div class="writer-info">Author details here</div>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });

    it('should detect author bylines with links', async () => {
      const html = `
        <html><body>
          <div class="byline">
            By <a href="/author/jane">Jane Smith</a>
          </div>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });

    it('should detect "About the Author" headings', async () => {
      const html = `
        <html><body>
          <h2>About the Author</h2>
          <p>Expert in the field</p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
    });
  });

  describe('NAP consistency detection', () => {
    it('should detect company name in meta tags', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:site_name" content="Example Corp">
          </head>
          <body>
            <footer>
              <a href="mailto:contact@example.com">Contact</a>
            </footer>
          </body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(5);
    });

    it('should detect address information', async () => {
      const html = `
        <html><body>
          <footer>
            <address>
              123 Main St, City, State
            </address>
          </footer>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(5);
    });

    it('should detect phone numbers', async () => {
      const html = `
        <html><body>
          <div class="company-name">Example Inc</div>
          <a href="tel:+1234567890">(123) 456-7890</a>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(5);
    });

    it('should detect email addresses', async () => {
      const html = `
        <html><body>
          <div class="site-name">Example</div>
          <a href="mailto:info@example.com">Email us</a>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(5);
    });

    it('should detect imprint/legal links', async () => {
      const html = `
        <html><body>
          <footer>
            <a href="/imprint">Imprint</a>
            <a href="/privacy">Privacy</a>
          </footer>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(5);
    });

    it('should require name AND contact or imprint', async () => {
      const html = `
        <html><body>
          <div>Just some content without contact info</div>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.napConsistency).toBe(0);
    });
  });

  describe('License detection', () => {
    it('should detect og:license meta tag', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:license" content="CC-BY-4.0">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(5);
    });

    it('should detect Creative Commons links', async () => {
      const html = `
        <html><body>
          <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(5);
    });

    it('should detect CC license text in footer', async () => {
      const html = `
        <html><body>
          <footer>
            This work is licensed under Creative Commons CC-BY
          </footer>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(5);
    });

    it('should detect MIT license', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:license" content="MIT">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(5);
    });

    it('should detect public domain', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:license" content="Public Domain">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(5);
    });

    it('should not score for restrictive licenses', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:license" content="All Rights Reserved">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.license).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', async () => {
      const html = '<html><body></body></html>';
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(0);
      expect(scores.napConsistency).toBe(0);
      expect(scores.license).toBe(0);
    });

    it('should handle partial trust signals', async () => {
      const html = `
        <html><body>
          <div class="author-bio">Author info here</div>
          <!-- No NAP or license -->
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.authorBio).toBe(5);
      expect(scores.napConsistency).toBe(0);
      expect(scores.license).toBe(0);
    });
  });
});