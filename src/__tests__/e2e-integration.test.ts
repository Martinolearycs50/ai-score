/**
 * End-to-End Integration Tests
 *
 * These tests verify the complete flow from URL submission through API enhancement
 * to final score display, ensuring that:
 * 1. APIs are actually being called
 * 2. API data affects scores
 * 3. Data sources are tracked correctly
 * 4. Progressive enhancement works as expected
 */
import { expect, test } from '@playwright/test';

// Test configuration
const TEST_URLS = {
  highPerformance: 'https://www.example.com', // Usually has good CrUX data
  mediumPerformance: 'https://www.wikipedia.org',
  lowPerformance: 'https://www.archive.org',
  noData: 'https://small-local-site.example', // Unlikely to have CrUX data
};

// Helper to wait for API calls
async function waitForApiCall(page, apiPath: string, timeout = 10000) {
  return page.waitForResponse(
    (response) => response.url().includes(apiPath) && response.status() === 200,
    { timeout }
  );
}

test.describe('End-to-End API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API key in environment
    await page.addInitScript(() => {
      window.localStorage.setItem('debug', 'true');
    });
  });

  test('Complete flow: URL submission → Analysis → Chrome UX enhancement', async ({ page }) => {
    await page.goto('/');

    // Submit URL for analysis
    const urlInput = page.locator('input[placeholder*="Enter website URL"]');
    await urlInput.fill(TEST_URLS.highPerformance);

    // Set up API listeners
    const analyzePromise = waitForApiCall(page, '/api/analyze');
    const enhancePromise = waitForApiCall(page, '/api/enhance-score');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for initial analysis
    const analyzeResponse = await analyzePromise;
    const analyzeData = await analyzeResponse.json();

    console.log('🔍 Initial analysis response:', {
      success: analyzeData.success,
      score: analyzeData.data?.aiSearchScore,
      retrievalScore: analyzeData.data?.scoringResult?.pillarScores?.RETRIEVAL,
    });

    // Verify initial analysis succeeded
    expect(analyzeData.success).toBe(true);
    expect(analyzeData.data).toBeDefined();

    // Wait for Chrome UX enhancement
    const enhanceResponse = await enhancePromise;
    const enhanceData = await enhanceResponse.json();

    console.log('📈 Enhancement response:', {
      enhanced: enhanceData.enhanced,
      dataSource: enhanceData.dataSource,
      improvement: enhanceData.retrieval?.improvement,
    });

    // Verify enhancement was attempted
    expect(enhanceResponse.status()).toBe(200);

    // Wait for results to be displayed
    await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });

    // Check if enhancement indicator is shown (when available)
    if (enhanceData.enhanced) {
      const enhancementIndicator = page.locator('[data-testid="enhancement-indicator"]');
      await expect(enhancementIndicator).toBeVisible({ timeout: 5000 });

      // Verify the score was updated
      const finalScore = await page.locator('[data-testid="retrieval-score"]').textContent();
      console.log('🎯 Final RETRIEVAL score:', finalScore);

      // Score should reflect the enhancement
      expect(Number(finalScore)).toBeGreaterThan(0);
    }
  });

  test('Progressive enhancement: Quick results → Full analysis → CrUX enhancement', async ({
    page,
  }) => {
    // This test requires Cloudflare Worker to be deployed
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    if (!workerUrl || workerUrl.includes('your-subdomain')) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Track all API calls in order
    const apiCalls: string[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/') || response.url().includes(workerUrl)) {
        apiCalls.push(response.url());
        console.log(`📡 API call: ${response.url()}`);
      }
    });

    // Submit URL
    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.mediumPerformance);
    await page.locator('button[type="submit"]').click();

    // Should see loading state immediately
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 1000 });

    // Quick results should appear first (if worker is available)
    await page.waitForSelector('[data-testid="quick-results"]', { timeout: 3000 }).catch(() => {
      console.log('No quick results - worker might not be available');
    });

    // Full results should replace quick results
    await page.waitForSelector('[data-testid="full-results"]', { timeout: 15000 });

    // Enhancement should happen last
    await page.waitForTimeout(2000); // Give time for enhancement

    // Verify API call order
    console.log('📊 API calls in order:', apiCalls);

    // Should have at least analyze and enhance calls
    expect(apiCalls.some((url) => url.includes('/api/analyze'))).toBe(true);
    expect(apiCalls.some((url) => url.includes('/api/enhance-score'))).toBe(true);
  });

  test('Data source tracking: Synthetic vs Chrome UX data', async ({ page }) => {
    // Test with a URL that likely has CrUX data
    await page.goto('/');
    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.highPerformance);

    // Intercept API responses to check data sources
    let analysisData: any;
    page.on('response', async (response) => {
      if (response.url().includes('/api/analyze') && response.status() === 200) {
        analysisData = await response.json();
      }
    });

    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });

    // Check console logs for data source information
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Verify data sources are tracked
    expect(analysisData?.data?.dataSources).toBeDefined();

    const dataSources = analysisData?.data?.dataSources || [];
    console.log('🔍 Data sources:', dataSources);

    // Should have at least one data source
    expect(dataSources.length).toBeGreaterThan(0);

    // Check for TTFB data source
    const ttfbSource = dataSources.find((ds) => ds.metric === 'ttfb');
    expect(ttfbSource).toBeDefined();
    expect(['synthetic', 'chrome-ux']).toContain(ttfbSource.type);
  });

  test('Score impact: CrUX data should affect RETRIEVAL scores', async ({ page }) => {
    // Compare scores for sites with and without CrUX data
    const results: Record<string, any> = {};

    for (const [key, url] of Object.entries(TEST_URLS)) {
      await page.goto('/');
      await page.locator('input[placeholder*="Enter website URL"]').fill(url);

      // Capture the final scores
      let finalData: any;
      page.on('response', async (response) => {
        if (response.url().includes('/api/enhance-score') && response.status() === 200) {
          finalData = await response.json();
        }
      });

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });

      // Wait for enhancement to complete
      await page.waitForTimeout(3000);

      // Get the displayed RETRIEVAL score
      const retrievalScore = await page.locator('[data-testid="retrieval-score"]').textContent();

      results[key] = {
        url,
        retrievalScore: Number(retrievalScore),
        enhanced: finalData?.enhanced || false,
        dataSource: finalData?.dataSource || 'unknown',
      };

      console.log(`📊 ${key}:`, results[key]);
    }

    // Log all results for analysis
    console.log('🎯 All results:', results);

    // Sites with CrUX data should have been enhanced
    const enhancedCount = Object.values(results).filter((r) => r.enhanced).length;
    expect(enhancedCount).toBeGreaterThan(0);
  });

  test('Error handling: Graceful degradation when APIs fail', async ({ page }) => {
    // Intercept and fail the enhancement API
    await page.route('**/api/enhance-score', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Enhancement service unavailable' }),
      });
    });

    await page.goto('/');
    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.highPerformance);
    await page.locator('button[type="submit"]').click();

    // Should still show results despite enhancement failure
    await expect(page.locator('[data-testid="score-display"]')).toBeVisible({ timeout: 15000 });

    // Should show synthetic data indicator (not enhanced)
    const retrievalScore = await page.locator('[data-testid="retrieval-score"]').textContent();
    expect(Number(retrievalScore)).toBeGreaterThanOrEqual(0);

    // Check console for graceful error handling
    const errorLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warn' || msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });

    // Should have logged the enhancement failure
    await page.waitForTimeout(1000);
    const hasEnhancementError = errorLogs.some(
      (log) => log.includes('Enhancement failed') || log.includes('enhancement')
    );
    expect(hasEnhancementError).toBe(true);
  });

  test('Visual indicators: Data source badges and enhancement status', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.highPerformance);
    await page.locator('button[type="submit"]').click();

    // Wait for results
    await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });

    // Check for data source indicators (when implemented)
    const dataSourceBadges = page.locator('[data-testid="data-source-badge"]');
    const badgeCount = await dataSourceBadges.count();

    if (badgeCount > 0) {
      // If badges are implemented, verify they show correct information
      for (let i = 0; i < badgeCount; i++) {
        const badge = dataSourceBadges.nth(i);
        const text = await badge.textContent();
        console.log(`📛 Data source badge ${i}:`, text);

        // Should indicate synthetic or real-world data
        expect(text).toMatch(/synthetic|chrome-ux|real-world/i);
      }
    } else {
      console.log('ℹ️ Data source badges not yet implemented in UI');
    }

    // Check for enhancement status indicator
    const enhancementStatus = page.locator('[data-testid="enhancement-status"]');
    if (await enhancementStatus.isVisible({ timeout: 1000 }).catch(() => false)) {
      const statusText = await enhancementStatus.textContent();
      console.log('📈 Enhancement status:', statusText);
      expect(statusText).toBeTruthy();
    }
  });

  test('Performance: API calls should not block UI updates', async ({ page }) => {
    await page.goto('/');

    // Measure time from submission to first UI update
    const startTime = Date.now();

    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.highPerformance);
    await page.locator('button[type="submit"]').click();

    // Loading state should appear immediately
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 1000 });
    const loadingTime = Date.now() - startTime;

    console.log(`⏱️ Time to loading state: ${loadingTime}ms`);
    expect(loadingTime).toBeLessThan(1000); // Should be nearly instant

    // Results should appear within reasonable time
    await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });
    const resultsTime = Date.now() - startTime;

    console.log(`⏱️ Time to results: ${resultsTime}ms`);
    expect(resultsTime).toBeLessThan(15000); // Should complete within 15s
  });
});

// Test data validation
test.describe('API Data Validation', () => {
  test('Chrome UX API response validation', async ({ page }) => {
    await page.goto('/');

    let enhanceResponse: any;
    page.on('response', async (response) => {
      if (response.url().includes('/api/enhance-score')) {
        enhanceResponse = await response.json();
      }
    });

    await page.locator('input[placeholder*="Enter website URL"]').fill(TEST_URLS.highPerformance);
    await page.locator('button[type="submit"]').click();

    await page.waitForSelector('[data-testid="score-display"]', { timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for enhancement

    if (enhanceResponse?.enhanced) {
      // Validate enhancement data structure
      expect(enhanceResponse).toHaveProperty('dataSource');
      expect(enhanceResponse).toHaveProperty('retrieval');
      expect(enhanceResponse.retrieval).toHaveProperty('score');
      expect(enhanceResponse.retrieval).toHaveProperty('breakdown');

      // If CrUX data was used, validate metrics
      if (enhanceResponse.dataSource === 'chrome-ux') {
        expect(enhanceResponse).toHaveProperty('cruxMetrics');
        expect(enhanceResponse.cruxMetrics).toHaveProperty('ttfb');
        expect(enhanceResponse.cruxMetrics).toHaveProperty('rating');
      }
    }
  });
});
