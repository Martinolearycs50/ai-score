/**
 * Application startup checks and initialization
 */
import { config } from '@/config';
import { validateEnvironment } from '@/config/validate';

export function runStartupChecks(): void {
  // Only run detailed checks in development
  if (config.isDevelopment) {
    console.log('🚀 Running startup checks...');

    const validation = validateEnvironment();

    if (!validation.valid) {
      console.error('❌ Environment configuration errors:');
      validation.errors.forEach((error) => console.error(`   ${error}`));
      console.error('\nPlease fix these errors before continuing.');

      // In development, we'll continue but warn
      console.warn('⚠️  Continuing with errors (development mode)...\n');
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validation.warnings.forEach((warning) => console.warn(`   ${warning}`));
      console.log('');
    }

    // Log active configuration
    console.log('📋 Active configuration:');
    console.log(`   Environment: ${config.env}`);
    console.log(`   Chrome UX API: ${config.api.chromeUx.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(
      `   Worker URL: ${config.api.cloudflareWorker.enabled ? '✅ Configured' : '❌ Not configured'}`
    );
    console.log(
      `   Dynamic Scoring: ${config.features.dynamicScoring ? '✅ Enabled' : '❌ Disabled'}`
    );
    console.log('');
  }

  // In production, fail fast on critical errors
  if (config.isProduction) {
    const validation = validateEnvironment();

    if (!validation.valid) {
      console.error('CRITICAL: Invalid environment configuration in production');
      validation.errors.forEach((error) => console.error(`ERROR: ${error}`));

      // Note: In a real production app, you might want to:
      // - Send alerts to monitoring
      // - Prevent app startup
      // - Log to error tracking service
    }
  }
}
