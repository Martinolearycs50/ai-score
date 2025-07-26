/**
 * Script to test real URLs and understand the analyzer behavior
 * Run with: npx ts-node scripts/test-real-urls.ts
 */
import axios from 'axios';

const API_URL = 'http://localhost:3002/api/analyze';

const testUrls = [
  'https://adyen.com',
  'https://stripe.com',
  'https://openai.com',
  'https://medium.com/@username/sample-article',
  'https://dev.to/some-article',
  'https://amazon.com/dp/B08N5WRWNW',
];

async function testUrl(url: string) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${url}`);
    console.log('='.repeat(80));

    const response = await axios.post(
      API_URL,
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (response.data.success) {
      const result = response.data.data;
      console.log('\nResults:');
      console.log(`- Page Type: ${result.extractedContent?.pageType || 'unknown'}`);
      console.log(`- Business Type: ${result.extractedContent?.businessType || 'unknown'}`);
      console.log(`- AI Search Score: ${result.aiSearchScore}/100`);
      console.log(
        `- Dynamic Scoring: ${result.scoringResult.dynamicScoring?.appliedWeights ? 'Yes' : 'No'}`
      );

      if (result.scoringResult.dynamicScoring) {
        console.log(`\nApplied Weights for ${result.scoringResult.dynamicScoring.pageType}:`);
        Object.entries(result.scoringResult.dynamicScoring.weights).forEach(([pillar, weight]) => {
          console.log(`  - ${pillar}: ${weight}%`);
        });
      }

      console.log('\nPillar Scores:');
      Object.entries(result.scoringResult.pillarScores).forEach(([pillar, score]) => {
        console.log(`  - ${pillar}: ${score}`);
      });

      console.log('\nTop 3 Recommendations:');
      result.scoringResult.recommendations.slice(0, 3).forEach((rec: any, i: number) => {
        console.log(`  ${i + 1}. ${rec.metric} (+${rec.gain} points)`);
      });
    } else {
      console.error('Analysis failed:', response.data.error);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Error ${error.response.status}: ${error.response.data.error || error.response.statusText}`
      );
    } else if (error.code === 'ECONNREFUSED') {
      console.error('ERROR: Dev server not running. Start it with: npm run dev');
      process.exit(1);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function main() {
  console.log('AI Search Analyzer - Real URL Testing');
  console.log('=====================================\n');

  console.log('Testing with real URLs to verify page type detection and scoring...\n');

  // Test each URL sequentially
  for (const url of testUrls) {
    await testUrl(url);
    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n\nTesting complete!');
}

// Run the script
main().catch(console.error);
