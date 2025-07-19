import axios from 'axios';
import { fetchCrUXData, calculateCrUXScore, clearCache, WEB_VITALS_THRESHOLDS } from '../chromeUxReport';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Chrome UX Report API', () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  describe('fetchCrUXData', () => {
    it('should fetch and return CrUX data successfully', async () => {
      const mockResponse = {
        data: {
          record: {
            key: { url: 'https://example.com' },
            metrics: {
              largestContentfulPaint: {
                percentiles: { p75: 2000 },
                histogram: []
              },
              firstInputDelay: {
                percentiles: { p75: 50 },
                histogram: []
              },
              cumulativeLayoutShift: {
                percentiles: { p75: 0.05 },
                histogram: []
              },
              timeToFirstByte: {
                percentiles: { p75: 600 },
                histogram: []
              }
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await fetchCrUXData('https://example.com');

      expect(result).toEqual({
        url: 'https://example.com',
        hasData: true,
        metrics: {
          lcp: 2000,
          fid: 50,
          cls: 0.05,
          ttfb: 600,
          fcp: undefined,
          lcpRating: 'good',
          fidRating: 'good',
          clsRating: 'good',
          ttfbRating: 'good'
        }
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://chromeuxreport.googleapis.com/v1/records:queryRecord',
        { url: 'https://example.com', formFactor: 'PHONE' },
        expect.any(Object)
      );
    });

    it('should handle 404 (no data available)', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 }
      });

      const result = await fetchCrUXData('https://unknown-site.com');

      expect(result).toEqual({
        url: 'https://unknown-site.com',
        hasData: false,
        error: 'No Chrome UX Report data available for this URL'
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchCrUXData('https://example.com');

      expect(result).toEqual({
        url: 'https://example.com',
        hasData: false,
        error: 'Failed to fetch performance data'
      });
    });

    it('should use cached data on subsequent requests', async () => {
      const mockResponse = {
        data: {
          record: {
            key: { url: 'https://example.com' },
            metrics: {
              timeToFirstByte: {
                percentiles: { p75: 600 },
                histogram: []
              }
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // First call
      await fetchCrUXData('https://example.com');
      
      // Second call should use cache
      const result = await fetchCrUXData('https://example.com');

      // Should only be called once due to caching
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(result.hasData).toBe(true);
    });
  });

  describe('calculateCrUXScore', () => {
    it('should calculate score with all metrics available', () => {
      const metrics = {
        ttfbRating: 'good' as const,
        lcpRating: 'good' as const,
        fidRating: 'needs-improvement' as const,
        clsRating: 'poor' as const
      };

      const score = calculateCrUXScore(metrics, 10);

      // Expected: (1 * 0.4 + 1 * 0.3 + 0.5 * 0.15 + 0 * 0.15) * 10 = 7.75 ≈ 8
      expect(score).toBe(8);
    });

    it('should handle partial metrics gracefully', () => {
      const metrics = {
        ttfbRating: 'good' as const,
        lcpRating: 'needs-improvement' as const
      };

      const score = calculateCrUXScore(metrics, 10);

      // Expected: (1 * 0.4 + 0.5 * 0.3) / 0.7 * 10 = 7.86 ≈ 8
      expect(score).toBe(8);
    });

    it('should return 0 for no metrics', () => {
      const score = calculateCrUXScore({}, 10);
      expect(score).toBe(0);
    });

    it('should return 0 for undefined metrics', () => {
      const score = calculateCrUXScore(undefined, 10);
      expect(score).toBe(0);
    });
  });

  describe('Web Vitals Ratings', () => {
    it('should correctly rate TTFB values', async () => {
      const testCases = [
        { ttfb: 500, expected: 'good' },
        { ttfb: 1200, expected: 'needs-improvement' },
        { ttfb: 2000, expected: 'poor' }
      ];

      for (const testCase of testCases) {
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            record: {
              key: { url: 'https://example.com' },
              metrics: {
                timeToFirstByte: {
                  percentiles: { p75: testCase.ttfb },
                  histogram: []
                }
              }
            }
          }
        });

        clearCache(); // Clear cache for each test
        const result = await fetchCrUXData('https://example.com');
        expect(result.metrics?.ttfbRating).toBe(testCase.expected);
      }
    });
  });
});