import { FeatureDetection } from '../featureDetection';

/**
 * Real-world tests for page type detection
 * These tests use actual HTML structures to verify page type detection accuracy
 */

// Use actual cheerio instead of mock for these tests
jest.unmock('cheerio');

describe('Page Type Detection - Real World HTML Analysis', () => {
  // Helper to test page type detection
  const testPageType = (html: string, url: string) => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const contentText = $('body').text() || '';
    const detector = new FeatureDetection($, contentText, url);
    return detector.detectPageType();
  };

  describe('Homepage Detection - Real Sites', () => {
    test('adyen.com homepage structure', () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Adyen | The platform to help your business grow</title>
            <meta name="description" content="End-to-end payments, data, and financial management in one solution. Meet the financial technology platform that helps you realize your ambitions faster.">
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Adyen",
                "url": "https://www.adyen.com",
                "logo": "https://www.adyen.com/dam/jcr:logo.svg"
              }
            </script>
          </head>
          <body>
            <header>
              <nav>
                <a href="/products">Products</a>
                <a href="/solutions">Solutions</a>
                <a href="/developers">Developers</a>
                <a href="/resources">Resources</a>
                <a href="/pricing">Pricing</a>
              </nav>
            </header>
            <main>
              <section class="hero">
                <h1>The platform to help your business grow</h1>
                <p>End-to-end payments, data, and financial management in one solution.</p>
                <a href="/contact-sales" class="cta-button">Contact sales</a>
              </section>
              <section class="features">
                <h2>Why Adyen</h2>
                <div class="feature">Payment processing</div>
                <div class="feature">Risk management</div>
                <div class="feature">Data insights</div>
              </section>
            </main>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://www.adyen.com');
      console.log('Adyen.com detected as:', pageType);
      expect(pageType).toBe('homepage');
    });

    test('stripe.com homepage structure', () => {
      const html = `
        <html>
          <head>
            <title>Stripe | Financial Infrastructure for the Internet</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Stripe, Inc.",
                "url": "https://stripe.com"
              }
            </script>
          </head>
          <body>
            <nav class="navigation">
              <a href="/products">Products</a>
              <a href="/solutions">Solutions</a>
              <a href="/developers">Developers</a>
              <a href="/resources">Resources</a>
            </nav>
            <div class="hero">
              <h1>Financial infrastructure for the internet</h1>
              <p>Millions of companies of all sizes use Stripe online and in person to accept payments, send payouts, automate financial processes, and ultimately grow revenue.</p>
            </div>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://stripe.com/');
      console.log('Stripe.com detected as:', pageType);
      expect(pageType).toBe('homepage');
    });

    test('root URL should favor homepage detection', () => {
      const html = `
        <html>
          <body>
            <h1>Welcome to Our Service</h1>
            <p>Some generic content without clear indicators</p>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://example.com/');
      console.log('Root URL detected as:', pageType);
      expect(pageType).toBe('homepage');
    });
  });

  describe('Blog/Article Detection', () => {
    test('medium-style article', () => {
      const html = `
        <html>
          <head>
            <title>How to Optimize for AI Search in 2024 - Tech Blog</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "How to Optimize for AI Search in 2024",
                "author": {
                  "@type": "Person",
                  "name": "John Developer"
                },
                "datePublished": "2024-01-15T08:00:00Z"
              }
            </script>
          </head>
          <body>
            <article>
              <header>
                <h1>How to Optimize for AI Search in 2024</h1>
                <div class="article-meta">
                  <span class="author">John Developer</span>
                  <time datetime="2024-01-15">January 15, 2024</time>
                  <span class="read-time">8 min read</span>
                </div>
              </header>
              <div class="article-content">
                <p>AI search is revolutionizing how we find information...</p>
              </div>
            </article>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://blog.example.com/how-to-optimize-ai-search');
      console.log('Blog article detected as:', pageType);
      expect(pageType).toBe('blog');
    });

    test('blog URL patterns', () => {
      const html = `<html><body><article>Content</article></body></html>`;

      const blogUrls = [
        'https://example.com/blog/my-post',
        'https://example.com/2024/01/15/my-article',
        'https://blog.example.com/posts/something',
      ];

      blogUrls.forEach((url) => {
        const pageType = testPageType(html, url);
        console.log(`${url} detected as: ${pageType}`);
        expect(pageType).toBe('blog');
      });
    });
  });

  describe('Product Page Detection', () => {
    test('e-commerce product page', () => {
      const html = `
        <html>
          <head>
            <title>iPhone 15 Pro - Buy Online</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "iPhone 15 Pro",
                "offers": {
                  "@type": "Offer",
                  "price": "999.00",
                  "priceCurrency": "USD"
                }
              }
            </script>
          </head>
          <body>
            <div class="product-page">
              <h1>iPhone 15 Pro</h1>
              <div class="product-price">$999.00</div>
              <button class="add-to-cart">Add to Cart</button>
              <div class="product-description">
                <h2>Description</h2>
                <p>The most advanced iPhone yet...</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://store.example.com/products/iphone-15-pro');
      console.log('Product page detected as:', pageType);
      expect(pageType).toBe('product');
    });
  });

  describe('Edge Cases', () => {
    test('SPA with minimal initial HTML', () => {
      const html = `
        <html>
          <head>
            <title>Modern App</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="/app.js"></script>
          </body>
        </html>
      `;

      // Root URL with minimal content should still be detected as homepage
      const pageType = testPageType(html, 'https://spa-app.com/');
      console.log('SPA root detected as:', pageType);
      expect(pageType).toBe('homepage');
    });

    test('navigation-heavy page', () => {
      const html = `
        <html>
          <body>
            <nav class="main-nav">
              ${Array(20).fill('<a href="#">Link</a>').join('\n')}
            </nav>
            <h1>Welcome</h1>
            <p>Brief content</p>
            <footer>
              ${Array(30).fill('<a href="#">Footer link</a>').join('\n')}
            </footer>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://example.com');
      console.log('Navigation-heavy page detected as:', pageType);
      // High navigation ratio should indicate homepage
      expect(pageType).toBe('homepage');
    });
  });

  describe('Current Issues to Fix', () => {
    test('adyen.com-like structure should not default to blog', () => {
      // This simulates the actual issue where sites like adyen.com are misclassified
      const html = `
        <html>
          <head>
            <title>Payment Solutions for Your Business</title>
            <meta name="description" content="Accept payments and grow your business">
          </head>
          <body>
            <header>
              <nav>Products Solutions Resources</nav>
            </header>
            <main>
              <h1>The financial platform for your business</h1>
              <p>Accept payments, anywhere.</p>
              <a href="/contact">Get started</a>
            </main>
          </body>
        </html>
      `;

      const pageType = testPageType(html, 'https://adyen.com');
      console.log('Business homepage detected as:', pageType);

      // This is likely failing in the current implementation
      expect(pageType).not.toBe('blog'); // Should NOT be blog
      expect(pageType).toBe('homepage'); // Should be homepage
    });
  });
});
