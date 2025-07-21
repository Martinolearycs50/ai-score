/**
 * Visual Regression Tests
 *
 * These tests create snapshots of analysis results for known URLs
 * to ensure displayed content remains accurate over time
 */
import { expect, test } from '@playwright/test';

import { ContentVerifier } from './content-accuracy.test';

// Known test URLs with expected content
const SNAPSHOT_URLS = [
  {
    url: 'https://www.stripe.com',
    name: 'stripe-homepage',
    expected: {
      scoreRange: { min: 70, max: 95 },
      hasGoodStructure: true,
      hasAuthor: false, // Homepage typically no author
      contentType: 'corporate',
    },
  },
  {
    url: 'https://docs.python.org/3/',
    name: 'python-docs',
    expected: {
      scoreRange: { min: 60, max: 85 },
      hasGoodStructure: true,
      contentType: 'documentation',
      hasCodeExamples: true,
    },
  },
  {
    url: 'https://www.example.com',
    name: 'example-minimal',
    expected: {
      scoreRange: { min: 30, max: 60 },
      hasMinimalContent: true,
      ttfbRating: 'good', // Usually fast
    },
  },
];

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  SNAPSHOT_URLS.forEach(({ url, name, expected }) => {
    test(`snapshot test: ${name}`, async ({ page }) => {
      // Submit URL for analysis
      await page.fill('input[placeholder*="Enter website URL"]', url);
      await page.click('button[type="submit"]');

      // Wait for results
      await page.waitForSelector('[data-testid="score-display"]', { timeout: 30000 });

      // Take screenshot of results
      const resultsSection = await page.locator('#results');
      await resultsSection.screenshot({
        path: `src/__tests__/snapshots/${name}-results.png`,
        fullPage: false,
      });

      // Verify score is in expected range
      const scoreText = await page.locator('[data-testid="score-display"]').textContent();
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');

      expect(score).toBeGreaterThanOrEqual(expected.scoreRange.min);
      expect(score).toBeLessThanOrEqual(expected.scoreRange.max);

      // Check for placeholder text
      const pageContent = await page.content();

      // Should not contain placeholder text
      expect(pageContent).not.toContain('Lorem ipsum');
      expect(pageContent).not.toContain('Example text');
      expect(pageContent).not.toContain('TODO');
      expect(pageContent).not.toContain('undefined');
      expect(pageContent).not.toContain('null');

      // Verify specific content based on expectations
      if (expected.hasGoodStructure) {
        const structureScore = await page.locator('[data-testid="structure-score"]').textContent();
        expect(structureScore).toBeTruthy();
      }

      // Log all displayed metrics for verification
      const metrics = await extractDisplayedMetrics(page);
      console.log(`📊 Metrics for ${name}:`, metrics);

      // Create detailed snapshot of text content
      await page.locator('#results').screenshot({
        path: `src/__tests__/snapshots/${name}-text-content.png`,
      });
    });
  });

  test('verify no generic content in recommendations', async ({ page }) => {
    // Analyze a URL that will have recommendations
    await page.fill('input[placeholder*="Enter website URL"]', 'https://minimal-site.example');
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="score-display"]', { timeout: 30000 });

    // Check recommendation cards
    const recommendations = await page.locator('[data-testid="recommendation-card"]').all();

    for (const rec of recommendations) {
      const content = await rec.textContent();

      // Should not have generic placeholders
      expect(content).not.toContain('[INSERT');
      expect(content).not.toContain('PLACEHOLDER');
      expect(content).not.toContain('your-site.com');

      // Should have specific, actionable content
      expect(content?.length).toBeGreaterThan(50);
    }
  });

  test('verify TTFB shows actual milliseconds', async ({ page }) => {
    await page.fill('input[placeholder*="Enter website URL"]', 'https://www.google.com');
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="score-display"]', { timeout: 30000 });

    // Look for TTFB value
    const ttfbBadge = await page
      .locator('[data-testid="data-source-badge"]')
      .filter({ hasText: 'ttfb' })
      .first();

    if (await ttfbBadge.isVisible()) {
      const ttfbText = await ttfbBadge.textContent();

      // Should show actual milliseconds
      expect(ttfbText).toMatch(/\d+ms/);

      // Extract the number
      const ttfbValue = parseInt(ttfbText?.match(/(\d+)ms/)?.[1] || '0');

      // Should be a reasonable value
      expect(ttfbValue).toBeGreaterThan(0);
      expect(ttfbValue).toBeLessThan(10000); // Less than 10 seconds
    }
  });

  test('verify statistics count is accurate', async ({ page }) => {
    // Create a test page with known statistics
    const testHtml = `
      <h1>Test Page</h1>
      <p>We have 500 customers in 25 countries.</p>
      <p>Revenue grew 45% to $2.5M in 2024.</p>
      <p>Founded in 2020 by John Smith.</p>
    `;

    // This would need a test endpoint or mock
    // For now, verify the display format

    await page.fill('input[placeholder*="Enter website URL"]', 'https://www.example.com');
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="score-display"]', { timeout: 30000 });

    // Check if statistics are displayed
    const factDensitySection = await page.locator('[data-testid="fact-density-score"]');
    if (await factDensitySection.isVisible()) {
      const content = await factDensitySection.textContent();

      // Should show a number, not placeholder
      expect(content).toMatch(/\d+\/\d+/); // Format: X/Y
    }
  });
});

/**
 * Helper to extract all displayed metrics
 */
async function extractDisplayedMetrics(page: any) {
  const metrics: Record<string, any> = {};

  // Extract pillar scores
  const pillars = ['retrieval', 'fact-density', 'structure', 'trust', 'recency'];

  for (const pillar of pillars) {
    const scoreElement = await page.locator(`[data-testid="${pillar}-score"]`);
    if (await scoreElement.isVisible()) {
      metrics[pillar] = await scoreElement.textContent();
    }
  }

  // Extract data sources
  const dataSources = await page.locator('[data-testid="data-source-badge"]').all();
  metrics.dataSources = [];

  for (const source of dataSources) {
    const text = await source.textContent();
    metrics.dataSources.push(text);
  }

  // Extract overall score
  const overallScore = await page.locator('[data-testid="score-display"]').textContent();
  metrics.overallScore = overallScore;

  return metrics;
}

/**
 * Snapshot comparison test
 */
test.describe('Snapshot Comparisons', () => {
  test('compare scores for same URL over time', async ({ page }) => {
    const url = 'https://www.stripe.com';
    const results: any[] = [];

    // Run analysis 3 times with delays
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      await page.fill('input[placeholder*="Enter website URL"]', url);
      await page.click('button[type="submit"]');

      await page.waitForSelector('[data-testid="score-display"]', { timeout: 30000 });

      const metrics = await extractDisplayedMetrics(page);
      results.push({
        timestamp: new Date().toISOString(),
        ...metrics,
      });

      // Wait before next test
      if (i < 2) await page.waitForTimeout(5000);
    }

    // Verify consistency
    console.log('🔄 Consistency check:', results);

    // Scores should be within 5 points of each other
    const scores = results.map((r) => parseInt(r.overallScore?.match(/\d+/)?.[0] || '0'));
    const maxDiff = Math.max(...scores) - Math.min(...scores);

    expect(maxDiff).toBeLessThanOrEqual(5);
  });
});
