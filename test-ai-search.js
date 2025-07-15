#!/usr/bin/env node

/**
 * Simple test runner for AI Search modules
 * This validates the scoring logic without complex mocking
 */

const { score } = require('./src/lib/scorer-new');

console.log('Testing AI Search Scoring System\n');

// Test 1: Perfect Score
console.log('Test 1: Perfect Score');
const perfectResults = {
  RETRIEVAL: {
    ttfb: 10,
    paywall: 5,
    mainContent: 5,
    htmlSize: 10,
  },
  FACT_DENSITY: {
    uniqueStats: 10,
    dataMarkup: 5,
    citations: 5,
    deduplication: 5,
  },
  STRUCTURE: {
    headingFrequency: 5,
    headingDepth: 5,
    structuredData: 5,
    rssFeed: 5,
  },
  TRUST: {
    authorBio: 5,
    napConsistency: 5,
    license: 5,
  },
  RECENCY: {
    lastModified: 5,
    stableCanonical: 5,
  },
};

const perfectScore = score(perfectResults);
console.log('Expected: 100, Got:', perfectScore.total);
console.log('✓ Perfect score test:', perfectScore.total === 100 ? 'PASSED' : 'FAILED');
console.log('');

// Test 2: Zero Score
console.log('Test 2: Zero Score');
const zeroResults = {
  RETRIEVAL: {
    ttfb: 0,
    paywall: 0,
    mainContent: 0,
    htmlSize: 0,
  },
  FACT_DENSITY: {
    uniqueStats: 0,
    dataMarkup: 0,
    citations: 0,
    deduplication: 0,
  },
  STRUCTURE: {
    headingFrequency: 0,
    headingDepth: 0,
    structuredData: 0,
    rssFeed: 0,
  },
  TRUST: {
    authorBio: 0,
    napConsistency: 0,
    license: 0,
  },
  RECENCY: {
    lastModified: 0,
    stableCanonical: 0,
  },
};

const zeroScore = score(zeroResults);
console.log('Expected: 0, Got:', zeroScore.total);
console.log('✓ Zero score test:', zeroScore.total === 0 ? 'PASSED' : 'FAILED');
console.log('Expected 16 recommendations, Got:', zeroScore.recommendations.length);
console.log('✓ Recommendations test:', zeroScore.recommendations.length === 16 ? 'PASSED' : 'FAILED');
console.log('');

// Test 3: Partial Score
console.log('Test 3: Partial Score');
const partialResults = {
  RETRIEVAL: {
    ttfb: 10,
    paywall: 0,
    mainContent: 5,
    htmlSize: 10,
  },
  FACT_DENSITY: {
    uniqueStats: 10,
    dataMarkup: 5,
    citations: 0,
    deduplication: 5,
  },
  STRUCTURE: {
    headingFrequency: 5,
    headingDepth: 5,
    structuredData: 0,
    rssFeed: 0,
  },
  TRUST: {
    authorBio: 0,
    napConsistency: 5,
    license: 0,
  },
  RECENCY: {
    lastModified: 5,
    stableCanonical: 0,
  },
};

const partialScore = score(partialResults);
console.log('Expected: 70, Got:', partialScore.total);
console.log('✓ Partial score test:', partialScore.total === 70 ? 'PASSED' : 'FAILED');
console.log('');

// Test 4: Pillar Scores
console.log('Test 4: Pillar Score Breakdown');
console.log('RETRIEVAL:', partialScore.pillarScores.RETRIEVAL, '(Expected: 25)');
console.log('FACT_DENSITY:', partialScore.pillarScores.FACT_DENSITY, '(Expected: 20)');
console.log('STRUCTURE:', partialScore.pillarScores.STRUCTURE, '(Expected: 10)');
console.log('TRUST:', partialScore.pillarScores.TRUST, '(Expected: 5)');
console.log('RECENCY:', partialScore.pillarScores.RECENCY, '(Expected: 5)');

const pillarTest = 
  partialScore.pillarScores.RETRIEVAL === 25 &&
  partialScore.pillarScores.FACT_DENSITY === 20 &&
  partialScore.pillarScores.STRUCTURE === 10 &&
  partialScore.pillarScores.TRUST === 5 &&
  partialScore.pillarScores.RECENCY === 5;

console.log('✓ Pillar breakdown test:', pillarTest ? 'PASSED' : 'FAILED');
console.log('');

// Test 5: Recommendations
console.log('Test 5: Recommendations');
console.log('Failed checks should generate recommendations:');
const recs = partialScore.recommendations;
console.log('Total recommendations:', recs.length);
console.log('First recommendation:', recs[0]?.metric, '-', recs[0]?.why);
console.log('✓ Recommendations exist:', recs.length > 0 ? 'PASSED' : 'FAILED');
console.log('');

// Summary
const allPassed = 
  perfectScore.total === 100 &&
  zeroScore.total === 0 &&
  zeroScore.recommendations.length === 16 &&
  partialScore.total === 70 &&
  pillarTest &&
  recs.length > 0;

console.log('=====================================');
console.log('SUMMARY:', allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗');
console.log('=====================================');