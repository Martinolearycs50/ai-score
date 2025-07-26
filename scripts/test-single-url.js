const axios = require('axios');

async function testUrl(url) {
  console.log(`Testing: ${url}`);

  try {
    const response = await axios.post(
      'http://localhost:3000/api/analyze',
      { url },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    if (response.data.success) {
      const result = response.data.data;
      console.log('\nResults:');
      console.log(`- Page Type: ${result.extractedContent?.pageType}`);
      console.log(
        `- Error Page: ${result.extractedContent?.primaryTopic === 'Error Page' ? 'Yes' : 'No'}`
      );
      console.log(`- Word Count: ${result.extractedContent?.wordCount}`);
      console.log(`- AI Score: ${result.aiSearchScore}/100`);
      console.log(`- Title: ${result.pageTitle?.substring(0, 60)}...`);
    } else {
      console.error('Failed:', response.data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test stripe.com with improved headers
testUrl('https://stripe.com').catch(console.error);
