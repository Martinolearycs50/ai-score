// Simplified mock for cheerio that properly handles all test cases
const cheerio = {
  load: jest.fn(() => {
    // Create a mock jQuery-like function
    const $ = jest.fn((selector: any) => {
      // Handle when selector is an element (from filter callback, etc.)
      if (typeof selector !== 'string') {
        // Return appropriate content based on the element type
        if (selector.tagName === 'SCRIPT') {
          return {
            html: jest.fn(() => selector.textContent || ''),
            text: jest.fn(() => selector.textContent || ''),
            attr: jest.fn(() => undefined),
          };
        }
        return {
          text: jest.fn(() => selector.textContent || 'research study'),
          attr: jest.fn((attr) => {
            if (attr === 'href') return selector.href;
            if (attr === 'content') return selector.content;
            return undefined;
          }),
          html: jest.fn(() => selector.innerHTML || ''),
        };
      }

      // Return different mocks based on selector
      if (selector === 'title') {
        return {
          text: jest.fn(() => 'Test Page Title'),
          html: jest.fn(() => '<title>Test Page Title</title>'),
        };
      }

      if (selector === 'meta[name="description"]') {
        return {
          attr: jest.fn((attr) => {
            if (attr === 'content') return 'Test meta description';
            return undefined;
          }),
          text: jest.fn(() => ''),
        };
      }

      if (selector === 'script[type="application/ld+json"]') {
        return {
          length: 0,
          toArray: jest.fn(() => []),
          each: jest.fn(),
          text: jest.fn(() => ''),
        };
      }

      if (selector === 'article, .article, .blog-post') {
        return {
          length: 0,
          text: jest.fn(() => ''),
        };
      }

      if (selector === '.author, .by-author') {
        return {
          length: 0,
        };
      }

      if (selector === '.price, [itemprop="price"]') {
        return {
          length: 0,
        };
      }

      if (selector === 'button[class*="cart"], .add-to-cart') {
        return {
          length: 0,
        };
      }

      if (selector === 'h1, h2, h3, h4') {
        return {
          each: jest.fn((callback) => {
            const headings = [
              { tagName: 'h1', textContent: 'Main Heading' },
              { tagName: 'h2', textContent: 'Subheading' },
            ];
            headings.forEach((el, index) => callback(index, el));
          }),
          filter: jest.fn(() => ({
            length: 0,
          })),
        };
      }

      if (selector === 'p') {
        return {
          each: jest.fn((callback) => {
            const paragraphs = [{ textContent: 'This is a test paragraph with some content.' }];
            paragraphs.forEach((el, index) => callback(index, el));
          }),
          length: 1,
          text: jest.fn(() => 'This is a test paragraph with some content.'),
        };
      }

      if (selector === 'html') {
        return {
          attr: jest.fn((attr) => {
            if (attr === 'lang') return 'en';
            return undefined;
          }),
        };
      }

      // Default mock for other selectors
      return {
        length: 0,
        text: jest.fn(() => ''),
        html: jest.fn(() => ''),
        attr: jest.fn(() => undefined),
        each: jest.fn(),
        find: jest.fn(() => ({
          each: jest.fn(),
          text: jest.fn(() => ''),
          length: 0,
        })),
        filter: jest.fn(() => ({
          length: 0,
        })),
        toArray: jest.fn(() => []),
      };
    });

    // Add jQuery methods to $ function
    Object.assign($, {
      html: jest.fn(() => '<html><body></body></html>'),
      text: jest.fn(() => 'Test content'),
    });

    return $;
  }),
};

export default cheerio;
export const load = cheerio.load;
