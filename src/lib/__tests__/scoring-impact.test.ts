/**
 * Score Impact Verification Tests
 * These tests prove that Chrome UX API data actually affects the final scores
 */

import { run as runRetrieval, capturedDomain } from '../audit/retrieval';
import { fetchCrUXData, clearCache } from '../chromeUxReport';
import { scoreAnalysis } from '../scorer-new';
import type { AuditResult } from '../types';

// Mock the Chrome UX module to control when it's used
jest.mock('../chromeUxReport', () => ({
  ...jest.requireActual('../chromeUxReport'),
  fetchCrUXData: jest.fn()
}));

const mockedFetchCrUXData = fetchCrUXData as jest.MockedFunction<typeof fetchCrUXData>;

describe('Chrome UX API Score Impact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  describe('RETRIEVAL Score Changes', () => {
    const testHtml = `
      <html>
        <head>
          <title>Test Page for Score Impact</title>
          <meta name="description" content="Testing Chrome UX impact on scores">
        </head>
        <body>
          <main>${'This is test content that needs to be long enough to meet the 70% threshold requirement. '.repeat(20)}</main>
        </body>
      </html>
    `;

    it('should have higher TTFB score with good CrUX data', async () => {
      const testUrl = 'https://example.com';

      // Test 1: With GOOD CrUX data
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: testUrl,
        hasData: true,
        metrics: {
          ttfb: 400, // Good TTFB
          ttfbRating: 'good',
          lcp: 1500,
          lcpRating: 'good'
        }
      });

      const scoresWithGoodCrux = await runRetrieval(testHtml, testUrl);
      
      console.log('✅ Scores with GOOD CrUX data:', {
        ttfb: scoresWithGoodCrux.ttfb,
        capturedTtfb: capturedDomain.actualTtfb,
        rating: capturedDomain.cruxData?.ttfbRating
      });

      expect(scoresWithGoodCrux.ttfb).toBe(5); // Full points for good rating
    });

    it('should have lower TTFB score with poor CrUX data', async () => {
      const testUrl = 'https://example.com';

      // Test 2: With POOR CrUX data
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: testUrl,
        hasData: true,
        metrics: {
          ttfb: 3500, // Poor TTFB
          ttfbRating: 'poor'
        }
      });

      const scoresWithPoorCrux = await runRetrieval(testHtml, testUrl);
      
      console.log('❌ Scores with POOR CrUX data:', {
        ttfb: scoresWithPoorCrux.ttfb,
        capturedTtfb: capturedDomain.actualTtfb,
        rating: capturedDomain.cruxData?.ttfbRating
      });

      expect(scoresWithPoorCrux.ttfb).toBeLessThanOrEqual(1); // Low points for poor rating
    });

    it('should use synthetic fallback when no CrUX data available', async () => {
      const testUrl = 'https://example.com';

      // Test 3: No CrUX data available
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: testUrl,
        hasData: false,
        error: 'No Chrome UX Report data available for this URL'
      });

      // Also mock axios for synthetic measurement
      const axios = require('axios');
      jest.spyOn(axios, 'get').mockImplementation(() => {
        return new Promise((resolve) => {
          const stream = {
            once: (event: string, callback: Function) => {
              if (event === 'data') {
                setTimeout(() => callback(), 150); // Simulate 150ms TTFB
              }
            },
            destroy: jest.fn()
          };
          resolve({ data: stream });
        });
      });

      const scoresWithoutCrux = await runRetrieval(testHtml, testUrl);
      
      console.log('🔄 Scores with SYNTHETIC fallback:', {
        ttfb: scoresWithoutCrux.ttfb,
        capturedTtfb: capturedDomain.actualTtfb,
        hasCruxData: capturedDomain.cruxData?.hasData
      });

      expect(scoresWithoutCrux.ttfb).toBe(5); // 150ms < 200ms = 5 points
      expect(capturedDomain.cruxData?.hasData).toBeUndefined();
    });
  });

  describe('Full Analysis Score Impact', () => {
    it('should show total score difference with enhanced data', async () => {
      const mockAuditResult: AuditResult = {
        scores: {
          RETRIEVAL: { raw: 15, weighted: 15 },
          FACT_DENSITY: { raw: 20, weighted: 20 },
          STRUCTURE: { raw: 25, weighted: 25 },
          TRUST: { raw: 15, weighted: 15 },
          RECENCY: { raw: 10, weighted: 10 }
        },
        breakdown: {
          RETRIEVAL: { ttfb: 2, paywall: 5, mainContent: 5, htmlSize: 3, llmsTxtFile: 0 },
          FACT_DENSITY: {},
          STRUCTURE: {},
          TRUST: {},
          RECENCY: {}
        },
        pageType: 'homepage',
        dynamicWeights: {
          RETRIEVAL: 0.35,
          FACT_DENSITY: 0.15,
          STRUCTURE: 0.25,
          TRUST: 0.15,
          RECENCY: 0.10
        }
      };

      // Score without enhancement
      const baseScoring = scoreAnalysis(mockAuditResult, {
        title: 'Test Site',
        url: 'https://example.com',
        wordCount: 500
      });

      console.log('📊 Base score (without enhancement):', {
        total: baseScoring.totalScore,
        retrieval: baseScoring.pillarScores.RETRIEVAL
      });

      // Simulate enhanced RETRIEVAL score
      const enhancedAuditResult = {
        ...mockAuditResult,
        scores: {
          ...mockAuditResult.scores,
          RETRIEVAL: { raw: 20, weighted: 20 } // +5 from CrUX
        },
        breakdown: {
          ...mockAuditResult.breakdown,
          RETRIEVAL: { ...mockAuditResult.breakdown.RETRIEVAL, ttfb: 5 } // Enhanced TTFB
        }
      };

      const enhancedScoring = scoreAnalysis(enhancedAuditResult, {
        title: 'Test Site',
        url: 'https://example.com',
        wordCount: 500
      });

      console.log('📊 Enhanced score (with CrUX):', {
        total: enhancedScoring.totalScore,
        retrieval: enhancedScoring.pillarScores.RETRIEVAL,
        improvement: enhancedScoring.totalScore - baseScoring.totalScore
      });

      // Verify enhancement improves score
      expect(enhancedScoring.totalScore).toBeGreaterThan(baseScoring.totalScore);
      expect(enhancedScoring.pillarScores.RETRIEVAL).toBeGreaterThan(baseScoring.pillarScores.RETRIEVAL);
    });
  });

  describe('Data Source Tracking', () => {
    it('should track when CrUX data is used', async () => {
      const testUrl = 'https://example.com';
      const testHtml = '<html><body><main>Test content for tracking</main></body></html>';

      // Mock CrUX data
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: testUrl,
        hasData: true,
        metrics: {
          ttfb: 600,
          ttfbRating: 'good',
          lcp: 2000,
          lcpRating: 'good'
        }
      });

      await runRetrieval(testHtml, testUrl);

      // Verify data source is tracked
      expect(capturedDomain.cruxData).toBeDefined();
      expect(capturedDomain.cruxData?.hasData).toBe(true);
      expect(capturedDomain.cruxData?.ttfb).toBe(600);
      expect(capturedDomain.cruxData?.ttfbRating).toBe('good');

      console.log('📊 Data source tracking:', {
        dataSource: capturedDomain.cruxData?.hasData ? 'chrome-ux' : 'synthetic',
        ttfbValue: capturedDomain.actualTtfb,
        ttfbRating: capturedDomain.cruxData?.ttfbRating
      });
    });

    it('should track when synthetic fallback is used', async () => {
      const testUrl = 'https://example.com';
      const testHtml = '<html><body><main>Test content for tracking</main></body></html>';

      // Mock no CrUX data
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: testUrl,
        hasData: false,
        error: 'No data available'
      });

      await runRetrieval(testHtml, testUrl);

      // Verify synthetic fallback is tracked
      expect(capturedDomain.cruxData?.hasData).toBeFalsy();
      
      console.log('🔄 Synthetic fallback tracking:', {
        dataSource: 'synthetic',
        ttfbValue: capturedDomain.actualTtfb,
        hasCruxData: false
      });
    });
  });

  describe('Score Granularity', () => {
    const testCases = [
      { ttfb: 500, rating: 'good', expectedScore: 5 },
      { ttfb: 1000, rating: 'needs-improvement', expectedScore: 3 },
      { ttfb: 1500, rating: 'needs-improvement', expectedScore: 2 },
      { ttfb: 2500, rating: 'poor', expectedScore: 1 },
      { ttfb: 4000, rating: 'poor', expectedScore: 0 }
    ];

    testCases.forEach(({ ttfb, rating, expectedScore }) => {
      it(`should score ${expectedScore} for TTFB ${ttfb}ms (${rating})`, async () => {
        const testUrl = 'https://example.com';
        const testHtml = '<html><body><main>Test content</main></body></html>';

        mockedFetchCrUXData.mockResolvedValueOnce({
          url: testUrl,
          hasData: true,
          metrics: {
            ttfb,
            ttfbRating: rating as any
          }
        });

        const scores = await runRetrieval(testHtml, testUrl);
        
        console.log(`⏱️  TTFB ${ttfb}ms (${rating}) → Score: ${scores.ttfb}`);
        
        expect(scores.ttfb).toBe(expectedScore);
      });
    });
  });
});

// Export helper for other tests
export async function analyzeWithCrux(html: string, url: string, cruxData: any) {
  mockedFetchCrUXData.mockResolvedValueOnce(cruxData);
  return await runRetrieval(html, url);
}

export async function analyzeWithoutCrux(html: string, url: string) {
  mockedFetchCrUXData.mockResolvedValueOnce({
    url,
    hasData: false,
    error: 'No data available'
  });
  return await runRetrieval(html, url);
}