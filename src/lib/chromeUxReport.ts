/**
 * Chrome UX Report API Client
 * Fetches real-world performance data from Google's Chrome User Experience Report
 * Requires API key (free tier: 1,000 requests/day)
 */

import axios from 'axios';
import { logChromeUxFetch } from '@/utils/apiUsageVerification';

// CrUX API endpoint and configuration
const CRUX_API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';
const CRUX_API_KEY = process.env.CHROME_UX_API_KEY;

// Core Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS = {
  LCP: { // Largest Contentful Paint
    good: 2500,      // < 2.5s
    needsImprovement: 4000, // 2.5s - 4s
    // poor: > 4s
  },
  FID: { // First Input Delay
    good: 100,       // < 100ms
    needsImprovement: 300,  // 100ms - 300ms
    // poor: > 300ms
  },
  CLS: { // Cumulative Layout Shift
    good: 0.1,       // < 0.1
    needsImprovement: 0.25, // 0.1 - 0.25
    // poor: > 0.25
  },
  TTFB: { // Time to First Byte
    good: 800,       // < 0.8s
    needsImprovement: 1800, // 0.8s - 1.8s
    // poor: > 1.8s
  },
};

export interface CrUXMetrics {
  largestContentfulPaint?: MetricData;
  firstInputDelay?: MetricData;
  cumulativeLayoutShift?: MetricData;
  timeToFirstByte?: MetricData;
  firstContentfulPaint?: MetricData;
}

export interface MetricData {
  histogram: Array<{
    start: number;
    end?: number;
    density: number;
  }>;
  percentiles: {
    p75: number;
  };
}

export interface CrUXResponse {
  record: {
    key: {
      url?: string;
      origin?: string;
    };
    metrics: CrUXMetrics;
  };
  urlNormalizationDetails?: {
    originalUrl: string;
    normalizedUrl: string;
  };
}

export interface CrUXResult {
  url: string;
  hasData: boolean;
  metrics?: {
    lcp?: number;        // Largest Contentful Paint (ms)
    fid?: number;        // First Input Delay (ms)
    cls?: number;        // Cumulative Layout Shift (score)
    ttfb?: number;       // Time to First Byte (ms)
    fcp?: number;        // First Contentful Paint (ms)
    lcpRating?: 'good' | 'needs-improvement' | 'poor';
    fidRating?: 'good' | 'needs-improvement' | 'poor';
    clsRating?: 'good' | 'needs-improvement' | 'poor';
    ttfbRating?: 'good' | 'needs-improvement' | 'poor';
  };
  error?: string;
}

// Simple in-memory cache (24 hour TTL)
const cache = new Map<string, { data: CrUXResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches Core Web Vitals data from Chrome UX Report API
 */
export async function fetchCrUXData(url: string): Promise<CrUXResult> {
  console.log(`🔍 [CrUX API] Fetching data for: ${url}`);
  
  try {
    // Check if API key is configured
    if (!CRUX_API_KEY) {
      console.log('❌ [CrUX API] No API key configured, returning no data');
      return {
        url,
        hasData: false,
        error: 'Chrome UX Report API key not configured',
      };
    }

    // Check cache first
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 [CrUX API] Returning cached data');
      return cached.data;
    }

    // Make API request with authentication
    const apiUrl = `${CRUX_API_URL}?key=${CRUX_API_KEY}`;
    const response = await axios.post<CrUXResponse>(
      apiUrl,
      {
        url,
        formFactor: 'PHONE', // Mobile-first approach
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { metrics } = response.data.record;

    // Extract p75 values (75th percentile - what most users experience)
    const result: CrUXResult = {
      url,
      hasData: true,
      metrics: {
        lcp: metrics.largestContentfulPaint?.percentiles.p75,
        fid: metrics.firstInputDelay?.percentiles.p75,
        cls: metrics.cumulativeLayoutShift?.percentiles.p75,
        ttfb: metrics.timeToFirstByte?.percentiles.p75,
        fcp: metrics.firstContentfulPaint?.percentiles.p75,
        lcpRating: getLCPRating(metrics.largestContentfulPaint?.percentiles.p75),
        fidRating: getFIDRating(metrics.firstInputDelay?.percentiles.p75),
        clsRating: getCLSRating(metrics.cumulativeLayoutShift?.percentiles.p75),
        ttfbRating: getTTFBRating(metrics.timeToFirstByte?.percentiles.p75),
      },
    };

    console.log('✅ [CrUX API] Data retrieved:', {
      ttfb: result.metrics?.ttfb,
      ttfbRating: result.metrics?.ttfbRating,
      lcp: result.metrics?.lcp,
      lcpRating: result.metrics?.lcpRating
    });

    // Log successful fetch for verification
    logChromeUxFetch(true, {
      url,
      ttfb: result.metrics?.ttfb,
      rating: result.metrics?.ttfbRating
    });

    // Cache the result
    cache.set(url, { data: result, timestamp: Date.now() });

    return result;
  } catch (error) {
    // Check if it's a 404 (no data available for this URL)
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log('ℹ️ [CrUX API] No data available for this URL');
      const result: CrUXResult = {
        url,
        hasData: false,
        error: 'No Chrome UX Report data available for this URL',
      };
      
      // Cache negative results too
      cache.set(url, { data: result, timestamp: Date.now() });
      
      return result;
    }

    // Other errors
    console.error('❌ [CrUX API] Error fetching data:', error);
    return {
      url,
      hasData: false,
      error: 'Failed to fetch performance data',
    };
  }
}

/**
 * Get rating for Largest Contentful Paint
 */
function getLCPRating(lcp?: number): 'good' | 'needs-improvement' | 'poor' | undefined {
  if (!lcp) return undefined;
  if (lcp <= WEB_VITALS_THRESHOLDS.LCP.good) return 'good';
  if (lcp <= WEB_VITALS_THRESHOLDS.LCP.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for First Input Delay
 */
function getFIDRating(fid?: number): 'good' | 'needs-improvement' | 'poor' | undefined {
  if (!fid) return undefined;
  if (fid <= WEB_VITALS_THRESHOLDS.FID.good) return 'good';
  if (fid <= WEB_VITALS_THRESHOLDS.FID.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for Cumulative Layout Shift
 */
function getCLSRating(cls?: number): 'good' | 'needs-improvement' | 'poor' | undefined {
  if (!cls) return undefined;
  if (cls <= WEB_VITALS_THRESHOLDS.CLS.good) return 'good';
  if (cls <= WEB_VITALS_THRESHOLDS.CLS.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for Time to First Byte
 */
function getTTFBRating(ttfb?: number): 'good' | 'needs-improvement' | 'poor' | undefined {
  if (!ttfb) return undefined;
  if (ttfb <= WEB_VITALS_THRESHOLDS.TTFB.good) return 'good';
  if (ttfb <= WEB_VITALS_THRESHOLDS.TTFB.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Calculate a score contribution based on CrUX data
 * Returns a value between 0 and maxPoints
 */
export function calculateCrUXScore(metrics: CrUXResult['metrics'], maxPoints: number): number {
  if (!metrics) return 0;

  let score = 0;
  let factors = 0;

  // TTFB is most important for AI crawlers
  if (metrics.ttfbRating) {
    const ttfbScore = metrics.ttfbRating === 'good' ? 1 : 
                      metrics.ttfbRating === 'needs-improvement' ? 0.5 : 0;
    score += ttfbScore * 0.4; // 40% weight
    factors += 0.4;
  }

  // LCP is second most important
  if (metrics.lcpRating) {
    const lcpScore = metrics.lcpRating === 'good' ? 1 : 
                     metrics.lcpRating === 'needs-improvement' ? 0.5 : 0;
    score += lcpScore * 0.3; // 30% weight
    factors += 0.3;
  }

  // FID and CLS are less important for AI crawlers
  if (metrics.fidRating) {
    const fidScore = metrics.fidRating === 'good' ? 1 : 
                     metrics.fidRating === 'needs-improvement' ? 0.5 : 0;
    score += fidScore * 0.15; // 15% weight
    factors += 0.15;
  }

  if (metrics.clsRating) {
    const clsScore = metrics.clsRating === 'good' ? 1 : 
                     metrics.clsRating === 'needs-improvement' ? 0.5 : 0;
    score += clsScore * 0.15; // 15% weight
    factors += 0.15;
  }

  // Normalize if not all metrics are available
  if (factors > 0) {
    score = score / factors;
  }

  return Math.round(score * maxPoints);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cache.clear();
}