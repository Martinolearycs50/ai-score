// Import the required modules - need to use dynamic imports for ES modules
async function testAnalyzer() {
  try {
    console.log('Testing full WebsiteAnalyzer...');
    
    // We need to test the TypeScript modules, so let's create a simpler test
    // by directly calling the API endpoint when the server is running
    console.log('This test requires the Next.js server to be running.');
    console.log('Please run: npm run dev');
    console.log('Then test with: curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d \'{"url":"example.com"}\'');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAnalyzer();