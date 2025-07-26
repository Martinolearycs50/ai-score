/**
 * E2E test for AI Search analysis flow
 * Tests the complete user journey from URL input to results display
 */
import axios from 'axios';

import { AiSearchAnalyzer } from '@/lib/analyzer-new';

// Mock fetch for E2E test
global.fetch = jest.fn();

describe('AI Search Analysis E2E Flow', () => {
  let analyzer: AiSearchAnalyzer;

  beforeEach(() => {
    analyzer = new AiSearchAnalyzer();
    jest.clearAllMocks();
  });

  describe('Complete analysis flow', () => {
    it('should analyze a well-optimized website and return high score', async () => {
      // Mock a well-optimized website response
      const wellOptimizedHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>AI Search Optimization Guide</title>
          <meta name="description" content="Complete guide to optimizing for AI search engines">
          <meta property="og:license" content="CC-BY-4.0">
          <link rel="canonical" href="https://example.com/guide">
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "What is AI search?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI search refers to search engines powered by artificial intelligence."
              }
            }]
          }
          </script>
        </head>
        <body>
          <main>
            <article>
              <h1>AI Search Optimization Guide</h1>
              <p>Last updated: ${new Date().toISOString()}</p>
              
              <h2>Introduction</h2>
              <p>In 2024, AI search engines process over 1 billion queries daily...</p>
              
              <h2>Key Statistics</h2>
              <ul>
                <li>50% of searches now happen through AI</li>
                <li>ChatGPT handles 500M daily requests</li>
              </ul>
              
              <table>
                <tr><th>Platform</th><th>Users</th></tr>
                <tr><td>ChatGPT</td><td>100M</td></tr>
              </table>
              
              <p>According to <a href="https://research.mit.edu">MIT research</a>...</p>
              
              <div class="author-bio">
                <h3>About the Author</h3>
                <p>Jane Smith is an AI researcher with 10 years of experience.</p>
              </div>
            </article>
          </main>
          <footer>
            <address>
              AI Corp, 123 Main St, San Francisco, CA
              <a href="tel:+14155551234">(415) 555-1234</a>
            </address>
          </footer>
        </body>
        </html>
      `;

      // Mock the axios response
      (axios.create as jest.Mock) = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: wellOptimizedHTML,
          headers: {
            'last-modified': new Date().toISOString(),
            'content-type': 'text/html',
          },
          status: 200,
        }),
      }));

      // Perform analysis
      const result = await analyzer.analyzeUrl('https://example.com');

      // Assertions
      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com/');
      expect(result.aiSearchScore).toBeGreaterThan(80); // Should score high
      expect(result.pageTitle).toBe('AI Search Optimization Guide');
      expect(result.scoringResult.recommendations.length).toBeLessThan(5); // Few recommendations

      // Verify pillar scores
      expect(result.scoringResult.pillarScores.RETRIEVAL).toBeGreaterThan(20);
      expect(result.scoringResult.pillarScores.FACT_DENSITY).toBeGreaterThan(15);
      expect(result.scoringResult.pillarScores.STRUCTURE).toBeGreaterThan(15);
      expect(result.scoringResult.pillarScores.TRUST).toBeGreaterThan(10);
      expect(result.scoringResult.pillarScores.RECENCY).toBeGreaterThan(5);
    });

    it('should analyze a poorly optimized website and return low score', async () => {
      // Mock a poorly optimized website
      const poorlyOptimizedHTML = `
        <html>
        <head><title>Home</title></head>
        <body>
          <div class="paywall-content">
            <p>Please subscribe to continue...</p>
          </div>
          <p>Short content.</p>
          <p>Short content.</p>
          <p>Short content.</p>
        </body>
        </html>
      `;

      (axios.create as jest.Mock) = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: poorlyOptimizedHTML,
          headers: {},
          status: 200,
        }),
      }));

      const result = await analyzer.analyzeUrl('https://example.com');

      // Assertions
      expect(result.aiSearchScore).toBeLessThan(50); // Should score low
      expect(result.scoringResult.recommendations.length).toBeGreaterThan(10); // Many recommendations

      // Check for specific issues
      const recommendationMetrics = result.scoringResult.recommendations.map((r) => r.metric);
      expect(recommendationMetrics).toContain('paywall'); // Should detect paywall
      expect(recommendationMetrics).toContain('uniqueStats'); // Should detect lack of facts
      expect(recommendationMetrics).toContain('structuredData'); // Should detect missing schema
    });

    it('should handle edge cases gracefully', async () => {
      // Test with minimal valid HTML
      const minimalHTML = '<html><body><p>Content</p></body></html>';

      (axios.create as jest.Mock) = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: minimalHTML,
          headers: {},
          status: 200,
        }),
      }));

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result).toBeDefined();
      expect(result.aiSearchScore).toBeGreaterThanOrEqual(0);
      expect(result.aiSearchScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      (axios.create as jest.Mock) = jest.fn(() => ({
        get: jest.fn().mockRejectedValue(new Error('Network error')),
      }));

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Network error');
    });

    it('should handle invalid URLs', async () => {
      await expect(analyzer.analyzeUrl('not-a-url')).rejects.toThrow('Invalid URL');
    });
  });

  describe('Recommendation quality', () => {
    it('should provide actionable recommendations', async () => {
      const htmlWithIssues = `
        <html>
        <head><title>Test</title></head>
        <body>
          <h1>Title</h1>
          <h4>Deep heading</h4>
          <p>Content without facts or data.</p>
        </body>
        </html>
      `;

      (axios.create as jest.Mock) = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          data: htmlWithIssues,
          headers: {},
          status: 200,
        }),
      }));

      const result = await analyzer.analyzeUrl('https://example.com');
      const recommendations = result.scoringResult.recommendations;

      // Check recommendation structure
      recommendations.forEach((rec) => {
        expect(rec.why).toBeTruthy();
        expect(rec.why.length).toBeLessThanOrEqual(100); // Concise why
        expect(rec.fix).toBeTruthy();
        expect(rec.fix).toMatch(/^[A-Z]/); // Starts with capital (imperative)
        expect(rec.gain).toBeGreaterThan(0);
        expect(rec.pillar).toBeTruthy();
      });
    });
  });
});
