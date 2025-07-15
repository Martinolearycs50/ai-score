import { score } from '../scorer-new';
import type { PillarResults } from '../types';

describe('AI Search Scorer - Simple Tests', () => {
  it('should calculate perfect score as 100', () => {
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
  });

  it('should calculate zero score as 0', () => {
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
  });
});