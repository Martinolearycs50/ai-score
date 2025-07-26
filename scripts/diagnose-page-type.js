/**
 * Diagnostic script to understand why page type detection is failing
 * Run with: node scripts/diagnose-page-type.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/analyze';

async function diagnoseUrl(url) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Diagnosing: ${url}`);
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
      const content = result.extractedContent;

      console.log('\n📊 Detection Results:');
      console.log(`- Page Type: ${content?.pageType || 'unknown'}`);
      console.log(`- Business Type: ${content?.businessType || 'unknown'}`);
      console.log(`- Primary Topic: ${content?.primaryTopic || 'unknown'}`);

      console.log('\n🔍 URL Analysis:');
      console.log(`- URL: ${url}`);
      console.log(`- Path: ${new URL(url).pathname}`);
      console.log(`- Is Root: ${new URL(url).pathname === '/' ? 'Yes' : 'No'}`);

      console.log('\n📝 Content Signals:');
      console.log(`- Title: ${result.pageTitle || 'No title'}`);
      console.log(`- Word Count: ${content?.wordCount || 0}`);
      console.log(`- Language: ${content?.language || 'unknown'}`);

      console.log('\n🏷️ Detected Features:');
      if (content?.detectedFeatures) {
        Object.entries(content.detectedFeatures).forEach(([feature, value]) => {
          if (value) console.log(`  ✓ ${feature}`);
        });
      }

      console.log('\n📐 Structure:');
      console.log(`- Headings Count: ${content?.contentSamples?.headings?.length || 0}`);
      if (content?.contentSamples?.headings?.length > 0) {
        console.log('- First 3 Headings:');
        content.contentSamples.headings.slice(0, 3).forEach((h) => {
          console.log(`  • H${h.level}: ${h.text}`);
        });
      }

      // Check for specific patterns that should trigger detection
      console.log('\n⚠️  Detection Issues:');

      // Homepage detection
      if (new URL(url).pathname === '/' && content?.pageType !== 'homepage') {
        console.log('- ❌ Root URL but not detected as homepage');
      }

      // Blog detection
      if (url.includes('/blog/') && content?.pageType !== 'blog') {
        console.log('- ❌ Blog URL pattern but not detected as blog');
      }

      // Product detection
      if (url.includes('/dp/') && content?.pageType !== 'product') {
        console.log('- ❌ Product URL pattern but not detected as product');
      }

      // Check for schema.org data
      console.log('\n🔧 Debug Info:');
      console.log(`- Has Payment Forms: ${content?.detectedFeatures?.hasPaymentForms}`);
      console.log(`- Has Product Listings: ${content?.detectedFeatures?.hasProductListings}`);
      console.log(`- Has Blog Posts: ${content?.detectedFeatures?.hasBlogPosts}`);
      console.log(`- Has Pricing Info: ${content?.detectedFeatures?.hasPricingInfo}`);
    } else {
      console.error('Analysis failed:', response.data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('Page Type Detection Diagnostics');
  console.log('==============================\n');

  const problemUrls = [
    'https://stripe.com', // Should be homepage
    'https://openai.com/blog/chatgpt', // Should be blog
    'https://www.amazon.com/dp/B0CHX7YM1P', // Should be product
  ];

  for (const url of problemUrls) {
    await diagnoseUrl(url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('\n\n✅ Diagnostics complete!');
}

main().catch(console.error);
