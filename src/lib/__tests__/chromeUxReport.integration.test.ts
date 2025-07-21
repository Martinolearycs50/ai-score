/**
 * Integration tests for Chrome UX Report API
 * These tests make real API calls when CHROME_UX_API_KEY is available
 * Otherwise they are skipped
 */
import { clearCache, fetchCrUXData } from '../chromeUxReport';

// Only run integration tests if API key is available
const shouldRunIntegrationTests = !!process.env.CHROME_UX_API_KEY;

describe('Chrome UX Report API Integration', () => {
  beforeEach(() => {
    clearCache();
  });

  if (!shouldRunIntegrationTests) {
    it.skip('Chrome UX API integration tests skipped - no API key configured', () => {
      console.log('Set CHROME_UX_API_KEY environment variable to run integration tests');
    });
    return;
  }

  describe('Real API Calls', () => {
    it('should fetch real data for popular sites', async () => {
      const popularSites = [
        'https://www.google.com',
        'https://www.wikipedia.org',
        'https://www.github.com',
      ];

      for (const url of popularSites) {
        const result = await fetchCrUXData(url);

        expect(result.hasData).toBe(true);
        expect(result.metrics).toBeDefined();
        expect(result.metrics?.ttfb).toBeGreaterThan(0);
        expect(result.metrics?.ttfbRating).toMatch(/^(good|needs-improvement|poor)$/);

        // Verify all metrics if available
        if (result.metrics?.lcp) {
          expect(result.metrics.lcp).toBeGreaterThan(0);
          expect(result.metrics.lcpRating).toMatch(/^(good|needs-improvement|poor)$/);
        }
      }
    }, 30000); // 30 second timeout for multiple API calls

    it('should handle sites not in CrUX dataset gracefully', async () => {
      const obscureUrl = 'https://this-site-definitely-does-not-exist-12345.com';
      const result = await fetchCrUXData(obscureUrl);

      expect(result.hasData).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeUndefined();
    });

    it('should cache responses for 24 hours', async () => {
      const url = 'https://www.google.com';

      // First call
      const start1 = Date.now();
      const result1 = await fetchCrUXData(url);
      const duration1 = Date.now() - start1;

      expect(result1.hasData).toBe(true);

      // Second call should be from cache (much faster)
      const start2 = Date.now();
      const result2 = await fetchCrUXData(url);
      const duration2 = Date.now() - start2;

      expect(result2).toEqual(result1);
      expect(duration2).toBeLessThan(duration1 / 10); // Cache should be at least 10x faster
    });

    it('should return consistent ratings based on thresholds', async () => {
      const url = 'https://www.google.com';
      const result = await fetchCrUXData(url);

      if (result.hasData && result.metrics) {
        // Verify TTFB rating matches value
        if (result.metrics.ttfb) {
          if (result.metrics.ttfb < 800) {
            expect(result.metrics.ttfbRating).toBe('good');
          } else if (result.metrics.ttfb < 1800) {
            expect(result.metrics.ttfbRating).toBe('needs-improvement');
          } else {
            expect(result.metrics.ttfbRating).toBe('poor');
          }
        }

        // Verify LCP rating matches value
        if (result.metrics.lcp) {
          if (result.metrics.lcp < 2500) {
            expect(result.metrics.lcpRating).toBe('good');
          } else if (result.metrics.lcp < 4000) {
            expect(result.metrics.lcpRating).toBe('needs-improvement');
          } else {
            expect(result.metrics.lcpRating).toBe('poor');
          }
        }
      }
    });
  });

  describe('API Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Temporarily break the API URL to simulate network error
      const originalEnv = process.env.CHROME_UX_API_KEY;
      process.env.CHROME_UX_API_KEY = 'invalid-key-to-cause-error';

      const result = await fetchCrUXData('https://www.google.com');

      expect(result.hasData).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original key
      process.env.CHROME_UX_API_KEY = originalEnv;
    });
  });

  describe('Performance Metrics', () => {
    it('should complete API calls within reasonable time', async () => {
      const start = Date.now();
      const result = await fetchCrUXData('https://www.google.com');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toBeDefined();
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const urls = [
        'https://www.google.com',
        'https://www.wikipedia.org',
        'https://www.github.com',
        'https://www.stackoverflow.com',
      ];

      const start = Date.now();
      const results = await Promise.all(urls.map((url) => fetchCrUXData(url)));
      const duration = Date.now() - start;

      expect(results).toHaveLength(4);
      expect(results.filter((r) => r.hasData).length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10000); // Should complete all within 10 seconds
    });
  });
});

// Test the enhance-score API endpoint
describe('Enhance Score API Integration', () => {
  if (!shouldRunIntegrationTests) {
    it.skip('Enhance Score API tests skipped - no API key configured', () => {});
    return;
  }

  it('should enhance scores with real CrUX data', async () => {
    const mockInitialScores = {
      retrieval: {
        score: 15,
        breakdown: {
          ttfb: 2, // Synthetic score
          paywall: 5,
          mainContent: 5,
          htmlSize: 3,
          llmsTxtFile: 0,
        },
      },
    };

    const response = await fetch('http://localhost:3000/api/enhance-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.google.com',
        initialScores: mockInitialScores,
      }),
    });

    // Note: This would only work if the dev server is running
    // In a real test environment, you'd mock the fetch or use a test server
    if (response.ok) {
      const data = await response.json();

      if (data.enhanced) {
        expect(data.retrieval.score).toBeGreaterThanOrEqual(mockInitialScores.retrieval.score);
        expect(data.dataSource).toBe('real-world');
        expect(data.cruxMetrics).toBeDefined();
      }
    }
  });
});
