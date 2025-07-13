import { NextRequest, NextResponse } from 'next/server';
import { WebsiteAnalyzer } from '@/lib/analyzer';
import type { AnalysisApiResponse } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Simple body parsing
    const body = await request.json();
    const inputUrl = body.url;
    
    console.log('[Simple API] Received URL:', inputUrl);
    
    // Basic validation
    if (!inputUrl || typeof inputUrl !== 'string' || inputUrl.trim() === '') {
      return NextResponse.json<AnalysisApiResponse>(
        {
          success: false,
          error: 'URL is required'
        },
        { status: 400 }
      );
    }
    
    // Simple URL normalization
    let normalizedUrl = inputUrl.trim();
    
    // Remove any invisible characters
    normalizedUrl = normalizedUrl.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log('[Simple API] Input URL:', inputUrl);
    console.log('[Simple API] Input URL length:', inputUrl.length);
    console.log('[Simple API] Normalized URL:', normalizedUrl);
    console.log('[Simple API] Normalized URL length:', normalizedUrl.length);
    
    // Basic domain check
    try {
      const urlObj = new URL(normalizedUrl);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Block localhost
      if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
        return NextResponse.json<AnalysisApiResponse>(
          {
            success: false,
            error: 'Local URLs are not allowed'
          },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json<AnalysisApiResponse>(
        {
          success: false,
          error: 'Invalid URL format'
        },
        { status: 400 }
      );
    }
    
    // Perform analysis
    console.log(`[Simple API] Starting analysis for URL: ${normalizedUrl}`);
    const analyzer = new WebsiteAnalyzer();
    const result = await analyzer.analyzeUrl(normalizedUrl);

    const analysisTime = Date.now() - startTime;
    console.log(`[Simple API] Analysis completed in ${analysisTime}ms`);

    return NextResponse.json<AnalysisApiResponse>(
      {
        success: true,
        data: result,
        message: `Analysis completed in ${(analysisTime / 1000).toFixed(1)}s`
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300',
        }
      }
    );

  } catch (error) {
    console.error('[Simple API] Error:', error);
    
    let errorMessage = 'Analysis failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json<AnalysisApiResponse>(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}