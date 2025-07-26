/**
 * Automated Pro Tier Testing Script
 * Tests the Pro tier features and evaluates quality
 */
import axios from 'axios';

interface TestResult {
  url: string;
  freeScore: number;
  proAnalysis: any;
  aiRewrite: any;
  issues: string[];
  qualityScore: number;
}

const testUrls = [
  'https://www.adyen.com',
  'https://en.wikipedia.org/wiki/Artificial_intelligence',
  'https://www.nytimes.com',
  'https://docs.python.org',
  'https://www.healthline.com',
];

async function testProTier(url: string): Promise<TestResult> {
  const issues: string[] = [];
  let freeScore = 0;
  let proAnalysis = null;
  let aiRewrite = null;
  let qualityScore = 0;

  try {
    // Test 1: Free tier analysis
    console.log(`\nTesting ${url}...`);
    console.log('1. Running free tier analysis...');

    const freeResponse = await axios.post('http://localhost:3000/api/analyze', {
      url,
      tier: 'free',
    });

    if (freeResponse.data.success) {
      freeScore = freeResponse.data.data.score;
      console.log(`   ✓ Free tier score: ${freeScore}`);
    } else {
      issues.push('Free tier analysis failed');
      console.log(`   ✗ Free tier analysis failed: ${freeResponse.data.error}`);
    }

    // Test 2: Pro tier deep analysis
    console.log('2. Running Pro tier deep analysis...');

    const proResponse = await axios.post(
      'http://localhost:3000/api/pro/analyze',
      {
        url,
        tier: 'pro',
      },
      {
        headers: {
          'x-session-id': 'test-session-' + Date.now(),
        },
      }
    );

    if (proResponse.data.success) {
      proAnalysis = proResponse.data.data;
      console.log(`   ✓ Pro analysis complete`);
      console.log(`   - Technical fixes: ${proAnalysis.technicalFixes?.length || 0}`);
      console.log(`   - Content fixes: ${proAnalysis.contentFixes?.length || 0}`);
    } else {
      issues.push('Pro tier deep analysis failed');
      console.log(`   ✗ Pro analysis failed: ${proResponse.data.error}`);
    }

    // Test 3: AI rewrite
    console.log('3. Testing AI Done-for-You rewrite...');

    const rewriteResponse = await axios.post(
      'http://localhost:3000/api/pro/rewrite',
      {
        url,
        content: proAnalysis?.extractedContent?.content || '',
        title: proAnalysis?.extractedContent?.title || '',
        tier: 'pro',
      },
      {
        headers: {
          'x-session-id': 'test-session-' + Date.now(),
        },
      }
    );

    if (rewriteResponse.data.success) {
      aiRewrite = rewriteResponse.data.data;
      console.log(`   ✓ AI rewrite complete`);
      console.log(`   - Improvements: ${aiRewrite.improvements?.length || 0}`);
      console.log(`   - Data points added: ${aiRewrite.dataPointsAdded || 0}`);
    } else {
      issues.push('AI rewrite failed');
      console.log(`   ✗ AI rewrite failed: ${rewriteResponse.data.error}`);
    }

    // Calculate quality score
    qualityScore = calculateQualityScore(freeScore, proAnalysis, aiRewrite, issues);
    console.log(`\n   Overall Quality Score: ${qualityScore}/100`);
  } catch (error: any) {
    console.error(`\nError testing ${url}:`, error.message);
    issues.push(`Test error: ${error.message}`);
  }

  return {
    url,
    freeScore,
    proAnalysis,
    aiRewrite,
    issues,
    qualityScore,
  };
}

function calculateQualityScore(
  freeScore: number,
  proAnalysis: any,
  aiRewrite: any,
  issues: string[]
): number {
  let score = 0;

  // Base functionality (40 points)
  if (freeScore > 0) score += 10; // Free tier works
  if (proAnalysis) score += 15; // Pro analysis works
  if (aiRewrite) score += 15; // AI rewrite works

  // Quality metrics (40 points)
  if (proAnalysis) {
    // Are recommendations actionable?
    const hasTechnicalFixes = proAnalysis.technicalFixes?.length > 0;
    const hasContentFixes = proAnalysis.contentFixes?.length > 0;
    if (hasTechnicalFixes) score += 10;
    if (hasContentFixes) score += 10;

    // Are scores reasonable?
    const scores = proAnalysis.pillarScores;
    if (scores && Object.values(scores).every((s: any) => s > 0 && s <= 100)) {
      score += 10;
    }

    // Do recommendations seem relevant?
    if (proAnalysis.recommendations?.length > 3) {
      score += 10;
    }
  }

  // AI rewrite quality (20 points)
  if (aiRewrite) {
    if (aiRewrite.improvements?.length > 0) score += 10;
    if (aiRewrite.dataPointsAdded > 0) score += 10;
  }

  // Deduct for issues
  score -= issues.length * 5;

  return Math.max(0, Math.min(100, score));
}

async function runAllTests() {
  console.log('AI Search Analyzer Pro Tier Testing');
  console.log('===================================\n');

  const results: TestResult[] = [];

  for (const url of testUrls) {
    const result = await testProTier(url);
    results.push(result);

    // Brief pause between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary report
  console.log('\n\nTEST SUMMARY');
  console.log('============\n');

  results.forEach((result) => {
    console.log(`${result.url}`);
    console.log(`  Free Score: ${result.freeScore}`);
    console.log(`  Quality Score: ${result.qualityScore}/100`);
    if (result.issues.length > 0) {
      console.log(`  Issues: ${result.issues.join(', ')}`);
    }
    console.log('');
  });

  const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
  console.log(`\nAverage Quality Score: ${avgQuality.toFixed(1)}/100`);

  // Key findings
  console.log('\nKEY FINDINGS:');
  if (avgQuality < 70) {
    console.log('⚠️  Quality score below 70 - significant improvements needed');
  }

  const failedTests = results.filter((r) => r.qualityScore < 50);
  if (failedTests.length > 0) {
    console.log('❌ Failed tests:', failedTests.map((r) => r.url).join(', '));
  }

  // Recommendations
  console.log('\nRECOMMENDATIONS:');
  const commonIssues = new Set<string>();
  results.forEach((r) => r.issues.forEach((i) => commonIssues.add(i)));

  if (commonIssues.size > 0) {
    console.log('Common issues to fix:');
    commonIssues.forEach((issue) => console.log(`  - ${issue}`));
  }
}

// Run the tests
runAllTests().catch(console.error);
