// Mock for cheerio
const cheerio = {
  load: jest.fn((html: string) => {
    // Create a mock jQuery-like function
    const $ = jest.fn((selector: string) => {
      const mockElement: any = {
        text: jest.fn(() => ({ trim: () => 'Mock text content' })),
        html: jest.fn(() => ''),
        attr: jest.fn(() => undefined),
        find: jest.fn(() => mockElement),
        each: jest.fn((callback: (i: number, el: any) => void) => {
          // Simulate some elements
          [0, 1, 2].forEach(i => callback(i, {}));
        }),
        filter: jest.fn(() => mockElement),
        first: jest.fn(() => mockElement),
        length: 1,
        map: jest.fn(() => ({
          get: jest.fn(() => []),
        })),
      };
      
      // Return different results based on selector
      if (selector === 'title') {
        mockElement.text = jest.fn(() => 'Test Title');
      } else if (selector.includes('meta[name="description"]')) {
        mockElement.attr = jest.fn(() => 'Test description');
      } else if (selector.includes('script[type="application/ld+json"]')) {
        mockElement.each = jest.fn((callback: (i: number, el: any) => void) => {
          callback(0, {});
        });
        mockElement.html = jest.fn(() => '{"@type": "FAQPage"}');
      }
      
      return mockElement;
    });
    
    // Add text method directly to $
    ($ as any).text = jest.fn(() => '');
    ($ as any).html = jest.fn(() => '');
    
    return $;
  }),
};

export = cheerio;