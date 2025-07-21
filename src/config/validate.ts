/**
 * Environment validation script
 * Run this to validate your environment configuration
 */
import { config } from './index';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Chrome UX API configuration
  if (!config.api.chromeUx.apiKey) {
    warnings.push('CHROME_UX_API_KEY not configured - Chrome UX Report features will be disabled');
  } else if (config.api.chromeUx.apiKey === 'your_api_key_here') {
    errors.push('CHROME_UX_API_KEY is still set to the example value');
  }

  // Check Cloudflare Worker configuration
  if (!config.api.cloudflareWorker.url) {
    warnings.push(
      'NEXT_PUBLIC_WORKER_URL not configured - Progressive enhancement will be disabled'
    );
  }

  // Check production-specific requirements
  if (config.isProduction) {
    if (!config.api.chromeUx.apiKey) {
      errors.push('Chrome UX API key is required in production');
    }

    if (config.rateLimit.perHour > 100) {
      warnings.push('Rate limit seems high for production - consider reducing it');
    }
  }

  // Check timeout values
  if (config.timeouts.pageFetch < 10000) {
    warnings.push('Page fetch timeout is very low - some pages may timeout');
  }

  if (config.timeouts.pageFetch > 60000) {
    warnings.push('Page fetch timeout is very high - consider reducing for better UX');
  }

  // Check cache settings
  if (config.cache.chromeUxTtl < 3600000) {
    // 1 hour
    warnings.push('Chrome UX cache TTL is low - consider increasing to reduce API calls');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Run validation and print results
 */
export function printValidationReport(): void {
  const result = validateEnvironment();

  console.log('\n=== Environment Configuration Validation ===\n');

  if (result.valid) {
    console.log('✅ Configuration is valid\n');
  } else {
    console.log('❌ Configuration has errors\n');
  }

  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach((error) => console.log(`  - ${error}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('Warnings:');
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
    console.log('');
  }

  console.log('Current Configuration:');
  console.log(`  Environment: ${config.env}`);
  console.log(`  Chrome UX API: ${config.api.chromeUx.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(
    `  Worker URL: ${config.api.cloudflareWorker.enabled ? 'Configured' : 'Not configured'}`
  );
  console.log(`  Rate Limit: ${config.rateLimit.perHour} requests/hour`);
  console.log(`  Dynamic Scoring: ${config.features.dynamicScoring ? 'Enabled' : 'Disabled'}`);
  console.log('');
}

// If running directly
if (require.main === module) {
  printValidationReport();

  const result = validateEnvironment();
  if (!result.valid) {
    process.exit(1);
  }
}
