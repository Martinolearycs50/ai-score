import { run } from '../recency';
import { FRESH_HEADERS, STALE_HEADERS } from './fixtures';

describe('Recency Audit Module', () => {
  describe('Last modified detection', () => {
    it('should score well for fresh content (< 90 days)', async () => {
      const html = '<html><body>Content</body></html>';
      const scores = await run(html, FRESH_HEADERS);
      
      expect(scores.lastModified).toBe(5);
    });

    it('should score poorly for stale content (> 90 days)', async () => {
      const html = '<html><body>Content</body></html>';
      const scores = await run(html, STALE_HEADERS);
      
      expect(scores.lastModified).toBe(0);
    });

    it('should check meta tags when header is missing', async () => {
      const recentDate = new Date().toISOString();
      const html = `
        <html>
          <head>
            <meta property="article:modified_time" content="${recentDate}">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(5);
    });

    it('should check various date meta tags', async () => {
      const recentDate = new Date().toISOString();
      const html = `
        <html>
          <head>
            <meta name="last-modified" content="${recentDate}">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(5);
    });

    it('should check structured data dates', async () => {
      const recentDate = new Date().toISOString();
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "dateModified": "${recentDate}"
          }
          </script>
        </body></html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(5);
    });

    it('should check time elements with datetime', async () => {
      const recentDate = new Date().toISOString();
      const html = `
        <html><body>
          <time datetime="${recentDate}">Recently updated</time>
        </body></html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(5);
    });

    it('should detect dates in text content', async () => {
      const recentDate = new Date();
      const dateStr = recentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const html = `
        <html><body>
          <p>Updated: ${dateStr}</p>
        </body></html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(5);
    });

    it('should handle various date formats', async () => {
      const testCases = [
        '2024-12-15',
        '12/15/2024',
        '15.12.2024',
        'December 15, 2024',
        '15 December 2024'
      ];

      for (const dateFormat of testCases) {
        const html = `
          <html><body>
            <p>Last modified: ${dateFormat}</p>
          </body></html>
        `;
        const scores = await run(html, {});
        
        // Recent dates should score well
        expect(scores.lastModified).toBe(5);
      }
    });

    it('should handle invalid dates gracefully', async () => {
      const html = `
        <html><body>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "dateModified": "invalid-date"
          }
          </script>
        </body></html>
      `;
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(0);
    });
  });

  describe('Stable canonical URL detection', () => {
    it('should score well for clean canonical URLs', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(5);
    });

    it('should allow minimal tracking parameters', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article?utm_source=google">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(5);
    });

    it('should score poorly for URLs with multiple parameters', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article?id=123&session=abc&ref=xyz">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(0);
    });

    it('should detect session IDs in URLs', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article?sessionid=abc123">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(0);
    });

    it('should detect timestamps in URLs', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="https://example.com/article/1234567890123">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(0);
    });

    it('should handle missing canonical tag', async () => {
      const html = `
        <html>
          <head>
            <title>No canonical</title>
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(0);
    });

    it('should handle invalid canonical URLs', async () => {
      const html = `
        <html>
          <head>
            <link rel="canonical" href="not-a-valid-url">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, {});
      
      expect(scores.stableCanonical).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', async () => {
      const html = '<html><body></body></html>';
      const scores = await run(html, {});
      
      expect(scores.lastModified).toBe(0);
      expect(scores.stableCanonical).toBe(0);
    });

    it('should handle case-insensitive headers', async () => {
      const html = '<html><body>Content</body></html>';
      const headers = {
        'Last-Modified': new Date().toISOString(),
      };
      const scores = await run(html, headers);
      
      expect(scores.lastModified).toBe(5);
    });

    it('should prioritize header over meta tags', async () => {
      const oldDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const html = `
        <html>
          <head>
            <meta property="article:modified_time" content="${oldDate}">
          </head>
          <body>Content</body>
        </html>
      `;
      const scores = await run(html, FRESH_HEADERS);
      
      expect(scores.lastModified).toBe(5); // Should use fresh header
    });
  });
});