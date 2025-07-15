import { AiSearchAnalyzer } from '../analyzer-new';
import axios from 'axios';
import { WELL_OPTIMIZED_HTML, POORLY_OPTIMIZED_HTML, FRESH_HEADERS } from '../audit/__tests__/fixtures';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock audit modules
jest.mock('../audit/retrieval', () => ({
  run: jest.fn().mockResolvedValue({
    ttfb: 10,
    paywall: 5,
    mainContent: 5,
    htmlSize: 10,
  }),
}));

jest.mock('../audit/factDensity', () => ({
  run: jest.fn().mockResolvedValue({
    uniqueStats: 10,
    dataMarkup: 5,
    citations: 5,
    deduplication: 5,
  }),
}));

jest.mock('../audit/structure', () => ({
  run: jest.fn().mockResolvedValue({
    headingFrequency: 5,
    headingDepth: 5,
    structuredData: 5,
    rssFeed: 5,
  }),
}));

jest.mock('../audit/trust', () => ({
  run: jest.fn().mockResolvedValue({
    authorBio: 5,
    napConsistency: 5,
    license: 5,
  }),
}));

jest.mock('../audit/recency', () => ({
  run: jest.fn().mockResolvedValue({
    lastModified: 5,
    stableCanonical: 5,
  }),
}));

describe('AI Search Analyzer Integration', () => {
  let analyzer: AiSearchAnalyzer;

  beforeEach(() => {
    analyzer = new AiSearchAnalyzer();
    jest.clearAllMocks();

    // Default axios mock
    mockedAxios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: WELL_OPTIMIZED_HTML,
        headers: FRESH_HEADERS,
        status: 200,
      }),
    } as any);
  });

  describe('Successful analysis', () => {
    it('should analyze well-optimized website with perfect score', async () => {
      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.url).toBe('https://example.com');
      expect(result.aiSearchScore).toBe(100);
      expect(result.timestamp).toBeDefined();
      expect(result.pageTitle).toBe('Complete Guide to AI Search Optimization');
      expect(result.pageDescription).toContain('Learn how to optimize');
    });

    it('should handle URLs that need normalization', async () => {
      const result = await analyzer.analyzeUrl('example.com');

      expect(result.url).toBe('https://example.com');
    });

    it('should extract metadata correctly', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: `
            <html>
              <head>
                <title>Test Title</title>
                <meta name="description" content="Test description">
              </head>
              <body>Content</body>
            </html>
          `,
          headers: {},
          status: 200,
        }),
      } as any);

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.pageTitle).toBe('Test Title');
      expect(result.pageDescription).toBe('Test description');
    });

    it('should fallback to Open Graph metadata', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: `
            <html>
              <head>
                <meta property="og:title" content="OG Title">
                <meta property="og:description" content="OG description">
              </head>
              <body>Content</body>
            </html>
          `,
          headers: {},
          status: 200,
        }),
      } as any);

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.pageTitle).toBe('OG Title');
      expect(result.pageDescription).toBe('OG description');
    });
  });

  describe('Scoring breakdown', () => {
    it('should provide detailed scoring breakdown', async () => {
      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.scoringResult).toBeDefined();
      expect(result.scoringResult.total).toBe(100);
      expect(result.scoringResult.breakdown).toHaveLength(5);
      expect(result.scoringResult.pillarScores).toEqual({
        RETRIEVAL: 30,
        FACT_DENSITY: 25,
        STRUCTURE: 20,
        TRUST: 15,
        RECENCY: 10,
      });
    });

    it('should generate recommendations for failed checks', async () => {
      // Mock some failed checks
      const retrieval = require('../audit/retrieval');
      retrieval.run.mockResolvedValueOnce({
        ttfb: 0, // Failed
        paywall: 5,
        mainContent: 0, // Failed
        htmlSize: 10,
      });

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.scoringResult.recommendations).toHaveLength(2);
      expect(result.scoringResult.recommendations[0].metric).toBe('ttfb');
      expect(result.scoringResult.recommendations[1].metric).toBe('mainContent');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid URLs', async () => {
      await expect(analyzer.analyzeUrl('not-a-url')).rejects.toThrow('Invalid URL');
    });

    it('should handle network errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          response: {
            status: 500,
            statusText: 'Internal Server Error',
          },
        }),
      } as any);

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Server returned 500');
    });

    it('should handle timeout errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          code: 'ECONNABORTED',
        }),
      } as any);

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Request timed out');
    });

    it('should handle domain not found errors', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          code: 'ENOTFOUND',
        }),
      } as any);

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Domain not found');
    });
  });

  describe('Audit module integration', () => {
    it('should call all audit modules with correct parameters', async () => {
      const retrieval = require('../audit/retrieval');
      const factDensity = require('../audit/factDensity');
      const structure = require('../audit/structure');
      const trust = require('../audit/trust');
      const recency = require('../audit/recency');

      await analyzer.analyzeUrl('https://example.com');

      expect(retrieval.run).toHaveBeenCalledWith(WELL_OPTIMIZED_HTML, 'https://example.com');
      expect(factDensity.run).toHaveBeenCalledWith(WELL_OPTIMIZED_HTML);
      expect(structure.run).toHaveBeenCalledWith(WELL_OPTIMIZED_HTML);
      expect(trust.run).toHaveBeenCalledWith(WELL_OPTIMIZED_HTML);
      expect(recency.run).toHaveBeenCalledWith(WELL_OPTIMIZED_HTML, expect.objectContaining(FRESH_HEADERS));
    });

    it('should handle audit module errors gracefully', async () => {
      const retrieval = require('../audit/retrieval');
      retrieval.run.mockRejectedValueOnce(new Error('Audit failed'));

      await expect(analyzer.analyzeUrl('https://example.com')).rejects.toThrow('Audit failed');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle poorly optimized websites', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: POORLY_OPTIMIZED_HTML,
          headers: {},
          status: 200,
        }),
      } as any);

      // Mock poor scores
      const retrieval = require('../audit/retrieval');
      const factDensity = require('../audit/factDensity');
      const structure = require('../audit/structure');
      const trust = require('../audit/trust');
      const recency = require('../audit/recency');

      retrieval.run.mockResolvedValueOnce({
        ttfb: 0,
        paywall: 5,
        mainContent: 0,
        htmlSize: 10,
      });

      factDensity.run.mockResolvedValueOnce({
        uniqueStats: 0,
        dataMarkup: 0,
        citations: 0,
        deduplication: 0,
      });

      structure.run.mockResolvedValueOnce({
        headingFrequency: 0,
        headingDepth: 0,
        structuredData: 0,
        rssFeed: 0,
      });

      trust.run.mockResolvedValueOnce({
        authorBio: 0,
        napConsistency: 0,
        license: 0,
      });

      recency.run.mockResolvedValueOnce({
        lastModified: 0,
        stableCanonical: 0,
      });

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.aiSearchScore).toBe(15); // Only some basic points
      expect(result.scoringResult.recommendations.length).toBeGreaterThan(10);
    });

    it('should handle websites with mixed optimization', async () => {
      // Mock mixed scores
      const retrieval = require('../audit/retrieval');
      const factDensity = require('../audit/factDensity');

      retrieval.run.mockResolvedValueOnce({
        ttfb: 10,
        paywall: 5,
        mainContent: 0, // Poor main content
        htmlSize: 10,
      });

      factDensity.run.mockResolvedValueOnce({
        uniqueStats: 10,
        dataMarkup: 5,
        citations: 0, // No citations
        deduplication: 5,
      });

      const result = await analyzer.analyzeUrl('https://example.com');

      expect(result.aiSearchScore).toBe(85); // 100 - 5 - 5 - 5
      expect(result.scoringResult.recommendations).toHaveLength(2);
    });
  });
});