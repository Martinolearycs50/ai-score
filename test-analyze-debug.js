#!/usr/bin/env node

/**
 * Debug script to test the analyze API endpoint
 * Run with: node test-analyze-debug.js
 */

const testUrl = process.argv[2] || 'https://example.com';
const apiUrl = 'http://localhost:3000/api/analyze';

console.log('Testing AI Search Analyzer API');
console.log('==============================');
console.log(`URL to analyze: ${testUrl}`);
console.log(`API endpoint: ${apiUrl}`);
console.log('');

async function testAPI() {
  try {
    console.log('1. Sending POST request...');
    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl }),
    });

    const responseTime = Date.now() - startTime;
    console.log(`2. Response received in ${responseTime}ms`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\n3. Response body:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n4. Analysis Summary:');
      console.log(`   AI Search Score: ${data.data.aiSearchScore}/100`);
      console.log(`   Page Title: ${data.data.pageTitle}`);
      console.log(`   Pillars analyzed: ${data.data.scoringResult.breakdown.length}`);
      console.log(`   Recommendations: ${data.data.scoringResult.recommendations.length}`);
    } else if (data.error) {
      console.log('\n4. Error Details:');
      console.log(`   ${data.error}`);
    }
    
  } catch (error) {
    console.error('\nERROR: Failed to connect to API');
    console.error('Details:', error.message);
    console.error('\nPossible causes:');
    console.error('- Dev server not running (run: npm run dev)');
    console.error('- Wrong port (check if running on 3000)');
    console.error('- Network/firewall blocking connection');
  }
}

// Check if server is running first
fetch('http://localhost:3000')
  .then(() => {
    console.log('✓ Dev server is running\n');
    return testAPI();
  })
  .catch(() => {
    console.error('✗ Dev server is NOT running!');
    console.error('Please run: npm run dev');
    process.exit(1);
  });