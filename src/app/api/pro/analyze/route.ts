import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { config } from '@/config';
import { AiSearchAnalyzer, type AnalysisResultNew } from '@/lib/analyzer-new';
import { deepContentAnalysis } from '@/lib/deepContentAnalysis';
import { proAnalysisStore } from '@/lib/proAnalysisStore';
import { hasProAccess } from '@/lib/tierConfig';
import { simpleValidateUrl } from '@/utils/simple-validator';
import { validateAndNormalizeUrl } from '@/utils/validators';

// Force Node.js runtime for consistent behavior
export const runtime = 'nodejs';

// Request validation schema
const proAnalyzeRequestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const validation = proAnalyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { url, sessionId, userId = 'anonymous' } = validation.data;

    // For testing phase, skip Pro access check
    // TODO: Re-enable when auth is implemented
    // const tier = request.headers.get('x-user-tier') || 'free';
    // if (!hasProAccess(tier as any)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Pro subscription required' },
    //     { status: 403 }
    //   );
    // }

    // Check usage limits
    const usageCheck = proAnalysisStore.checkAndUpdateUsage(userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly scan limit reached (${usageCheck.count}/${usageCheck.limit})`,
          usage: usageCheck,
        },
        { status: 429 }
      );
    }

    // Validate URL
    const urlValidation = simpleValidateUrl(url);
    if (!urlValidation.isValid || !urlValidation.normalizedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: urlValidation.error || 'Invalid URL',
        },
        { status: 400 }
      );
    }

    const normalizedUrl = urlValidation.normalizedUrl;

    // Generate session ID if not provided
    const analysisSessionId = sessionId || proAnalysisStore.generateSessionId();

    // Create analyzer instance
    const analyzer = new AiSearchAnalyzer();

    // Perform standard analysis first
    let standardAnalysis: AnalysisResultNew;
    try {
      standardAnalysis = await analyzer.analyzeUrl(normalizedUrl);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
        },
        { status: 500 }
      );
    }

    // Store the standard analysis
    proAnalysisStore.storeAnalysis(analysisSessionId, normalizedUrl, standardAnalysis);

    // Perform deep content analysis
    const deepAnalysis = await deepContentAnalysis(normalizedUrl, standardAnalysis);

    // Update with deep analysis
    proAnalysisStore.updateDeepAnalysis(analysisSessionId, deepAnalysis);

    // Get the complete analysis
    const completeAnalysis = proAnalysisStore.getAnalysis(analysisSessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: analysisSessionId,
        analysis: completeAnalysis,
        usage: {
          count: usageCheck.count,
          limit: usageCheck.limit,
        },
      },
    });
  } catch (error) {
    console.error('[Pro Analyze API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during analysis',
      },
      { status: 500 }
    );
  }
}
