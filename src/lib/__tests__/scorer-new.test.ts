import { score } from '../scorer-new';
import type { PillarResults } from '../types';

describe('AI Search Scorer', () => {
  describe('Perfect score scenario', () => {
    it('should calculate 100 total for perfect scores', () => {
      const perfectResults: PillarResults = {
        RETRIEVAL: {
          ttfb: 10,
          paywall: 5,
          mainContent: 5,
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 10,
          dataMarkup: 5,
          citations: 5,
          deduplication: 5,
        },
        STRUCTURE: {
          headingFrequency: 5,
          headingDepth: 5,
          structuredData: 5,
          rssFeed: 5,
        },
        TRUST: {
          authorBio: 5,
          napConsistency: 5,
          license: 5,
        },
        RECENCY: {
          lastModified: 5,
          stableCanonical: 5,
        },
      };

      const result = score(perfectResults);

      expect(result.total).toBe(100);
      expect(result.pillarScores.RETRIEVAL).toBe(30);
      expect(result.pillarScores.FACT_DENSITY).toBe(25);
      expect(result.pillarScores.STRUCTURE).toBe(20);
      expect(result.pillarScores.TRUST).toBe(15);
      expect(result.pillarScores.RECENCY).toBe(10);
    });
  });

  describe('Zero score scenario', () => {
    it('should calculate 0 total for all failed checks', () => {
      const zeroResults: PillarResults = {
        RETRIEVAL: {
          ttfb: 0,
          paywall: 0,
          mainContent: 0,
          htmlSize: 0,
        },
        FACT_DENSITY: {
          uniqueStats: 0,
          dataMarkup: 0,
          citations: 0,
          deduplication: 0,
        },
        STRUCTURE: {
          headingFrequency: 0,
          headingDepth: 0,
          structuredData: 0,
          rssFeed: 0,
        },
        TRUST: {
          authorBio: 0,
          napConsistency: 0,
          license: 0,
        },
        RECENCY: {
          lastModified: 0,
          stableCanonical: 0,
        },
      };

      const result = score(zeroResults);

      expect(result.total).toBe(0);
      expect(result.recommendations).toHaveLength(17); // All checks failed
    });
  });

  describe('Partial score scenarios', () => {
    it('should calculate correct partial scores', () => {
      const partialResults: PillarResults = {
        RETRIEVAL: {
          ttfb: 10,
          paywall: 5,
          mainContent: 0,
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 10,
          dataMarkup: 0,
          citations: 5,
          deduplication: 5,
        },
        STRUCTURE: {
          headingFrequency: 5,
          headingDepth: 0,
          structuredData: 0,
          rssFeed: 5,
        },
        TRUST: {
          authorBio: 5,
          napConsistency: 0,
          license: 0,
        },
        RECENCY: {
          lastModified: 5,
          stableCanonical: 0,
        },
      };

      const result = score(partialResults);

      expect(result.total).toBe(65);
      expect(result.pillarScores.RETRIEVAL).toBe(25);
      expect(result.pillarScores.FACT_DENSITY).toBe(20);
      expect(result.pillarScores.STRUCTURE).toBe(10);
      expect(result.pillarScores.TRUST).toBe(5);
      expect(result.pillarScores.RECENCY).toBe(5);
    });
  });

  describe('Breakdown structure', () => {
    it('should provide correct breakdown for each pillar', () => {
      const results: PillarResults = {
        RETRIEVAL: {
          ttfb: 10,
          paywall: 0,
          mainContent: 5,
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 10,
          dataMarkup: 5,
          citations: 0,
          deduplication: 5,
        },
        STRUCTURE: {
          headingFrequency: 5,
          headingDepth: 5,
          structuredData: 0,
          rssFeed: 0,
        },
        TRUST: {
          authorBio: 0,
          napConsistency: 5,
          license: 0,
        },
        RECENCY: {
          lastModified: 5,
          stableCanonical: 0,
        },
      };

      const result = score(results);

      // Check breakdown structure
      expect(result.breakdown).toHaveLength(5);

      const retrievalBreakdown = result.breakdown.find((b) => b.pillar === 'RETRIEVAL');
      expect(retrievalBreakdown).toEqual({
        pillar: 'RETRIEVAL',
        earned: 25,
        max: 30,
        checks: results.RETRIEVAL,
      });

      const factDensityBreakdown = result.breakdown.find((b) => b.pillar === 'FACT_DENSITY');
      expect(factDensityBreakdown?.earned).toBe(20);
      expect(factDensityBreakdown?.max).toBe(25);
    });
  });

  describe('Recommendations generation', () => {
    it('should generate recommendations for failed checks', () => {
      const results: PillarResults = {
        RETRIEVAL: {
          ttfb: 0, // Failed
          paywall: 5,
          mainContent: 0, // Failed
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 10,
          dataMarkup: 0, // Failed
          citations: 5,
          deduplication: 5,
        },
        STRUCTURE: {
          headingFrequency: 5,
          headingDepth: 5,
          structuredData: 5,
          rssFeed: 5,
        },
        TRUST: {
          authorBio: 5,
          napConsistency: 5,
          license: 0, // Failed
        },
        RECENCY: {
          lastModified: 5,
          stableCanonical: 5,
        },
      };

      const result = score(results);

      expect(result.recommendations).toHaveLength(4);

      // Check recommendation structure
      const ttfbRec = result.recommendations.find((r) => r.metric === 'ttfb');
      expect(ttfbRec).toBeDefined();
      expect(ttfbRec?.why).toContain('AI engines skip slow pages');
      expect(ttfbRec?.fix).toContain('Use a CDN like Cloudflare');
      expect(ttfbRec?.gain).toBe(10);
      expect(ttfbRec?.pillar).toBe('RETRIEVAL');
    });

    it('should sort recommendations by gain (highest first)', () => {
      const results: PillarResults = {
        RETRIEVAL: {
          ttfb: 0, // 10 points
          paywall: 0, // 5 points
          mainContent: 10,
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 0, // 10 points
          dataMarkup: 10,
          citations: 10,
          deduplication: 10,
        },
        STRUCTURE: {
          headingFrequency: 0, // 5 points
          headingDepth: 10,
          structuredData: 10,
          rssFeed: 10,
        },
        TRUST: {
          authorBio: 10,
          napConsistency: 10,
          license: 10,
        },
        RECENCY: {
          lastModified: 10,
          stableCanonical: 10,
        },
      };

      const result = score(results);

      // Should be sorted by gain: ttfb(10), uniqueStats(10), paywall(5), headingFrequency(5)
      expect(result.recommendations[0].gain).toBe(10);
      expect(result.recommendations[1].gain).toBe(10);
      expect(result.recommendations[2].gain).toBe(5);
      expect(result.recommendations[3].gain).toBe(5);
    });

    it('should not generate recommendations for passing checks', () => {
      const results: PillarResults = {
        RETRIEVAL: {
          ttfb: 10,
          paywall: 5,
          mainContent: 5,
          htmlSize: 10,
        },
        FACT_DENSITY: {
          uniqueStats: 10,
          dataMarkup: 5,
          citations: 5,
          deduplication: 5,
        },
        STRUCTURE: {
          headingFrequency: 5,
          headingDepth: 5,
          structuredData: 5,
          rssFeed: 5,
        },
        TRUST: {
          authorBio: 5,
          napConsistency: 5,
          license: 5,
        },
        RECENCY: {
          lastModified: 0, // Only failed check
          stableCanonical: 5,
        },
      };

      const result = score(results);

      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].metric).toBe('lastModified');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty pillar results', () => {
      const emptyResults: PillarResults = {
        RETRIEVAL: {} as any,
        FACT_DENSITY: {} as any,
        STRUCTURE: {} as any,
        TRUST: {} as any,
        RECENCY: {} as any,
      };

      const result = score(emptyResults);

      expect(result.total).toBe(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it('should handle mixed valid and empty pillars', () => {
      const mixedResults: PillarResults = {
        RETRIEVAL: {
          ttfb: 10,
          paywall: 5,
          mainContent: 5,
          htmlSize: 10,
        },
        FACT_DENSITY: {} as any,
        STRUCTURE: {} as any,
        TRUST: {} as any,
        RECENCY: {} as any,
      };

      const result = score(mixedResults);

      expect(result.total).toBe(30);
      expect(result.pillarScores.RETRIEVAL).toBe(30);
      expect(result.pillarScores.FACT_DENSITY).toBe(0);
    });
  });
});
