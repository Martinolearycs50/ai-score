import { NextRequest, NextResponse } from 'next/server';
import { fetchCrUXData } from '@/lib/chromeUxReport';
import { capturedDomain } from '@/lib/audit/retrieval';

interface EnhanceScoreRequest {
  url: string;
  initialScores: {
    retrieval: {
      score: number;
      breakdown: {
        ttfb: number;
        paywall: number;
        mainContent: number;
        htmlSize: number;
        llmsTxtFile: number;
      };
    };
  };
}

/**
 * Progressive enhancement endpoint for Chrome UX Report data
 * Enhances RETRIEVAL scoring with real-world performance data
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnhanceScoreRequest = await request.json();
    const { url, initialScores } = body;

    if (!url || !initialScores) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch real-world CrUX data
    const cruxData = await fetchCrUXData(url);

    // If no CrUX data available, return original scores
    if (!cruxData.hasData || !cruxData.metrics?.ttfb) {
      return NextResponse.json({
        enhanced: false,
        retrieval: initialScores.retrieval,
        dataSource: 'synthetic',
        message: cruxData.error || 'No real-world data available for this URL'
      });
    }

    // Calculate enhanced TTFB score based on CrUX data
    let enhancedTtfbScore = 0;
    const cruxTtfb = cruxData.metrics.ttfb;

    if (cruxData.metrics.ttfbRating === 'good') {
      enhancedTtfbScore = 5; // < 800ms
    } else if (cruxData.metrics.ttfbRating === 'needs-improvement') {
      // More granular scoring within needs-improvement range
      if (cruxTtfb < 1200) {
        enhancedTtfbScore = 3;
      } else {
        enhancedTtfbScore = 2;
      }
    } else if (cruxTtfb < 3000) {
      enhancedTtfbScore = 1; // Poor but not terrible
    } else {
      enhancedTtfbScore = 0; // Very poor
    }

    // Calculate new total score
    const enhancedBreakdown = {
      ...initialScores.retrieval.breakdown,
      ttfb: enhancedTtfbScore
    };

    const enhancedTotalScore = Object.values(enhancedBreakdown).reduce((sum, score) => sum + score, 0);

    // Return enhanced scores with metadata
    return NextResponse.json({
      enhanced: true,
      retrieval: {
        score: enhancedTotalScore,
        breakdown: enhancedBreakdown,
        previousScore: initialScores.retrieval.score,
        improvement: enhancedTotalScore - initialScores.retrieval.score
      },
      dataSource: 'real-world',
      cruxMetrics: {
        ttfb: cruxTtfb,
        ttfbRating: cruxData.metrics.ttfbRating,
        lcp: cruxData.metrics.lcp,
        lcpRating: cruxData.metrics.lcpRating,
        cls: cruxData.metrics.cls,
        clsRating: cruxData.metrics.clsRating,
        fid: cruxData.metrics.fid,
        fidRating: cruxData.metrics.fidRating
      },
      message: 'Score enhanced with real-world Chrome user data'
    });

  } catch (error) {
    console.error('[Enhance Score API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enhance score',
        enhanced: false
      },
      { status: 500 }
    );
  }
}