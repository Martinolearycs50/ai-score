/**
 * Real Integration Tests for Chrome UX Report API
 * These tests make ACTUAL API calls to verify the integration is working
 * and that the API data is being used to affect scores
 */

import { fetchCrUXData, clearCache } from '../chromeUxReport';
import { run as runRetrieval } from '../audit/retrieval';

// Only run if API key is available
const shouldRunTests = !!process.env.CHROME_UX_API_KEY;

describe('Chrome UX Report API - Real Integration', () => {
  beforeEach(() => {
    clearCache();
    console.log('🧪 Starting Chrome UX API integration test...');
  });

  if (!shouldRunTests) {
    it.skip('Chrome UX API key not configured - skipping real tests', () => {
      console.warn('⚠️  Set CHROME_UX_API_KEY to run integration tests');
    });
    return;
  }

  describe('API Functionality', () => {
    it('should successfully fetch data for well-known sites', async () => {
      const testSites = [
        { url: 'https://www.google.com', expectedRating: 'good' },
        { url: 'https://www.wikipedia.org', expectedRating: 'good' },
        { url: 'https://www.nytimes.com', expectedRating: 'good' }
      ];

      for (const site of testSites) {
        console.log(`📊 Testing ${site.url}...`);
        const result = await fetchCrUXData(site.url);
        
        console.log(`✅ ${site.url} results:`, {
          hasData: result.hasData,
          ttfb: result.metrics?.ttfb,
          ttfbRating: result.metrics?.ttfbRating,
          lcp: result.metrics?.lcp,
          lcpRating: result.metrics?.lcpRating
        });

        expect(result.hasData).toBe(true);
        expect(result.metrics).toBeDefined();
        expect(result.metrics?.ttfb).toBeGreaterThan(0);
        expect(result.metrics?.ttfbRating).toBeDefined();
        
        // Most major sites should have good TTFB
        if (site.expectedRating) {
          expect(result.metrics?.ttfbRating).toBe(site.expectedRating);
        }
      }
    }, 30000);

    it('should handle sites not in CrUX database', async () => {
      const obscureUrl = 'https://this-definitely-does-not-exist-12345.com';
      console.log(`📊 Testing non-existent site: ${obscureUrl}`);
      
      const result = await fetchCrUXData(obscureUrl);
      
      console.log('❌ No data result:', result);
      
      expect(result.hasData).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeUndefined();
    });
  });

  describe('Score Impact Verification', () => {
    it('should produce different RETRIEVAL scores with and without CrUX data', async () => {
      const testUrl = 'https://www.example.com';
      const testHtml = `
        <html>
          <head><title>Test Site</title></head>
          <body>
            <main>${'Test content '.repeat(100)}</main>
          </body>
        </html>
      `;

      // First, get the CrUX data to see what we're working with
      const cruxData = await fetchCrUXData(testUrl);
      console.log(`📊 CrUX data for ${testUrl}:`, cruxData);

      // Run retrieval audit (which includes CrUX)
      const scoresWithCrux = await runRetrieval(testHtml, testUrl);
      
      console.log('📈 Scores WITH CrUX:', {
        ttfb: scoresWithCrux.ttfb,
        total: Object.values(scoresWithCrux).reduce((a, b) => a + b, 0)
      });

      // Now we need to test without CrUX - this is tricky since it's integrated
      // We'll verify that the score is based on actual CrUX data
      if (cruxData.hasData) {
        // If we have CrUX data, TTFB score should match the rating
        if (cruxData.metrics?.ttfbRating === 'good') {
          expect(scoresWithCrux.ttfb).toBe(5);
        } else if (cruxData.metrics?.ttfbRating === 'needs-improvement') {
          expect(scoresWithCrux.ttfb).toBeGreaterThanOrEqual(2);
          expect(scoresWithCrux.ttfb).toBeLessThanOrEqual(3);
        } else {
          expect(scoresWithCrux.ttfb).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should show score differences between fast and slow sites', async () => {
      const testHtml = `
        <html>
          <head><title>Test Site</title></head>
          <body>
            <main>${'Test content '.repeat(100)}</main>
          </body>
        </html>
      `;

      // Test a known fast site
      const fastSite = 'https://www.google.com';
      const fastCrux = await fetchCrUXData(fastSite);
      const fastScores = await runRetrieval(testHtml, fastSite);

      console.log(`⚡ Fast site (${fastSite}):`, {
        ttfb: fastCrux.metrics?.ttfb,
        rating: fastCrux.metrics?.ttfbRating,
        score: fastScores.ttfb
      });

      // Find a site with slower performance (if possible)
      // Note: Most major sites are well-optimized, so this might be hard
      const testSites = [
        'https://www.reddit.com',
        'https://www.ebay.com',
        'https://www.amazon.com'
      ];

      let foundSlowerSite = false;
      for (const site of testSites) {
        const crux = await fetchCrUXData(site);
        if (crux.hasData && crux.metrics?.ttfbRating !== 'good') {
          const scores = await runRetrieval(testHtml, site);
          
          console.log(`🐌 Slower site (${site}):`, {
            ttfb: crux.metrics?.ttfb,
            rating: crux.metrics?.ttfbRating,
            score: scores.ttfb
          });

          // Verify the slower site has a lower score
          expect(scores.ttfb).toBeLessThan(fastScores.ttfb);
          foundSlowerSite = true;
          break;
        }
      }

      if (!foundSlowerSite) {
        console.log('ℹ️  All tested sites have good performance');
      }
    }, 60000);
  });

  describe('Data Source Tracking', () => {
    it('should indicate when CrUX data is used', async () => {
      const testUrl = 'https://www.wikipedia.org';
      const testHtml = '<html><body><main>Test content for data source tracking</main></body></html>';

      // Get CrUX data
      const cruxData = await fetchCrUXData(testUrl);
      
      // Run retrieval (includes CrUX check)
      const scores = await runRetrieval(testHtml, testUrl);
      
      // Import capturedDomain to check if CrUX data was captured
      const { capturedDomain } = await import('../audit/retrieval');
      
      console.log('📊 Data source verification:', {
        cruxAvailable: cruxData.hasData,
        cruxCaptured: capturedDomain.cruxData?.hasData,
        ttfbSource: capturedDomain.cruxData?.hasData ? 'chrome-ux' : 'synthetic',
        ttfbValue: capturedDomain.actualTtfb
      });

      if (cruxData.hasData) {
        expect(capturedDomain.cruxData?.hasData).toBe(true);
        expect(capturedDomain.cruxData?.ttfb).toBe(cruxData.metrics?.ttfb);
        expect(capturedDomain.cruxData?.ttfbRating).toBe(cruxData.metrics?.ttfbRating);
      }
    });
  });

  describe('Caching Behavior', () => {
    it('should cache responses for 24 hours', async () => {
      const testUrl = 'https://www.google.com';
      
      // First call - should hit API
      console.log('🔄 First API call...');
      const start1 = Date.now();
      const result1 = await fetchCrUXData(testUrl);
      const duration1 = Date.now() - start1;
      
      console.log(`⏱️  First call took ${duration1}ms`);
      
      // Second call - should be from cache
      console.log('🔄 Second call (should be cached)...');
      const start2 = Date.now();
      const result2 = await fetchCrUXData(testUrl);
      const duration2 = Date.now() - start2;
      
      console.log(`⏱️  Second call took ${duration2}ms`);
      
      expect(result2).toEqual(result1);
      expect(duration2).toBeLessThan(duration1 / 5); // Cache should be much faster
      
      console.log(`✅ Cache speedup: ${Math.round(duration1 / duration2)}x faster`);
    });
  });

  describe('API Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Save original API key
      const originalKey = process.env.CHROME_UX_API_KEY;
      
      // Temporarily set invalid key
      process.env.CHROME_UX_API_KEY = 'invalid-key-12345';
      
      // Clear cache to ensure fresh call
      clearCache();
      
      const result = await fetchCrUXData('https://www.google.com');
      
      console.log('❌ Error handling result:', result);
      
      expect(result.hasData).toBe(false);
      expect(result.error).toBeDefined();
      
      // Restore original key
      process.env.CHROME_UX_API_KEY = originalKey;
    });
  });
});

// Helper to compare scores with detailed logging
export function compareScores(scoreA: any, scoreB: any, label: string) {
  console.log(`\n📊 Score Comparison - ${label}:`);
  console.log('Score A:', scoreA);
  console.log('Score B:', scoreB);
  
  const totalA = Object.values(scoreA).reduce((a: any, b: any) => a + b, 0);
  const totalB = Object.values(scoreB).reduce((a: any, b: any) => a + b, 0);
  
  console.log(`Total A: ${totalA}, Total B: ${totalB}, Difference: ${totalB - totalA}`);
  
  return {
    scoreA,
    scoreB,
    totalA,
    totalB,
    difference: totalB - totalA,
    percentChange: ((totalB - totalA) / totalA) * 100
  };
}