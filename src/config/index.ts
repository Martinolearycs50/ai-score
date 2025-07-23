/**
 * Centralized Configuration System
 * All application configuration should be accessed through this module
 */
import { z } from 'zod';

// Environment schema for validation
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // API Keys
  CHROME_UX_API_KEY: z.string().optional(),
  NEXT_PUBLIC_WORKER_URL: z.string().url().optional(),

  // Feature flags
  NEXT_PUBLIC_ENABLE_DYNAMIC_SCORING: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  NEXT_PUBLIC_ENABLE_PROGRESSIVE_ENHANCEMENT: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),

  // Rate limiting
  RATE_LIMIT_PER_HOUR: z.string().default('50').transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default('3600000').transform(Number), // 1 hour

  // Timeouts (in milliseconds)
  TIMEOUT_PAGE_FETCH: z.string().default('30000').transform(Number),
  TIMEOUT_ROBOTS_TXT: z.string().default('5000').transform(Number),
  TIMEOUT_TTFB_CHECK: z.string().default('5000').transform(Number),

  // Cache settings
  CACHE_CHROME_UX_TTL: z.string().default('3600000').transform(Number), // 1 hour
  CACHE_ROBOTS_TXT_TTL: z.string().default('86400000').transform(Number), // 24 hours

  // Content limits
  MAX_CONTENT_LENGTH: z.string().default('100000').transform(Number), // 100KB
  MAX_WORD_COUNT: z.string().default('50000').transform(Number),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment configuration:', error.issues);
      // In production, we should fail fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment configuration');
      }
    }
    // Return defaults in development
    return envSchema.parse({});
  }
};

// Parsed environment configuration
const env = parseEnv();

// Application configuration
export const config = {
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // API Configuration
  api: {
    chromeUx: {
      apiKey: env.CHROME_UX_API_KEY,
      enabled: !!env.CHROME_UX_API_KEY,
      cacheTtl: env.CACHE_CHROME_UX_TTL,
    },
    cloudflareWorker: {
      url: env.NEXT_PUBLIC_WORKER_URL,
      enabled: !!env.NEXT_PUBLIC_WORKER_URL,
    },
  },

  // Feature flags
  features: {
    dynamicScoring: env.NEXT_PUBLIC_ENABLE_DYNAMIC_SCORING,
    progressiveEnhancement: env.NEXT_PUBLIC_ENABLE_PROGRESSIVE_ENHANCEMENT,
  },

  // Rate limiting
  rateLimit: {
    perHour: env.RATE_LIMIT_PER_HOUR,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
  },

  // Timeouts
  timeouts: {
    pageFetch: env.TIMEOUT_PAGE_FETCH,
    robotsTxt: env.TIMEOUT_ROBOTS_TXT,
    ttfbCheck: env.TIMEOUT_TTFB_CHECK,
  },

  // Cache settings
  cache: {
    chromeUxTtl: env.CACHE_CHROME_UX_TTL,
    robotsTxtTtl: env.CACHE_ROBOTS_TXT_TTL,
  },

  // Content limits
  limits: {
    maxContentLength: env.MAX_CONTENT_LENGTH,
    maxWordCount: env.MAX_WORD_COUNT,
  },

  // URLs
  urls: {
    workerUrl: env.NEXT_PUBLIC_WORKER_URL,
  },
} as const;

// Type exports
export type Config = typeof config;
export type ApiConfig = typeof config.api;
export type FeatureFlags = typeof config.features;

// Validate configuration on startup
if (config.isProduction) {
  // Ensure critical configurations are set in production
  if (!config.api.cloudflareWorker.url) {
    console.warn('Cloudflare Worker URL not configured - falling back to direct fetch');
  }
}

// Export individual configurations for convenience
export const { api, features, rateLimit, timeouts, cache, limits, urls } = config;

// Default export
export default config;
