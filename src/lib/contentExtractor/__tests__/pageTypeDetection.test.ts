/**
 * Comprehensive unit tests for page type detection with real-world websites
 * Tests the accuracy of page type detection logic for AI search optimization
 */
import { FeatureDetection } from '../featureDetection';

// Mock cheerio to handle jest environment
const cheerio = require('cheerio');

// Helper function to create FeatureDetection instance
const createDetector = (html: string, url: string) => {
  const $ = cheerio.load(html);
  const contentText = $('body').text() || '';
  return new FeatureDetection($, contentText, url);
};

describe('Page Type Detection - Real World Tests', () => {
  describe('Homepage Detection', () => {
    test('should detect adyen.com as homepage', () => {
      const html = `
        <html>
          <head>
            <title>Adyen | The platform to help your business grow</title>
            <meta name="description" content="End-to-end payments, data, and financial management in one solution.">
            <script type="application/ld+json">
              {"@context":"https://schema.org","@type":"Organization","name":"Adyen"}
            </script>
          </head>
          <body>
            <nav>Products Services Resources</nav>
            <main>
              <h1>The platform to help your business grow</h1>
              <p>End-to-end payments, data, and financial management in one solution.</p>
              <a href="/products">Explore products</a>
            </main>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://adyen.com');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('homepage');
    });

    test('should detect stripe.com as homepage', () => {
      const html = `
        <html>
          <head>
            <title>Stripe | Payment Processing Platform for the Internet</title>
            <script type="application/ld+json">
              {"@type":"Organization","name":"Stripe","url":"https://stripe.com"}
            </script>
          </head>
          <body>
            <h1>Financial infrastructure for the internet</h1>
            <p>Millions of companies use Stripe</p>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://stripe.com/');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('homepage');
    });

    test('should detect openai.com as homepage', () => {
      const html = `
        <html>
          <head>
            <title>OpenAI</title>
          </head>
          <body>
            <h1>Creating safe AGI that benefits all of humanity</h1>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://openai.com');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('homepage');
    });

    test('should detect language variant homepages', () => {
      const html = '<html><body>Welcome</body></html>';

      // Test various language URLs
      const urls = [
        'https://example.com/en/',
        'https://example.com/en-us/',
        'https://example.com/fr/',
        'https://example.com/de/',
        'https://example.com/es/',
      ];

      urls.forEach((url) => {
        const detector = createDetector(html, url);
        expect(detector.detectPageType()).toBe('homepage');
      });
    });
  });

  describe('Blog/Article Detection', () => {
    test('should detect Medium article as blog', () => {
      const html = `
        <html>
          <head>
            <title>How to Build Better Software - Medium</title>
            <script type="application/ld+json">
              {"@type":"Article","headline":"How to Build Better Software","datePublished":"2024-01-15"}
            </script>
          </head>
          <body>
            <article>
              <h1>How to Build Better Software</h1>
              <div class="author">John Doe</div>
              <time datetime="2024-01-15">January 15, 2024</time>
              <p>Content here...</p>
            </article>
          </body>
        </html>
      `;

      const detector = createDetector(
        html,
        'https://medium.com/@johndoe/how-to-build-better-software-123abc'
      );
      const pageType = detector.detectPageType();

      expect(pageType).toBe('blog');
    });

    test('should detect dev.to article as blog', () => {
      const html = `
        <html>
          <body>
            <article class="article">
              <h1>Understanding TypeScript</h1>
              <div class="publish-date">Published on Dec 20, 2023</div>
              <div class="author-info">By Jane Developer</div>
            </article>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://dev.to/janedev/understanding-typescript-4k2m');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('blog');
    });

    test('should detect blog URLs with date patterns', () => {
      const html = '<html><body><article>Content</article></body></html>';

      const urls = [
        'https://example.com/2024/01/15/my-post',
        'https://example.com/blog/2024-01-15-my-article',
        'https://blog.example.com/posts/something',
      ];

      urls.forEach((url) => {
        const detector = createDetector(html, url);
        expect(detector.detectPageType()).toBe('blog');
      });
    });
  });

  describe('Product Page Detection', () => {
    test('should detect Amazon product page', () => {
      const html = `
        <html>
          <body>
            <h1>Apple iPhone 15 Pro</h1>
            <span class="price">$999.00</span>
            <button id="add-to-cart">Add to Cart</button>
            <div class="product-details">Features...</div>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://amazon.com/dp/B0CMQK1234');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('product');
    });

    test('should detect Shopify product page', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {"@type":"Product","name":"Wireless Headphones","price":"149.99"}
            </script>
          </head>
          <body>
            <div class="product">
              <h1>Wireless Headphones</h1>
              <div class="product-price">$149.99</div>
            </div>
          </body>
        </html>
      `;

      const detector = createDetector(
        html,
        'https://store.shopify.com/products/wireless-headphones'
      );
      const pageType = detector.detectPageType();

      expect(pageType).toBe('product');
    });

    test('should detect product pages by content', () => {
      const html = `
        <html>
          <body>
            <h1>Premium Coffee Maker</h1>
            <div itemprop="price">$299</div>
            <button class="add-to-cart-button">Buy Now</button>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com/shop/coffee-maker');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('product');
    });
  });

  describe('Edge Cases and SPAs', () => {
    test('should handle minimal HTML (SPA before hydration)', () => {
      const html = `
        <html>
          <body>
            <div id="root"></div>
            <script src="/bundle.js"></script>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://spa-app.com');
      const pageType = detector.detectPageType();

      // Should detect as homepage for root URL even with minimal content
      expect(pageType).toBe('homepage');
    });

    test('should handle navigation-heavy pages correctly', () => {
      const html = `
        <html>
          <body>
            <nav>
              <a href="/products">Products</a>
              <a href="/services">Services</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
            <main>
              <h1>Welcome to Our Platform</h1>
            </main>
            ${Array(50).fill('<a href="#">Link</a>').join('')}
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com');
      const pageType = detector.detectPageType();

      // Navigation-heavy structure should indicate homepage
      expect(pageType).toBe('homepage');
    });

    test('should not misclassify product listings as blog', () => {
      const html = `
        <html>
          <body>
            <h1>Our Products</h1>
            <div class="product-grid">
              <div class="product">Product 1</div>
              <div class="product">Product 2</div>
            </div>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com/products');
      const pageType = detector.detectPageType();

      // Should not default to blog
      expect(pageType).not.toBe('blog');
    });
  });

  describe('Documentation Pages', () => {
    test('should detect documentation pages', () => {
      const html = `
        <html>
          <body>
            <div class="docs-content">
              <h1>API Reference</h1>
              <code>GET /api/users</code>
            </div>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com/docs/api');
      const pageType = detector.detectPageType();

      expect(pageType).toBe('documentation');
    });
  });

  describe('Default Behavior', () => {
    test('should default to blog for ambiguous content', () => {
      const html = `
        <html>
          <body>
            <h1>Some Content</h1>
            <p>This is some text without clear indicators.</p>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com/random-page');
      const pageType = detector.detectPageType();

      // Current behavior defaults to blog
      expect(pageType).toBe('blog');
    });
  });

  describe('Error Pages', () => {
    test('should detect error pages', () => {
      const html = `
        <html>
          <body>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </body>
        </html>
      `;

      const detector = createDetector(html, 'https://example.com/not-found');

      // Test error detection separately
      expect(detector.isErrorPage()).toBe(true);
    });
  });
});

// Test the actual detection logic with realistic HTML structures
describe('Page Type Detection - Realistic HTML', () => {
  test('should handle complex homepage with multiple sections', () => {
    const html = `
      <html lang="en">
        <head>
          <title>TechCorp - Leading Technology Solutions</title>
          <meta property="og:type" content="website">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TechCorp",
              "url": "https://techcorp.com",
              "logo": "https://techcorp.com/logo.png"
            }
          </script>
        </head>
        <body>
          <header>
            <nav>
              <a href="/">Home</a>
              <a href="/products">Products</a>
              <a href="/solutions">Solutions</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <section class="hero">
              <h1>Transform Your Business with AI</h1>
              <p>Enterprise solutions powered by cutting-edge technology</p>
              <a href="/demo" class="cta">Get Started</a>
            </section>
            <section class="features">
              <h2>Why Choose TechCorp</h2>
              <div class="feature-grid">
                <div>Advanced Analytics</div>
                <div>24/7 Support</div>
                <div>Enterprise Security</div>
              </div>
            </section>
            <section class="testimonials">
              <h2>Trusted by Industry Leaders</h2>
            </section>
          </main>
          <footer>
            <p>&copy; 2024 TechCorp. All rights reserved.</p>
          </footer>
        </body>
      </html>
    `;

    const detector = createDetector(html, 'https://techcorp.com/');
    expect(detector.detectPageType()).toBe('homepage');
  });

  test('should handle blog with rich content', () => {
    const html = `
      <html>
        <head>
          <title>10 Ways AI is Transforming Healthcare | TechBlog</title>
          <meta property="article:published_time" content="2024-01-20T10:00:00Z">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": "10 Ways AI is Transforming Healthcare",
              "author": {
                "@type": "Person",
                "name": "Dr. Sarah Johnson"
              },
              "datePublished": "2024-01-20"
            }
          </script>
        </head>
        <body>
          <article>
            <header>
              <h1>10 Ways AI is Transforming Healthcare</h1>
              <div class="article-meta">
                <span class="author">By Dr. Sarah Johnson</span>
                <time datetime="2024-01-20">January 20, 2024</time>
                <span class="read-time">8 min read</span>
              </div>
            </header>
            <div class="article-content">
              <p>Artificial intelligence is revolutionizing healthcare...</p>
              <h2>1. Early Disease Detection</h2>
              <p>AI algorithms can detect patterns...</p>
            </div>
            <footer>
              <div class="author-bio">
                <h3>About the Author</h3>
                <p>Dr. Sarah Johnson is a healthcare technology researcher...</p>
              </div>
            </footer>
          </article>
        </body>
      </html>
    `;

    const detector = createDetector(
      html,
      'https://techblog.com/2024/01/ai-transforming-healthcare'
    );
    expect(detector.detectPageType()).toBe('blog');
  });
});
