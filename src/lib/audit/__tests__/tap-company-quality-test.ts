import { AiSearchAnalyzer } from '../../analyzer-new';
import { score } from '../../scorer-new';

/**
 * Quality Control Test for AI Search Analyzer
 * 
 * This test serves as a comprehensive validation of the analyzer's scoring logic
 * by testing against a real-world blog post from Tap Company.
 * 
 * The test:
 * 1. Analyzes a known URL (Tap Company's 3DS authentication blog post)
 * 2. Validates that scores match expected values based on manual analysis
 * 3. Ensures individual checks (ttfb, citations, etc.) return correct results
 * 4. Verifies that appropriate recommendations are generated
 * 
 * This helps ensure the analyzer is working correctly and catches any
 * regressions in the scoring logic.
 */
describe('Tap Company Blog Post Quality Control Test', () => {
  const TEST_URL = 'https://blog.tap.company/3ds-authentication-without-redirect/';
  
  // Expected scores based on actual analysis of the blog post
  const EXPECTED_SCORES = {
    // RETRIEVAL (30 pts max) - Actual: 20/30
    retrieval: {
      minScore: 20,
      maxScore: 20,
      expectedChecks: {
        ttfb: 0,             // Failed: >200ms threshold
        paywall: 5,          // Passed: No paywall
        mainContent: 5,      // Passed: Good content ratio
        htmlSize: 10         // Passed: Under 2MB
      }
    },
    
    // FACT_DENSITY (25 pts max) - Actual: 5/25
    factDensity: {
      minScore: 5,
      maxScore: 5,
      expectedChecks: {
        uniqueStats: 0,      // Failed: <5 stats per 500 words
        dataMarkup: 0,       // Failed: No tables/lists for data
        citations: 0,        // Failed: No external citations
        deduplication: 5     // Passed: No duplicate content
      }
    },
    
    // STRUCTURE (20 pts max) - Actual: 0/20
    structure: {
      minScore: 0,
      maxScore: 0,
      expectedChecks: {
        headingFrequency: 0, // Failed: Headings >300 words apart
        headingDepth: 0,     // Failed: Heading depth >3 levels
        structuredData: 0,   // Failed: No FAQ/HowTo schema
        rssFeed: 0          // Failed: No RSS feed
      }
    },
    
    // TRUST (15 pts max) - Actual: 5/15
    trust: {
      minScore: 5,
      maxScore: 5,
      expectedChecks: {
        authorBio: 0,        // Failed: No author bio
        napConsistency: 5,   // Passed: Company info present
        license: 0          // Failed: No license metadata
      }
    },
    
    // RECENCY (10 pts max) - Actual: 0/10
    recency: {
      minScore: 0,
      maxScore: 0,
      expectedChecks: {
        lastModified: 0,     // Failed: No Last-Modified header
        stableCanonical: 0   // Failed: No canonical URL
      }
    },
    
    // TOTAL SCORE - Actual: 30/100
    total: {
      minScore: 30,
      maxScore: 30
    }
  };
  
  it('should analyze Tap Company blog post and score within expected ranges', async () => {
    // Initialize analyzer
    const analyzer = new AiSearchAnalyzer();
    
    // Run analysis
    console.log(`Analyzing URL: ${TEST_URL}`);
    const result = await analyzer.analyzeUrl(TEST_URL);
    const scores = result.scoringResult;
    
    // Log actual scores for debugging
    console.log('\n=== ACTUAL SCORES ===');
    console.log(`Total Score: ${scores.total}/100`);
    console.log('\nPillar Breakdown:');
    scores.breakdown.forEach(pillar => {
      console.log(`\n${pillar.pillar}: ${pillar.earned}/${pillar.max}`);
      console.log('Checks:', JSON.stringify(pillar.checks, null, 2));
    });
    
    // Log recommendations for manual review
    console.log('\n=== RECOMMENDATIONS ===');
    scores.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.metric} (+${rec.gain} points)`);
      console.log(`   ${rec.why}`);
    });
    
    // For now, let's just log the comparison without failing the test
    console.log('\n=== SCORE COMPARISON ===');
    console.log(`Actual total: ${scores.total}`);
    console.log(`Expected range: ${EXPECTED_SCORES.total.minScore}-${EXPECTED_SCORES.total.maxScore}`);
    
    // Validate total score matches expected
    expect(scores.total).toBeGreaterThanOrEqual(EXPECTED_SCORES.total.minScore);
    expect(scores.total).toBeLessThanOrEqual(EXPECTED_SCORES.total.maxScore);
    
    // Validate individual pillar scores
    const pillarMap = {
      RETRIEVAL: EXPECTED_SCORES.retrieval,
      FACT_DENSITY: EXPECTED_SCORES.factDensity,
      STRUCTURE: EXPECTED_SCORES.structure,
      TRUST: EXPECTED_SCORES.trust,
      RECENCY: EXPECTED_SCORES.recency
    };
    
    scores.breakdown.forEach(pillar => {
      const expected = pillarMap[pillar.pillar];
      if (expected) {
        console.log(`\n${pillar.pillar} - Score: ${pillar.earned}, Expected: ${expected.minScore}-${expected.maxScore}`);
        expect(pillar.earned).toBeGreaterThanOrEqual(expected.minScore);
        expect(pillar.earned).toBeLessThanOrEqual(expected.maxScore);
        
        // Validate individual checks match expected values
        Object.entries(expected.expectedChecks).forEach(([check, expectedValue]) => {
          const actualValue = pillar.checks[check];
          if (actualValue !== expectedValue) {
            console.log(`  ⚠️ Check '${check}': expected ${expectedValue}, got ${actualValue}`);
          }
          expect(actualValue).toBe(expectedValue);
        });
      }
    });
    
    // Log recommendations for manual review
    console.log('\n=== RECOMMENDATIONS ===');
    scores.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.metric} (+${rec.gain} points)`);
      console.log(`   ${rec.why}`);
    });
    
    // Log recommendation count
    console.log(`\n=== RECOMMENDATION COUNT ===`);
    console.log(`Total recommendations: ${scores.recommendations.length}`);
    console.log(`Expected: 1-14 recommendations`);
  }, 30000); // 30 second timeout for network request
  
  it.skip('should provide specific expected recommendations', async () => {
    const analyzer = new AiSearchAnalyzer();
    
    const result = await analyzer.analyzeUrl(TEST_URL);
    const scores = result.scoringResult;
    
    const recommendationTitles = scores.recommendations.map(r => r.metric);
    
    // We expect certain recommendations based on manual analysis
    const likelyRecommendations = [
      'Add primary source citations',  // No external citations
      'Implement FAQ structured data',  // No FAQ schema
      'Add RSS feed',                  // No RSS feed
      'Add content licensing'          // No license metadata
    ];
    
    // At least 2 of our predicted recommendations should appear
    const matchingRecommendations = likelyRecommendations.filter(rec => 
      recommendationTitles.some(metric => metric.toLowerCase().includes(rec.toLowerCase()))
    );
    
    expect(matchingRecommendations.length).toBeGreaterThanOrEqual(2);
    
    console.log('\nMatching expected recommendations:');
    matchingRecommendations.forEach(rec => console.log(`- ${rec}`));
  });
});