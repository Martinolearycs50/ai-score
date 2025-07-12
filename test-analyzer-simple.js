const axios = require('axios');

async function testFetch() {
  try {
    console.log('Testing basic axios functionality...');
    
    const axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'AI-Search-Analyzer/1.0 (https://ai-search-analyzer.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });

    console.log('Attempting to fetch example.com...');
    const response = await axiosInstance.get('https://example.com');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.keys(response.headers));
    console.log('Response data length:', response.data?.length || 0);
    console.log('Response data type:', typeof response.data);
    
    if (response.data && typeof response.data === 'string') {
      console.log('First 200 chars:', response.data.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error occurred:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    
    if (error.isAxiosError) {
      console.error('This is an Axios error');
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
      }
    }
  }
}

testFetch();