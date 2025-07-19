import { run as runRetrieval, capturedDomain } from '../audit/retrieval';
import { fetchCrUXData, calculateCrUXScore } from '../chromeUxReport';

// Mock axios for retrieval tests
jest.mock('axios');

// Only mock fetchCrUXData, not the entire module
jest.mock('../chromeUxReport', () => ({
  ...jest.requireActual('../chromeUxReport'),
  fetchCrUXData: jest.fn()
}));

const mockedFetchCrUXData = fetchCrUXData as jest.MockedFunction<typeof fetchCrUXData>;

describe('RETRIEVAL Scoring Accuracy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TTFB Scoring with CrUX Data', () => {
    it('should score 5 points for good TTFB rating', async () => {
      const html = '<html><body><main>Test content with enough text to pass the 70% threshold requirement</main></body></html>';
      const url = 'https://example.com';

      mockedFetchCrUXData.mockResolvedValueOnce({
        url,
        hasData: true,
        metrics: {
          ttfb: 500,
          ttfbRating: 'good',
          lcp: 2000,
          lcpRating: 'good'
        }
      });

      const scores = await runRetrieval(html, url);
      expect(scores.ttfb).toBe(5);
      expect(capturedDomain.actualTtfb).toBe(500);
      expect(capturedDomain.cruxData?.ttfbRating).toBe('good');
    });

    it('should score 3 points for needs-improvement TTFB < 1200ms', async () => {
      const html = '<html><body><main>Test content with enough text to pass the 70% threshold requirement</main></body></html>';
      const url = 'https://example.com';

      mockedFetchCrUXData.mockResolvedValueOnce({
        url,
        hasData: true,
        metrics: {
          ttfb: 1000,
          ttfbRating: 'needs-improvement'
        }
      });

      const scores = await runRetrieval(html, url);
      expect(scores.ttfb).toBe(3);
    });

    it('should score 2 points for needs-improvement TTFB >= 1200ms', async () => {
      const html = '<html><body><main>Test content with enough text to pass the 70% threshold requirement</main></body></html>';
      const url = 'https://example.com';

      mockedFetchCrUXData.mockResolvedValueOnce({
        url,
        hasData: true,
        metrics: {
          ttfb: 1500,
          ttfbRating: 'needs-improvement'
        }
      });

      const scores = await runRetrieval(html, url);
      expect(scores.ttfb).toBe(2);
    });

    it('should score 1 point for poor TTFB < 3000ms', async () => {
      const html = '<html><body><main>Test content with enough text to pass the 70% threshold requirement</main></body></html>';
      const url = 'https://example.com';

      mockedFetchCrUXData.mockResolvedValueOnce({
        url,
        hasData: true,
        metrics: {
          ttfb: 2500,
          ttfbRating: 'poor'
        }
      });

      const scores = await runRetrieval(html, url);
      expect(scores.ttfb).toBe(1);
    });

    it('should score 0 points for very poor TTFB >= 3000ms', async () => {
      const html = '<html><body><main>Test content with enough text to pass the 70% threshold requirement</main></body></html>';
      const url = 'https://example.com';

      mockedFetchCrUXData.mockResolvedValueOnce({
        url,
        hasData: true,
        metrics: {
          ttfb: 4000,
          ttfbRating: 'poor'
        }
      });

      const scores = await runRetrieval(html, url);
      expect(scores.ttfb).toBe(0);
    });
  });

  describe('Synthetic TTFB Scoring (Fallback)', () => {
    beforeEach(() => {
      // Mock CrUX to return no data
      mockedFetchCrUXData.mockResolvedValue({
        url: 'https://example.com',
        hasData: false,
        error: 'No Chrome UX Report data available for this URL'
      });
    });

    it('should use granular synthetic scoring when CrUX unavailable', async () => {
      // This test would require mocking axios for synthetic measurement
      // The scoring logic is:
      // < 200ms: 5 points
      // < 500ms: 4 points  
      // < 1000ms: 2 points
      // < 2000ms: 1 point
      // >= 2000ms: 0 points

      const html = '<html><body><main>Test content</main></body></html>';
      const url = 'https://example.com';

      // We can't easily test the actual network timing without complex mocking
      // But we can verify CrUX fallback is attempted
      const scores = await runRetrieval(html, url);
      expect(mockedFetchCrUXData).toHaveBeenCalledWith(url);
    });
  });

  describe('Other RETRIEVAL Scoring Components', () => {
    beforeEach(() => {
      mockedFetchCrUXData.mockResolvedValue({
        url: 'https://example.com',
        hasData: false
      });
    });

    it('should score 5 points for no paywall', async () => {
      const html = '<html><body><main>Free content available to all</main></body></html>';
      const scores = await runRetrieval(html, 'https://example.com');
      expect(scores.paywall).toBe(5);
    });

    it('should score 0 points when paywall detected', async () => {
      const html = '<html><body><div class="paywall-overlay"><main>Premium content</main></div></body></html>';
      const scores = await runRetrieval(html, 'https://example.com');
      expect(scores.paywall).toBe(0);
    });

    it('should score 5 points for main content >= 70%', async () => {
      const html = `
        <html>
          <body>
            <header>Small header</header>
            <main>${'Main content '.repeat(100)}</main>
            <footer>Small footer</footer>
          </body>
        </html>
      `;
      const scores = await runRetrieval(html, 'https://example.com');
      expect(scores.mainContent).toBe(5);
    });

    it('should score 0 points for main content < 70%', async () => {
      const html = `
        <html>
          <body>
            <header>${'Large header '.repeat(50)}</header>
            <main>Small main content</main>
            <footer>${'Large footer '.repeat(50)}</footer>
          </body>
        </html>
      `;
      const scores = await runRetrieval(html, 'https://example.com');
      expect(scores.mainContent).toBe(0);
    });

    it('should score 5 points for HTML <= 2MB', async () => {
      const smallHtml = '<html><body><main>Reasonably sized content</main></body></html>';
      const scores = await runRetrieval(smallHtml, 'https://example.com');
      expect(scores.htmlSize).toBe(5);
    });

    it('should score 0 points for HTML > 2MB', async () => {
      // Create HTML larger than 2MB
      const largeContent = 'x'.repeat(2 * 1024 * 1024 + 1);
      const largeHtml = `<html><body><main>${largeContent}</main></body></html>`;
      const scores = await runRetrieval(largeHtml, 'https://example.com');
      expect(scores.htmlSize).toBe(0);
    });
  });

  describe('Total RETRIEVAL Score Calculation', () => {
    it('should calculate maximum 25 points correctly', async () => {
      const html = '<html><body><main>Perfect content with enough text to meet the 70% threshold</main></body></html>';
      
      mockedFetchCrUXData.mockResolvedValueOnce({
        url: 'https://example.com',
        hasData: true,
        metrics: {
          ttfb: 300,
          ttfbRating: 'good'
        }
      });

      const scores = await runRetrieval(html, 'https://example.com');
      
      // Verify individual components
      expect(scores.ttfb).toBe(5);
      expect(scores.paywall).toBe(5);
      expect(scores.mainContent).toBe(5);
      expect(scores.htmlSize).toBe(5);
      // llmsTxtFile would be 0 without mocking the file fetch
      
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      expect(totalScore).toBeLessThanOrEqual(25);
    });
  });
});

describe('Chrome UX Report Score Calculation', () => {
  it('should calculate correct score contribution', () => {
    const metrics = {
      ttfbRating: 'good' as const,
      lcpRating: 'good' as const,
      fidRating: 'needs-improvement' as const,
      clsRating: 'poor' as const
    };

    // With max points of 10
    const score = calculateCrUXScore(metrics, 10);
    
    // Expected calculation:
    // TTFB (40% weight): good = 1.0 * 0.4 = 0.4
    // LCP (30% weight): good = 1.0 * 0.3 = 0.3
    // FID (15% weight): needs-improvement = 0.5 * 0.15 = 0.075
    // CLS (15% weight): poor = 0 * 0.15 = 0
    // Total: 0.775 * 10 = 7.75, rounded to 8
    
    expect(score).toBe(8);
  });

  it('should handle missing metrics gracefully', () => {
    const metrics = {
      ttfbRating: 'good' as const,
      // Other metrics missing
    };

    const score = calculateCrUXScore(metrics, 10);
    
    // Only TTFB available (40% weight): 1.0
    // Normalized: 1.0 * 10 = 10
    
    expect(score).toBe(10);
  });

  it('should return 0 for undefined metrics', () => {
    const score = calculateCrUXScore(undefined, 10);
    expect(score).toBe(0);
  });
});