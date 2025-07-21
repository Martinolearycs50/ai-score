/**
 * API Usage Verification Utility
 * Ensures that fetched API data is actually being used in scoring
 */

interface ApiUsageLog {
  timestamp: number;
  api: string;
  dataFetched: boolean;
  dataUsed: boolean;
  details: any;
}

class ApiUsageVerifier {
  private logs: ApiUsageLog[] = [];

  /**
   * Log when API data is fetched
   */
  logApiFetch(api: string, success: boolean, data?: any) {
    const log: ApiUsageLog = {
      timestamp: Date.now(),
      api,
      dataFetched: success,
      dataUsed: false,
      details: data,
    };

    this.logs.push(log);

    if (success) {
      console.log(`✅ [API Usage] ${api} data fetched successfully`);
    } else {
      console.log(`❌ [API Usage] ${api} fetch failed`);
    }
  }

  /**
   * Log when API data is used in scoring
   */
  logApiUsage(api: string, metric: string, value: any) {
    const log = this.logs.find(
      (l) => l.api === api && l.dataFetched && !l.dataUsed && Date.now() - l.timestamp < 60000 // Within last minute
    );

    if (log) {
      log.dataUsed = true;
      console.log(`✅ [API Usage] ${api} data USED for ${metric}: ${value}`);
    } else {
      console.warn(`⚠️ [API Usage] ${api} usage logged but no recent fetch found`);
    }
  }

  /**
   * Check for unused API data
   */
  checkUnusedApiData() {
    const unused = this.logs.filter(
      (l) => l.dataFetched && !l.dataUsed && Date.now() - l.timestamp < 60000
    );

    if (unused.length > 0) {
      console.warn('⚠️ [API Usage] The following API data was fetched but NOT used:');
      unused.forEach((log) => {
        console.warn(` - ${log.api}: fetched at ${new Date(log.timestamp).toISOString()}`);
        console.warn(` Data:`, log.details);
      });
    }

    return unused;
  }

  /**
   * Get usage summary
   */
  getSummary() {
    const total = this.logs.length;
    const fetched = this.logs.filter((l) => l.dataFetched).length;
    const used = this.logs.filter((l) => l.dataUsed).length;

    return {
      total,
      fetched,
      used,
      unusedPercentage: fetched > 0 ? ((fetched - used) / fetched) * 100 : 0,
      logs: this.logs,
    };
  }

  /**
   * Clear logs older than specified time
   */
  clearOldLogs(maxAgeMs: number = 300000) {
    // 5 minutes default
    const cutoff = Date.now() - maxAgeMs;
    this.logs = this.logs.filter((l) => l.timestamp > cutoff);
  }
}

// Export singleton instance
export const apiUsageVerifier = new ApiUsageVerifier();

// Helper functions for common APIs
export function logChromeUxFetch(success: boolean, data?: any) {
  apiUsageVerifier.logApiFetch('chrome-ux', success, data);
}

export function logChromeUxUsage(metric: string, value: any) {
  apiUsageVerifier.logApiUsage('chrome-ux', metric, value);
}

export function logCloudflareWorkerFetch(success: boolean, data?: any) {
  apiUsageVerifier.logApiFetch('cloudflare-worker', success, data);
}

export function logCloudflareWorkerUsage(metric: string, value: any) {
  apiUsageVerifier.logApiUsage('cloudflare-worker', metric, value);
}

// Development mode: Check for unused data every analysis
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    apiUsageVerifier.checkUnusedApiData();
    apiUsageVerifier.clearOldLogs();
  }, 60000); // Check every minute
}
