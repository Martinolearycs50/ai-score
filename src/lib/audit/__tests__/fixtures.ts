/**
 * Test fixtures for AI Search audit modules
 */

// Well-optimized page HTML
export const WELL_OPTIMIZED_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Complete Guide to AI Search Optimization</title>
  <meta name="description" content="Learn how to optimize your website for AI search engines like ChatGPT, Claude, and Perplexity with this comprehensive guide.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:title" content="Complete Guide to AI Search Optimization">
  <meta property="og:description" content="Learn how to optimize your website for AI search engines">
  <meta property="og:license" content="CC-BY-4.0">
  <meta property="article:author" content="Jane Smith">
  <meta property="article:modified_time" content="${new Date().toISOString()}">
  <link rel="canonical" href="https://example.com/ai-search-guide">
  <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "What is AI search optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI search optimization is the practice of making your content easily discoverable by AI engines."
      }
    }]
  }
  </script>
</head>
<body>
  <main>
    <article>
      <h1>Complete Guide to AI Search Optimization</h1>
      <div class="author-bio">
        <h3>About the Author</h3>
        <p>Jane Smith is a senior SEO specialist with 10 years of experience.</p>
      </div>
      
      <h2>Introduction</h2>
      <p>In 2024, over 50% of searches now happen through AI assistants. This represents a 200% increase from 2023.</p>
      
      <h2>Key Statistics</h2>
      <ul>
        <li>ChatGPT processes 1 billion queries daily</li>
        <li>Claude handles 500 million requests</li>
        <li>Perplexity serves 100 million users</li>
      </ul>
      
      <h2>How to Optimize</h2>
      <table>
        <tr><th>Platform</th><th>Key Focus</th></tr>
        <tr><td>ChatGPT</td><td>Structured data</td></tr>
        <tr><td>Claude</td><td>In-depth content</td></tr>
      </table>
      
      <p>According to a <a href="https://research.mit.edu/ai-study">MIT study</a>, websites with proper optimization see 3x more AI traffic.</p>
      
      <h2>Frequently Asked Questions</h2>
      <h3>What is the most important factor?</h3>
      <p>Content structure and clarity are crucial for AI understanding.</p>
    </article>
  </main>
  <footer>
    <address>
      Example Corp<br>
      123 Main St<br>
      San Francisco, CA 94105<br>
      <a href="tel:+14155551234">(415) 555-1234</a>
    </address>
  </footer>
</body>
</html>
`;

// Poorly optimized page HTML
export const POORLY_OPTIMIZED_HTML = `
<html>
<head>
  <title>Home</title>
</head>
<body>
  <div class="content">
    <h1>Welcome</h1>
    <h1>Another H1</h1>
    <h4>Deep heading</h4>
    <h5>Even deeper</h5>
    <h6>Too deep</h6>
    
    <div class="paywall-content premium-only">
      <p>Subscribe to read more...</p>
    </div>
    
    <p>Short content without much detail.</p>
    <p>Short content without much detail.</p>
    <p>Short content without much detail.</p>
  </div>
</body>
</html>
`;

// Paywalled content HTML
export const PAYWALLED_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Premium Article</title>
  <meta name="robots" content="noindex">
  <meta property="article:content_tier" content="locked">
</head>
<body>
  <div class="paywall-overlay">
    <p>Please subscribe to continue reading</p>
  </div>
</body>
</html>
`;

// Large HTML (over 2MB when repeated)
export const LARGE_HTML_CHUNK = '<p>' + 'x'.repeat(1000) + '</p>\n';

// Headers for testing
export const FRESH_HEADERS = {
  'last-modified': new Date().toISOString(),
  'content-type': 'text/html',
};

export const STALE_HEADERS = {
  'last-modified': new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
  'content-type': 'text/html',
};