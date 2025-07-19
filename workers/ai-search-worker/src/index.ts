export interface Env {
  CACHE: KVNamespace;
  RATE_LIMITER: DurableObjectNamespace;
}

// Quick analysis for progressive enhancement
interface QuickAnalysisResult {
  url: string;
  timestamp: number;
  quickScores: {
    retrieval: number;
    factDensity: number;
    structure: number;
    trust: number;
    recency: number;
  };
  pageType: string;
  basicMetrics: {
    title: string;
    metaDescription: string;
    headingCount: number;
    wordCount: number;
    hasHttps: boolean;
    hasRobotsTxt?: boolean;
    hasSitemap?: boolean;
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      const { url } = await request.json() as { url: string };
      
      if (!url) {
        return new Response(JSON.stringify({ error: 'URL is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Normalize URL
      const normalizedUrl = normalizeUrl(url);
      
      // Check cache first
      const cacheKey = `quick-analysis:${normalizedUrl}`;
      const cached = await env.CACHE.get(cacheKey, { type: 'json' });
      
      if (cached && isRecent(cached as QuickAnalysisResult)) {
        return new Response(JSON.stringify({
          ...cached,
          fromCache: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Perform quick analysis
      const result = await performQuickAnalysis(normalizedUrl);
      
      // Cache for 1 hour
      await env.CACHE.put(cacheKey, JSON.stringify(result), {
        expirationTtl: 3600
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to analyze URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

// Rate limiter Durable Object
export class RateLimiter {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = 50; // 50 requests per hour

    // Get request history
    const history = await this.state.storage.get<number[]>(`requests:${ip}`) || [];
    
    // Filter out old requests
    const recentRequests = history.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= limit) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      }), { status: 429 });
    }

    // Add current request
    recentRequests.push(now);
    await this.state.storage.put(`requests:${ip}`, recentRequests);

    return new Response(JSON.stringify({ allowed: true }), { status: 200 });
  }
}

// Helper functions
function normalizeUrl(url: string): string {
  try {
    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    const parsed = new URL(url);
    // Remove trailing slash from pathname
    parsed.pathname = parsed.pathname.replace(/\/$/, '') || '/';
    // Remove common tracking parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid'].forEach(param => {
      parsed.searchParams.delete(param);
    });
    
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

function isRecent(cached: QuickAnalysisResult): boolean {
  const ONE_HOUR = 60 * 60 * 1000;
  return Date.now() - cached.timestamp < ONE_HOUR;
}

async function performQuickAnalysis(url: string): Promise<QuickAnalysisResult> {
  const startTime = Date.now();
  
  // Fetch the page
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AI-Search-Score-Bot/1.0 (https://aisearchscore.com)'
    },
    // 10 second timeout
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const parsedUrl = new URL(url);

  // Quick page analysis
  const analysis = analyzeHtml(html, parsedUrl);
  
  // Quick checks for robots.txt and sitemap
  const [hasRobotsTxt, hasSitemap] = await Promise.all([
    checkResource(parsedUrl.origin + '/robots.txt'),
    checkResource(parsedUrl.origin + '/sitemap.xml')
  ]);

  // Calculate quick scores (simplified version)
  const quickScores = calculateQuickScores({
    ...analysis,
    hasRobotsTxt,
    hasSitemap,
    responseTime: Date.now() - startTime
  });

  return {
    url,
    timestamp: Date.now(),
    quickScores,
    pageType: analysis.pageType,
    basicMetrics: {
      ...analysis.basicMetrics,
      hasRobotsTxt,
      hasSitemap
    }
  };
}

function analyzeHtml(html: string, url: URL) {
  // Extract basic information without heavy dependencies
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const headings = html.match(/<h[1-6][^>]*>/gi) || [];
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/);
  
  // Detect page type based on URL and content
  const pageType = detectPageType(url.pathname, html);

  return {
    pageType,
    basicMetrics: {
      title: titleMatch ? titleMatch[1].substring(0, 100) : '',
      metaDescription: metaDescMatch ? metaDescMatch[1].substring(0, 200) : '',
      headingCount: headings.length,
      wordCount: words.length,
      hasHttps: url.protocol === 'https:'
    }
  };
}

function detectPageType(pathname: string, html: string): string {
  // URL-based detection
  if (pathname === '/' || pathname === '') return 'homepage';
  if (pathname.match(/\/blog|\/article|\/post|\/news/i)) return 'blog';
  if (pathname.match(/\/product|\/item|\/shop/i)) return 'product';
  if (pathname.match(/\/docs|\/documentation|\/guide/i)) return 'documentation';
  if (pathname.match(/\/about/i)) return 'about';
  if (pathname.match(/\/contact/i)) return 'contact';
  
  // Content-based detection
  if (html.match(/<article|class=["'].*article|id=["'].*article/i)) return 'article';
  if (html.match(/price|add.to.cart|buy.now/i)) return 'product';
  
  return 'general';
}

async function checkResource(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

function calculateQuickScores(data: any) {
  // Simplified scoring logic for quick results
  const scores = {
    retrieval: 0,
    factDensity: 0,
    structure: 0,
    trust: 0,
    recency: 0
  };

  // RETRIEVAL (40 points)
  if (data.hasHttps) scores.retrieval += 10;
  if (data.hasRobotsTxt) scores.retrieval += 10;
  if (data.hasSitemap) scores.retrieval += 10;
  if (data.responseTime < 3000) scores.retrieval += 10;

  // FACT_DENSITY (20 points)
  if (data.basicMetrics.wordCount > 300) scores.factDensity += 10;
  if (data.basicMetrics.wordCount > 800) scores.factDensity += 10;

  // STRUCTURE (20 points)
  if (data.basicMetrics.headingCount > 0) scores.structure += 10;
  if (data.basicMetrics.metaDescription) scores.structure += 10;

  // TRUST (10 points)
  if (data.hasHttps) scores.trust += 10;

  // RECENCY (10 points)
  // Basic check - could be enhanced with actual date detection
  scores.recency = 5;

  return scores;
}