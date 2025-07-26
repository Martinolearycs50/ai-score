import { AiSearchAnalyzer } from '../analyzer-new';

/**
 * Real-world end-to-end tests for the AI Search Analyzer
 * Tests the complete analysis pipeline with actual website structures
 */

// Unmock axios and cheerio for real-world tests
jest.unmock('axios');
jest.unmock('cheerio');

// Mock HTML responses for consistent testing
const mockHtmlResponses: Record<string, string> = {
  'https://adyen.com': `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Adyen | The financial technology platform of choice</title>
        <meta name="description" content="End-to-end payments, data, and financial management in a single solution. Meet the financial technology platform that helps you realize your ambitions faster.">
        <meta property="og:title" content="Adyen | The financial technology platform of choice">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://www.adyen.com">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Adyen",
            "url": "https://www.adyen.com",
            "logo": "https://www.adyen.com/dam/logo.svg",
            "sameAs": [
              "https://www.linkedin.com/company/adyen",
              "https://twitter.com/Adyen"
            ]
          }
        </script>
      </head>
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/our-solution">Our solution</a>
            <a href="/businesses">Businesses</a>
            <a href="/platform">Platform</a>
            <a href="/developers">Developers</a>
            <a href="/resources">Resources</a>
            <a href="/pricing">Pricing</a>
          </nav>
        </header>
        <main>
          <section class="hero">
            <h1>The financial technology platform of choice</h1>
            <p>End-to-end payments, data, and financial management in a single solution. Meet the financial technology platform that helps you realize your ambitions faster.</p>
            <a href="/contact-sales" class="cta-button">Talk to our team</a>
          </section>
          <section class="stats">
            <div class="stat">
              <span class="number">€723.5B</span>
              <span class="label">processed in 2023</span>
            </div>
            <div class="stat">
              <span class="number">26,000+</span>
              <span class="label">businesses use Adyen</span>
            </div>
          </section>
          <section class="features">
            <h2>Everything you need to grow</h2>
            <div class="feature">
              <h3>Payments</h3>
              <p>Accept payments online, in-app, and in-store</p>
            </div>
            <div class="feature">
              <h3>Data insights</h3>
              <p>Make smarter decisions with unified data</p>
            </div>
            <div class="feature">
              <h3>Financial management</h3>
              <p>Simplify reconciliation and accounting</p>
            </div>
          </section>
        </main>
        <footer>
          <p>&copy; 2024 Adyen N.V.</p>
          <address>
            Simon Carmiggeltstraat 6-50<br>
            1011 DJ Amsterdam<br>
            The Netherlands
          </address>
        </footer>
      </body>
    </html>
  `,
  'https://stripe.com/blog/ai-powered-features': `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Introducing AI-powered features for modern businesses | Stripe Blog</title>
        <meta name="description" content="Learn how Stripe is using AI to help businesses detect fraud, optimize payments, and improve customer experiences.">
        <meta property="article:published_time" content="2024-01-20T10:00:00Z">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "Introducing AI-powered features for modern businesses",
            "author": {
              "@type": "Person",
              "name": "Sarah Chen",
              "jobTitle": "Product Manager"
            },
            "datePublished": "2024-01-20",
            "publisher": {
              "@type": "Organization",
              "name": "Stripe"
            }
          }
        </script>
      </head>
      <body>
        <article>
          <header>
            <h1>Introducing AI-powered features for modern businesses</h1>
            <div class="article-meta">
              <span class="author">By Sarah Chen</span>
              <time datetime="2024-01-20">January 20, 2024</time>
              <span class="read-time">5 min read</span>
            </div>
          </header>
          <div class="article-content">
            <p>Today, we're excited to announce three new AI-powered features that help businesses operate more efficiently and securely.</p>
            
            <h2>What is AI doing for payments?</h2>
            <p>AI is transforming the payments industry by enabling real-time fraud detection, optimizing authorization rates, and personalizing customer experiences.</p>
            
            <h2>How does Stripe Radar use machine learning?</h2>
            <p>Stripe Radar uses machine learning models trained on billions of transactions to identify fraudulent patterns in real-time, blocking 99.99% of fraud attempts.</p>
            
            <h2>Key statistics</h2>
            <ul>
              <li>$500M+ in fraud prevented annually</li>
              <li>0.05% false positive rate</li>
              <li>250ms average decision time</li>
            </ul>
            
            <h2>What's next?</h2>
            <p>We're continuing to invest in AI research, with a focus on explainable AI and reducing bias in financial decision-making.</p>
          </div>
          <footer>
            <div class="author-bio">
              <h3>About the author</h3>
              <p>Sarah Chen is a Product Manager at Stripe, focusing on machine learning and fraud prevention. She has 10 years of experience in fintech and holds a PhD in Computer Science from Stanford.</p>
            </div>
          </footer>
        </article>
      </body>
    </html>
  `,
  'https://amazon.com/dp/B0CHX7YM1P': `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Apple iPhone 15 Pro Max, 256GB, Natural Titanium - Unlocked</title>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Apple iPhone 15 Pro Max",
            "image": "https://m.media-amazon.com/images/I/81.jpg",
            "description": "iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip.",
            "sku": "B0CHX7YM1P",
            "offers": {
              "@type": "Offer",
              "url": "https://amazon.com/dp/B0CHX7YM1P",
              "priceCurrency": "USD",
              "price": "1199.00",
              "availability": "https://schema.org/InStock"
            }
          }
        </script>
      </head>
      <body>
        <div class="product-main">
          <h1>Apple iPhone 15 Pro Max, 256GB, Natural Titanium - Unlocked (Renewed Premium)</h1>
          <div class="price">
            <span class="a-price-whole">$1,199</span>
          </div>
          <div class="product-details">
            <h2>Product features</h2>
            <ul>
              <li>6.7-inch Super Retina XDR display with ProMotion</li>
              <li>A17 Pro chip with 6-core GPU</li>
              <li>Pro camera system with 48MP main camera</li>
              <li>Titanium design with Action button</li>
              <li>All-day battery life</li>
            </ul>
          </div>
          <button id="add-to-cart-button" class="a-button">Add to Cart</button>
          <div class="availability">
            <span>In Stock</span>
          </div>
        </div>
      </body>
    </html>
  `,
};

// Mock axios to return our test HTML
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn((url: string) => {
      const html = mockHtmlResponses[url] || '<html><body>Not found</body></html>';
      return Promise.resolve({
        data: html,
        headers: {
          'content-type': 'text/html',
          'last-modified': new Date().toUTCString(),
        },
        status: 200,
      });
    }),
  }),
}));

describe('AI Search Analyzer - Real World End-to-End Tests', () => {
  let analyzer: AiSearchAnalyzer;

  beforeEach(() => {
    analyzer = new AiSearchAnalyzer();
  });

  describe('Homepage Analysis', () => {
    test('adyen.com should be detected as homepage with appropriate scoring', async () => {
      const result = await analyzer.analyzeUrl('https://adyen.com');

      console.log('Adyen.com Analysis Results:');
      console.log('- Page Type:', result.extractedContent?.pageType);
      console.log('- AI Search Score:', result.aiSearchScore);
      console.log(
        '- Dynamic Scoring Applied:',
        result.scoringResult.dynamicScoring?.appliedWeights
      );
      console.log('- Pillar Scores:', result.scoringResult.pillarScores);
      console.log('- Applied Weights:', result.scoringResult.dynamicScoring?.weights);

      // Assertions
      expect(result.extractedContent?.pageType).toBe('homepage');
      expect(result.scoringResult.dynamicScoring?.appliedWeights).toBe(true);
      expect(result.scoringResult.dynamicScoring?.pageType).toBe('homepage');

      // Homepage should have higher RETRIEVAL weight (35) and lower FACT_DENSITY (15)
      expect(result.scoringResult.dynamicScoring?.weights.RETRIEVAL).toBe(35);
      expect(result.scoringResult.dynamicScoring?.weights.FACT_DENSITY).toBe(15);

      // Overall score should be reasonable for a well-structured homepage
      expect(result.aiSearchScore).toBeGreaterThan(30); // Should have a decent score
      expect(result.aiSearchScore).toBeLessThan(100); // But not perfect
    });
  });

  describe('Blog Article Analysis', () => {
    test('blog article should be detected correctly with appropriate scoring', async () => {
      const result = await analyzer.analyzeUrl('https://stripe.com/blog/ai-powered-features');

      console.log('\nStripe Blog Analysis Results:');
      console.log('- Page Type:', result.extractedContent?.pageType);
      console.log('- AI Search Score:', result.aiSearchScore);
      console.log(
        '- Dynamic Scoring Applied:',
        result.scoringResult.dynamicScoring?.appliedWeights
      );
      console.log('- Pillar Scores:', result.scoringResult.pillarScores);
      console.log('- Applied Weights:', result.scoringResult.dynamicScoring?.weights);

      // Assertions
      expect(result.extractedContent?.pageType).toBe('blog');
      expect(result.scoringResult.dynamicScoring?.appliedWeights).toBe(true);
      expect(result.scoringResult.dynamicScoring?.pageType).toBe('blog');

      // Blog should have higher FACT_DENSITY weight (35) and lower TRUST (10)
      expect(result.scoringResult.dynamicScoring?.weights.FACT_DENSITY).toBe(35);
      expect(result.scoringResult.dynamicScoring?.weights.TRUST).toBe(10);

      // Blog with good content should score well
      expect(result.aiSearchScore).toBeGreaterThan(40);
    });
  });

  describe('Product Page Analysis', () => {
    test('product page should be detected correctly with appropriate scoring', async () => {
      const result = await analyzer.analyzeUrl('https://amazon.com/dp/B0CHX7YM1P');

      console.log('\nAmazon Product Analysis Results:');
      console.log('- Page Type:', result.extractedContent?.pageType);
      console.log('- AI Search Score:', result.aiSearchScore);
      console.log(
        '- Dynamic Scoring Applied:',
        result.scoringResult.dynamicScoring?.appliedWeights
      );
      console.log('- Pillar Scores:', result.scoringResult.pillarScores);
      console.log('- Applied Weights:', result.scoringResult.dynamicScoring?.weights);

      // Assertions
      expect(result.extractedContent?.pageType).toBe('product');
      expect(result.scoringResult.dynamicScoring?.appliedWeights).toBe(true);
      expect(result.scoringResult.dynamicScoring?.pageType).toBe('product');

      // Product should have balanced weights with higher FACT_DENSITY (30)
      expect(result.scoringResult.dynamicScoring?.weights.FACT_DENSITY).toBe(30);
      expect(result.scoringResult.dynamicScoring?.weights.STRUCTURE).toBe(25);
    });
  });

  describe('Scoring Consistency', () => {
    test('same content should produce similar scores regardless of tier', async () => {
      // Analyze the same URL twice (simulating free and pro tier)
      const result1 = await analyzer.analyzeUrl('https://adyen.com');
      const result2 = await analyzer.analyzeUrl('https://adyen.com');

      console.log('\nConsistency Check:');
      console.log('- First analysis score:', result1.aiSearchScore);
      console.log('- Second analysis score:', result2.aiSearchScore);

      // Scores should be identical for same content
      expect(result1.aiSearchScore).toBe(result2.aiSearchScore);
      expect(result1.extractedContent?.pageType).toBe(result2.extractedContent?.pageType);
    });
  });

  describe('Recommendation Quality', () => {
    test('recommendations should be relevant to page type', async () => {
      const result = await analyzer.analyzeUrl('https://adyen.com');

      console.log('\nRecommendations for Homepage:');
      result.scoringResult.recommendations.slice(0, 3).forEach((rec) => {
        console.log(`- ${rec.metric}: ${rec.gain} points potential gain`);
      });

      // Should have recommendations
      expect(result.scoringResult.recommendations.length).toBeGreaterThan(0);

      // Recommendations should be sorted by gain
      const gains = result.scoringResult.recommendations.map((r) => r.gain);
      const sortedGains = [...gains].sort((a, b) => b - a);
      expect(gains).toEqual(sortedGains);
    });
  });
});
