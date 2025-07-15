import { run } from '../structure';
import { WELL_OPTIMIZED_HTML, POORLY_OPTIMIZED_HTML } from './fixtures';

describe('Structure Audit Module', () => {
  describe('Well-optimized content', () => {
    it('should score well for properly structured content', async () => {
      const scores = await run(WELL_OPTIMIZED_HTML);
      
      expect(scores.headingFrequency).toBe(5); // Good heading frequency
      expect(scores.headingDepth).toBe(5); // Proper depth (H1-H3)
      expect(scores.structuredData).toBe(5); // Has FAQPage schema
      expect(scores.rssFeed).toBe(5); // Has RSS feed link
    });
  });

  describe('Heading frequency', () => {
    it('should score well with headings every 300 words or less', async () => {
      const html = `
        <html><body><main>
          <h1>Title</h1>
          <p>${'Word '.repeat(250)}</p>
          <h2>Section</h2>
          <p>${'Word '.repeat(250)}</p>
          <h3>Subsection</h3>
        </main></body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingFrequency).toBe(5);
    });

    it('should score poorly with too few headings', async () => {
      const html = `
        <html><body><main>
          <h1>Only Title</h1>
          <p>${'Word '.repeat(1000)}</p>
        </main></body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingFrequency).toBe(0);
    });

    it('should handle content with no headings', async () => {
      const html = `
        <html><body><main>
          <p>${'Word '.repeat(500)}</p>
        </main></body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingFrequency).toBe(0);
    });
  });

  describe('Heading depth', () => {
    it('should score well with 3 or fewer heading levels', async () => {
      const html = `
        <html><body>
          <h1>Title</h1>
          <h2>Section</h2>
          <h3>Subsection</h3>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingDepth).toBe(5);
    });

    it('should score poorly with deep heading hierarchy', async () => {
      const scores = await run(POORLY_OPTIMIZED_HTML);
      
      expect(scores.headingDepth).toBe(0); // Has H1, H4, H5, H6 (4 levels)
    });

    it('should handle single heading level', async () => {
      const html = `
        <html><body>
          <h1>Title</h1>
          <h1>Another H1</h1>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingDepth).toBe(5); // Only 1 level
    });
  });

  describe('Structured data detection', () => {
    it('should detect FAQPage schema', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(5);
    });

    it('should detect HowTo schema', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to optimize for AI"
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(5);
    });

    it('should detect Dataset schema', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "AI Search Statistics"
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(5);
    });

    it('should detect schema in @graph', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "Example"
              },
              {
                "@type": "FAQPage",
                "mainEntity": []
              }
            ]
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(5);
    });

    it('should handle invalid JSON-LD', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          { invalid json
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(0);
    });

    it('should not score for other schema types', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Test"
          }
          </script>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.structuredData).toBe(0);
    });
  });

  describe('RSS feed detection', () => {
    it('should detect RSS link tags', async () => {
      const html = `
        <html>
          <head>
            <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.rssFeed).toBe(5);
    });

    it('should detect Atom feed links', async () => {
      const html = `
        <html>
          <head>
            <link rel="alternate" type="application/atom+xml" title="Atom" href="/atom">
          </head>
          <body></body>
        </html>
      `;
      const scores = await run(html);
      
      expect(scores.rssFeed).toBe(5);
    });

    it('should detect RSS links in content', async () => {
      const html = `
        <html><body>
          <a href="/rss">RSS Feed</a>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.rssFeed).toBe(5);
    });

    it('should detect various feed URL patterns', async () => {
      const html = `
        <html><body>
          <a href="/feed.xml">Subscribe</a>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.rssFeed).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', async () => {
      const html = '<html><body></body></html>';
      const scores = await run(html);
      
      expect(scores.headingFrequency).toBe(0);
      expect(scores.headingDepth).toBe(0);
      expect(scores.structuredData).toBe(0);
      expect(scores.rssFeed).toBe(0);
    });

    it('should use body as fallback when no main tag', async () => {
      const html = `
        <html><body>
          <h1>Title</h1>
          <p>${'Word '.repeat(200)}</p>
          <h2>Section</h2>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.headingFrequency).toBe(5);
    });
  });
});