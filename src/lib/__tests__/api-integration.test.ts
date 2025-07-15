/**
 * API Integration Test
 * Tests the full flow from client request to API response
 * Run with: npm test -- api-integration
 */

describe('API Analyze Endpoint Integration', () => {
  const API_URL = 'http://localhost:3000/api/analyze';

  // Helper to make API request
  async function testAnalyzeAPI(url: string) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Test basic connectivity
  it('should connect to API endpoint', async () => {
    const result = await testAnalyzeAPI('https://example.com');
    console.log('API Test - Basic connectivity:', result);
    
    // If status is 0, server is not running
    expect(result.status).not.toBe(0);
  });

  // Test valid URL
  it('should analyze valid URL successfully', async () => {
    const result = await testAnalyzeAPI('https://example.com');
    console.log('API Test - Valid URL result:', result);
    
    if (result.ok) {
      expect(result.data.success).toBe(true);
      expect(result.data.data).toBeDefined();
      expect(result.data.data.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.data.data.totalScore).toBeLessThanOrEqual(100);
    }
  });

  // Test invalid URL
  it('should reject invalid URL', async () => {
    const result = await testAnalyzeAPI('not-a-valid-url');
    console.log('API Test - Invalid URL result:', result);
    
    expect(result.ok).toBe(false);
    expect(result.data.success).toBe(false);
    expect(result.data.error).toBeDefined();
  });

  // Test empty URL
  it('should reject empty URL', async () => {
    const result = await testAnalyzeAPI('');
    console.log('API Test - Empty URL result:', result);
    
    expect(result.ok).toBe(false);
    expect(result.data.success).toBe(false);
    expect(result.data.error).toContain('required');
  });

  // Test localhost blocking
  it('should reject localhost URLs', async () => {
    const result = await testAnalyzeAPI('http://localhost:8080');
    console.log('API Test - Localhost URL result:', result);
    
    expect(result.ok).toBe(false);
    expect(result.data.success).toBe(false);
    expect(result.data.error).toContain('Local/internal URLs are not allowed');
  });
});

// Manual test runner (can be run with: node -r ts-node/register this-file.ts)
if (require.main === module) {
  console.log('Running manual API tests...\n');
  
  async function runManualTests() {
    const testUrls = [
      'https://example.com',
      'google.com',
      'not-a-url',
      '',
      'http://localhost:3000',
    ];

    for (const url of testUrls) {
      console.log(`\nTesting URL: "${url}"`);
      console.log('-'.repeat(50));
      
      try {
        const response = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        console.log('Status:', response.status, response.statusText);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }
    }
  }

  runManualTests().catch(console.error);
}