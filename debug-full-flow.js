// Comprehensive debug script for URL validation and API flow

// 1. Test URL validation
console.log('=== TESTING URL VALIDATION ===');

function validateAndNormalizeUrl(input) {
  console.log(`\nTesting: "${input}"`);
  console.log(`- Type: ${typeof input}`);
  console.log(`- Length: ${input?.length}`);
  
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  const trimmed = input.trim();
  
  if (trimmed.includes(' ')) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces'
    };
  }

  let cleanedUrl = trimmed.replace(/\/+$/, '');
  
  if (cleanedUrl.includes('://')) {
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are supported'
      };
    }
  } else {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  try {
    const urlObj = new URL(cleanedUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    console.log(`- Parsed hostname: ${hostname}`);
    console.log(`- Full URL: ${urlObj.toString()}`);
    
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.startsWith('[') ||
        hostname === '0.0.0.0') {
      return {
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      };
    }
    
    if (!hostname || hostname.length < 3) {
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }
    
    if (hostname.startsWith('.')) {
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }
    
    if (!hostname.includes('.') || hostname.endsWith('.')) {
      return {
        isValid: false,
        error: 'Invalid domain format. Please include a valid domain extension (e.g., .com, .org)'
      };
    }
    
    if (!/^[a-z0-9.-]+$/i.test(hostname)) {
      return {
        isValid: false,
        error: 'Domain contains invalid characters'
      };
    }
    
    const normalizedUrl = urlObj.toString();
    console.log(`✓ Valid - Normalized: ${normalizedUrl}`);

    return {
      isValid: true,
      normalizedUrl: normalizedUrl
    };
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., example.com or https://example.com)'
    };
  }
}

// Test various URLs
const testUrls = [
  'www.tap.company',
  'tap.company',
  'https://www.tap.company',
  'https://www.tap.company/en-ae',
  'www.tap.company/en-ae',
  'google.com',
  'https://google.com',
  'example.com/path',
  'subdomain.example.com',
  'invalid url with spaces',
  'http://localhost',
  'ftp://example.com',
  ''
];

testUrls.forEach(url => {
  const result = validateAndNormalizeUrl(url);
  console.log(`Result:`, result);
});

// 2. Test API endpoint
console.log('\n\n=== TESTING API ENDPOINT ===');

const axios = require('axios');

async function testApiEndpoint() {
  const testUrl = 'https://www.tap.company/en-ae';
  const apiUrl = 'http://localhost:3000/api/analyze';
  
  console.log(`Testing API with URL: ${testUrl}`);
  console.log(`API endpoint: ${apiUrl}`);
  
  try {
    const response = await axios.post(apiUrl, 
      { url: testUrl },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => true // Don't throw on any status
      }
    );
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\nRequest failed:');
    console.error('- Error type:', error.name);
    console.error('- Message:', error.message);
    if (error.response) {
      console.error('- Response status:', error.response.status);
      console.error('- Response data:', error.response.data);
    }
    if (error.code) {
      console.error('- Error code:', error.code);
    }
  }
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Only run API test if axios is available
  try {
    require('axios');
    testApiEndpoint();
  } catch (e) {
    console.log('\nNote: Install axios to test API endpoint: npm install axios');
  }
}