// Test the exact URL that's failing in production
const { validateAndNormalizeUrl } = require('./src/utils/validators');

console.log('Testing URL: https://www.tap.company/');
console.log('Input details:', {
  raw: 'https://www.tap.company/',
  length: 'https://www.tap.company/'.length,
  charCodes: Array.from('https://www.tap.company/').map(c => c.charCodeAt(0))
});

const result = validateAndNormalizeUrl('https://www.tap.company/');
console.log('Validation result:', result);

// Also test without the trailing slash
console.log('\nTesting URL without trailing slash: https://www.tap.company');
const result2 = validateAndNormalizeUrl('https://www.tap.company');
console.log('Validation result:', result2);

// Test the base domain
console.log('\nTesting URL: www.tap.company');
const result3 = validateAndNormalizeUrl('www.tap.company');
console.log('Validation result:', result3);