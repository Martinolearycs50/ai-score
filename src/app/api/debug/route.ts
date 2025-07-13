import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/utils/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    let body;
    let bodyError;
    
    try {
      body = await request.json();
    } catch (e) {
      bodyError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    // Test URL validation if URL is provided
    let validationResult = null;
    if (body && body.url) {
      validationResult = validateAndNormalizeUrl(body.url);
    }
    
    return NextResponse.json({
      debug: true,
      headers,
      body,
      bodyError,
      validationResult,
      method: request.method,
      url: request.url,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    debug: true,
    message: 'Debug endpoint is working',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL
    },
    timestamp: new Date().toISOString()
  });
}