import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/utils/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    console.log('[Validate-URL] Raw input:', {
      url,
      type: typeof url,
      length: url?.length,
      body: JSON.stringify(body)
    });
    
    // Try validation
    const result = validateAndNormalizeUrl(url);
    
    console.log('[Validate-URL] Validation result:', {
      ...result,
      fullResult: JSON.stringify(result)
    });
    
    return NextResponse.json({
      success: result.isValid,
      result,
      debug: {
        input: url,
        inputType: typeof url,
        nodeVersion: process.version,
        isVercel: process.env.VERCEL === '1'
      }
    });
  } catch (error) {
    console.error('[Validate-URL] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}