import * as cheerio from 'cheerio';
import { ContentExtractor } from '@/lib/contentExtractor';

describe('Page Type Detection', () => {
  const createExtractor = (html: string, url: string) => {
    const $ = cheerio.load(html);
    return new ContentExtractor($, url);
  };

  describe('Homepage Detection', () => {
    it('should detect root URL as homepage', () => {
      const html = '<html><body><h1>Welcome</h1></body></html>';
      const extractor = createExtractor(html, 'https://example.com/');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('homepage');
    });

    it('should detect index pages as homepage', () => {
      const urls = [
        'https://example.com/index.html',
        'https://example.com/index.php',
        'https://example.com/home',
        'https://example.com/homepage',
      ];

      urls.forEach(url => {
        const html = '<html><body><h1>Welcome</h1></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('homepage');
      });
    });

    it('should detect language variants as homepage', () => {
      const urls = [
        'https://example.com/en/',
        'https://example.com/en-us/',
        'https://example.com/fr/',
      ];

      urls.forEach(url => {
        const html = '<html><body><h1>Welcome</h1></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('homepage');
      });
    });

    it('should detect homepage by Organization schema', () => {
      const html = `
        <html>
          <body>
            <script type="application/ld+json">
              {"@type": "Organization", "name": "Example Corp"}
            </script>
            <h1>Welcome</h1>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/about');
      const result = extractor.extract();
      
      // Should be homepage due to Organization schema and short path
      expect(result.pageType).toBe('homepage');
    });
  });

  describe('Blog/Article Detection', () => {
    it('should detect blog URL patterns', () => {
      const urls = [
        'https://example.com/blog/my-post',
        'https://example.com/posts/article',
        'https://example.com/article/news',
        'https://example.com/news/latest',
        'https://example.com/insights/report',
      ];

      urls.forEach(url => {
        const html = '<html><body><article>Content</article></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('blog');
      });
    });

    it('should detect blog subdomain', () => {
      const urls = [
        'https://blog.example.com/post',
        'https://news.example.com/article',
        'https://insights.example.com/report',
      ];

      urls.forEach(url => {
        const html = '<html><body><article>Content</article></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('blog');
      });
    });

    it('should detect date patterns in URL', () => {
      const urls = [
        'https://example.com/2024/12/15/post',
        'https://example.com/2024-12-15-article',
      ];

      urls.forEach(url => {
        const html = '<html><body><article>Content</article></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('blog');
      });
    });

    it('should detect Article schema', () => {
      const html = `
        <html>
          <body>
            <script type="application/ld+json">
              {"@type": "Article", "headline": "Test Article"}
            </script>
            <article>Content</article>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/content');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('blog');
    });

    it('should detect blog by author and date elements', () => {
      const html = `
        <html>
          <body>
            <article>
              <div class="author">John Doe</div>
              <time datetime="2024-01-01">January 1, 2024</time>
              <p>Article content</p>
            </article>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/content');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('blog');
    });
  });

  describe('Product Page Detection', () => {
    it('should detect product URL patterns', () => {
      const urls = [
        'https://example.com/product/item-123',
        'https://example.com/products/category/item',
        'https://example.com/shop/item',
        'https://example.com/store/product',
        'https://example.com/p/12345',
      ];

      urls.forEach(url => {
        const html = '<html><body><div class="product">Product</div></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('product');
      });
    });

    it('should detect platform-specific patterns', () => {
      const html = '<html><body><div class="product">Product</div></body></html>';
      
      // Amazon pattern
      const amazonExtractor = createExtractor(html, 'https://example.com/dp/B001234567');
      expect(amazonExtractor.extract().pageType).toBe('product');
      
      // Shopify pattern
      const shopifyExtractor = createExtractor(html, 'https://store.shopify.com/products/item');
      expect(shopifyExtractor.extract().pageType).toBe('product');
    });

    it('should detect Product schema', () => {
      const html = `
        <html>
          <body>
            <script type="application/ld+json">
              {"@type": "Product", "name": "Test Product"}
            </script>
            <div>Product details</div>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/item');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('product');
    });

    it('should detect product by price and cart elements', () => {
      const html = `
        <html>
          <body>
            <div class="product-info">
              <h1>Product Name</h1>
              <span class="price">$99.99</span>
              <button class="add-to-cart">Add to Cart</button>
            </div>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/item');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('product');
    });
  });

  describe('Other Page Types', () => {
    it('should detect documentation pages', () => {
      const urls = [
        'https://example.com/docs/guide',
        'https://example.com/documentation/api',
        'https://example.com/manual/setup',
      ];

      urls.forEach(url => {
        const html = '<html><body><div class="docs-content">Documentation</div></body></html>';
        const extractor = createExtractor(html, url);
        const result = extractor.extract();
        expect(result.pageType).toBe('documentation');
      });
    });

    it('should detect homepage by navigation-heavy structure', () => {
      const html = `
        <html>
          <body>
            <nav>
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/products">Products</a>
            </nav>
            <nav class="secondary">
              <a href="/blog">Blog</a>
              <a href="/contact">Contact</a>
            </nav>
            <div class="menu">
              <a href="/services">Services</a>
            </div>
            <p>Welcome to our site</p>
          </body>
        </html>
      `;
      const extractor = createExtractor(html, 'https://example.com/main');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('homepage');
    });
  });

  describe('Default Behavior', () => {
    it('should default to blog when uncertain', () => {
      const html = '<html><body><div>Some content</div></body></html>';
      const extractor = createExtractor(html, 'https://example.com/unknown-page');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('blog');
    });

    it('should handle errors gracefully and default to blog', () => {
      const html = '<html><body><div>Content</div></body></html>';
      // Invalid URL to trigger error
      const extractor = createExtractor(html, 'not-a-valid-url');
      const result = extractor.extract();
      
      expect(result.pageType).toBe('blog');
    });
  });
});