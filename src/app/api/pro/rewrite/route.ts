import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { contentPreparation } from '@/lib/openai/contentPreparation';
import { contentRewriter } from '@/lib/openai/contentRewriter';
import { proAnalysisStore } from '@/lib/proAnalysisStore';

// Force Node.js runtime for consistent behavior
export const runtime = 'nodejs';

// Request validation schema
const rewriteRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  focusAreas: z.array(z.string()).optional(),
  regenerate: z.boolean().optional(),
});

// Simple rate limiting for rewrite endpoint (10 rewrites per hour)
// TODO: Implement user-based rate limiting once authentication is added
// TODO: Store rate limit data in Redis for production
const rewriteRequestCounts = new Map<string, { count: number; resetTime: number }>();
const REWRITE_LIMIT_PER_HOUR = 10;

function checkRewriteRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rewriteRequestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rewriteRequestCounts.set(clientId, {
      count: 1,
      resetTime: now + 3600000, // 1 hour
    });
    return true;
  }

  if (clientData.count >= REWRITE_LIMIT_PER_HOUR) {
    return false;
  }

  clientData.count++;
  rewriteRequestCounts.set(clientId, clientData);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for Pro users
    // TODO: Verify user has active Pro subscription before allowing access

    // Rate limiting check
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const isAllowed = checkRewriteRateLimit(ip);

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many rewrite requests. Please try again later. (Limit: 10 per hour)',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = rewriteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { sessionId, focusAreas = [], regenerate = false } = validation.data;

    // Get the analysis from the store
    const analysis = proAnalysisStore.getAnalysis(sessionId);
    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis not found. Please run analysis first.',
        },
        { status: 404 }
      );
    }

    // Check if rewrite already exists and not regenerating
    if (analysis.aiRewrite && !regenerate) {
      return NextResponse.json({
        success: true,
        data: {
          rewrite: analysis.aiRewrite,
          cached: true,
        },
      });
    }

    // Check if OpenAI is configured
    if (!contentRewriter.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'AI rewriting is not configured. Please add OPENAI_API_KEY to environment variables.',
        },
        { status: 503 }
      );
    }

    // Fetch the original HTML content
    const htmlResponse = await fetch(analysis.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchScoreBot/1.0)',
      },
    });

    if (!htmlResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch page content for rewriting',
        },
        { status: 500 }
      );
    }

    const html = await htmlResponse.text();

    // Prepare content for rewriting
    const preparedContent = contentPreparation.prepareContent(
      html,
      analysis.analysis.extractedContent
    );

    // Format for AI prompt
    const contentForPrompt = contentPreparation.formatForPrompt(preparedContent);

    // Perform AI rewriting
    const rewriteResult = await contentRewriter.rewriteContent(
      contentForPrompt,
      analysis.analysis,
      analysis.deepAnalysis!,
      { focusAreas }
    );

    if (!rewriteResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: rewriteResult.error,
        },
        { status: 500 }
      );
    }

    // Extract just the rewritten content (remove the metadata sections)
    const rewrittenContent =
      rewriteResult.rewrittenContent?.match(/\[REWRITTEN CONTENT\]([\s\S]*?)$/)?.[1]?.trim() ||
      rewriteResult.rewrittenContent ||
      '';

    // Update the store with the rewrite result
    const aiRewriteData = {
      originalContent: contentForPrompt,
      originalMarkdown: preparedContent.markdown,
      rewrittenContent,
      improvements: rewriteResult.improvements || [],
      addedDataPoints: rewriteResult.addedDataPoints || [],
      seoEnhancements: rewriteResult.seoEnhancements || [],
      generatedAt: new Date(),
      metadata: {
        tokensUsed: rewriteResult.tokensUsed,
        estimatedCost: rewriteResult.estimatedCost,
        generatedAt: new Date().toISOString(),
      },
    };

    proAnalysisStore.updateAiRewrite(sessionId, aiRewriteData);

    return NextResponse.json({
      success: true,
      data: {
        rewrite: aiRewriteData,
        cached: false,
      },
    });
  } catch (error) {
    console.error('[Pro Rewrite API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during content rewriting',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check rewrite status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Session ID is required',
      },
      { status: 400 }
    );
  }

  const analysis = proAnalysisStore.getAnalysis(sessionId);
  if (!analysis) {
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis not found',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      hasRewrite: !!analysis.aiRewrite,
      rewrite: analysis.aiRewrite || null,
    },
  });
}
