import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputUrl = body.url;
    
    console.log('[Test Fetch] Input URL:', inputUrl);
    
    // Very simple normalization
    let testUrl = inputUrl.trim();
    if (!testUrl.startsWith('http')) {
      testUrl = 'https://' + testUrl;
    }
    
    console.log('[Test Fetch] Test URL:', testUrl);
    console.log('[Test Fetch] Test URL length:', testUrl.length);
    console.log('[Test Fetch] Test URL char codes:', Array.from(testUrl).map(c => c.charCodeAt(0)));
    
    // Try native fetch instead of axios
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIsearchBot/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('[Test Fetch] Response status:', response.status);
    
    return NextResponse.json({
      success: true,
      url: testUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error) {
    console.error('[Test Fetch] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}