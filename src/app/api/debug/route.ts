import { NextRequest, NextResponse } from 'next/server';

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
    
    return NextResponse.json({
      debug: true,
      headers,
      body,
      bodyError,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    debug: true,
    message: 'Debug endpoint is working',
    timestamp: new Date().toISOString()
  });
}