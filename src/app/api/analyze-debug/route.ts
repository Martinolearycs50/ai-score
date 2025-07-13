import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/utils/validators';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    // Try multiple validation approaches
    const results = {
      originalUrl: url,
      directValidation: validateAndNormalizeUrl(url),
      trimmedValidation: validateAndNormalizeUrl(url?.trim()),
      stringValidation: validateAndNormalizeUrl(String(url)),
      
      // Test with different URL formats
      withHttps: validateAndNormalizeUrl(`https://${url}`),
      withoutProtocol: validateAndNormalizeUrl(url?.replace(/^https?:\/\//, '')),
      
      // Environment check
      environment: {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform
      }
    };
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}