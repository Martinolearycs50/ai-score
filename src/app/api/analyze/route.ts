import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { config } from '@/config';
import { AiSearchAnalyzer, type AnalysisResultNew } from '@/lib/analyzer-new';
import { simpleValidateUrl } from '@/utils/simple-validator';
import { validateAndNormalizeUrl } from '@/utils/validators';

// Force Node.js runtime for consistent behavior
export const runtime = 'nodejs';

// API Response type for new format
interface ApiResponseNew {
  success: boolean;
  data?: AnalysisResultNew;
  error?: string;
  message?: string;
}

// Request validation schema
const analyzeRequestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

// Rate limiting (simple in-memory store for MVP)
// TODO: Replace with Redis or similar for production
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    return true;
  }

  if (clientData.count >= config.rateLimit.perHour) {
    return false;
  }

  clientData.count++;
  requestCounts.set(clientId, clientData);
  return true;
}

function getClientId(request: NextRequest): string {
  // Use IP address as client identifier (in production, consider more sophisticated methods)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const isDev = config.isDevelopment;

  console.log('[API] Analyze endpoint called at', new Date().toISOString());

  try {
    // Log request details for debugging
    if (isDev) {
      console.log('API Route - Request received at:', new Date().toISOString());
      console.log('API Route - Request method:', request.method);
      console.log('API Route - Request URL:', request.url);
      console.log('API Route - Request headers:', {
        contentType: request.headers.get('content-type'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
      });
    }

    // Check rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return NextResponse.json<ApiResponseNew>(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body with error handling
    let body;
    try {
      body = await request.json();
      if (isDev) {
        console.log('API Route - Parsed body:', body);
      }
    } catch (jsonError) {
      if (isDev) {
        console.error('API Route - JSON parsing error:', jsonError);
      }
      return NextResponse.json<ApiResponseNew>(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate the body is not empty
    if (!body || typeof body !== 'object') {
      console.error('API Route - Empty or invalid body:', body);
      return NextResponse.json<ApiResponseNew>(
        {
          success: false,
          error: 'Request body is empty or invalid',
        },
        { status: 400 }
      );
    }

    const validationResult = analyzeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('API Route - Schema validation failed:', validationResult.error.issues);
      return NextResponse.json<ApiResponseNew>(
        {
          success: false,
          error: 'Invalid request: ' + validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { url: rawUrl } = validationResult.data;

    // Ensure URL is a string and properly formatted
    const url = String(rawUrl).trim();

    // Validate and normalize the URL
    console.log('[API] Processing URL:', url);

    if (isDev) {
      console.log('API Route - URL from request:', {
        rawUrl,
        url,
        type: typeof url,
        length: url?.length,
        rawValue: JSON.stringify(url),
        charCodes: url ? Array.from(url).map((c) => c.charCodeAt(0)) : [],
      });
    }

    // Try advanced validation first
    let urlValidation = validateAndNormalizeUrl(url);

    if (isDev) {
      console.log('API Route - URL validation result:', {
        isValid: urlValidation.isValid,
        error: urlValidation.error,
        normalizedUrl: urlValidation.normalizedUrl,
        fullResult: JSON.stringify(urlValidation),
      });
    }

    // If advanced validation fails, try simple validation as fallback
    if (!urlValidation.isValid) {
      console.log('API Route - Advanced validation failed, trying simple validation');
      const simpleResult = simpleValidateUrl(url);
      console.log('API Route - Simple validation result:', simpleResult);

      if (simpleResult.isValid) {
        // Use simple validation result
        urlValidation = {
          isValid: true,
          normalizedUrl: simpleResult.normalizedUrl,
          error: undefined,
        };
        console.log('API Route - Using simple validation result');
      }
    }

    if (!urlValidation.isValid) {
      console.error('API Route - Both validations failed, returning error:', {
        error: urlValidation.error,
        defaulting: !urlValidation.error,
      });
      return NextResponse.json<ApiResponseNew>(
        {
          success: false,
          error: urlValidation.error || 'Invalid URL',
        },
        { status: 400 }
      );
    }

    const normalizedUrl = urlValidation.normalizedUrl!;
    console.log('Using normalized URL:', normalizedUrl);

    // Perform analysis
    console.log('[API] Starting analysis for URL:', normalizedUrl);
    console.log(`Starting analysis for URL: ${normalizedUrl}`);
    const analyzer = new AiSearchAnalyzer();
    const result = await analyzer.analyzeUrl(normalizedUrl);

    console.log('[API] Analysis completed successfully');
    const analysisTime = Date.now() - startTime;
    console.log(`Analysis completed in ${analysisTime}ms for: ${normalizedUrl}`);

    // Return successful response with new format
    return NextResponse.json<ApiResponseNew>(
      {
        success: true,
        data: result,
        message: `Analysis completed in ${(analysisTime / 1000).toFixed(1)}s`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    const analysisTime = Date.now() - startTime;
    console.error('[API] Analysis failed:', error);
    console.error('Analysis failed:', error);

    // Determine error type and appropriate response
    let errorMessage = 'Analysis failed. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('timeout') || message.includes('took too long')) {
        errorMessage = 'Analysis timed out. The website may be slow to respond.';
        statusCode = 408;
      } else if (message.includes('not found') || message.includes('404')) {
        errorMessage = 'Page not found. Please check the URL and try again.';
        statusCode = 404;
      } else if (message.includes('forbidden') || message.includes('403')) {
        errorMessage = 'Access denied. This website blocks automated analysis.';
        statusCode = 403;
      } else if (message.includes('network') || message.includes('connect')) {
        errorMessage = 'Unable to connect to the website. Please check the URL.';
        statusCode = 502;
      } else if (message.includes('invalid url')) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (message.includes('server returned')) {
        // Parse server error responses more clearly
        errorMessage =
          'The website returned an error. It may be blocking automated access or experiencing issues.';
        statusCode = 502;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json<ApiResponseNew>(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'AI Search Readiness Analyzer API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    { status: 200 }
  );
}
