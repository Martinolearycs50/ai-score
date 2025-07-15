// Simplified mock for cheerio that properly handles all test cases
const cheerio = {
  load: jest.fn((html: string) => {
    // Create a mock jQuery-like function
    const $ = jest.fn((selector: any) => {
      // Handle when selector is an element (from filter callback, etc)
      if (typeof selector !== 'string') {
        // Return appropriate content based on the element type
        if (selector.tagName === 'SCRIPT') {
          return {
            html: jest.fn(() => selector.textContent || ''),
            text: jest.fn(() => selector.textContent || ''),
            attr: jest.fn(() => undefined)
          };
        }
        
        return {
          text: jest.fn(() => selector.textContent || 'research study'),
          attr: jest.fn((attr) => {
            if (attr === 'href') return 'https://research.edu/study';
            return undefined;
          }),
          parent: jest.fn(() => ({
            text: jest.fn(() => 'According to research study, findings show...')
          })),
          html: jest.fn(() => selector.textContent || '')
        };
      }

      // Create mock results based on actual HTML content
      const results: any = {
        elements: [],
        
        text: jest.fn(() => {
          if (selector === 'title') {
            const match = html.match(/<title>([^<]+)<\/title>/);
            return match ? match[1] : '';
          }
          
          if (selector.includes('main') || selector.includes('article') || selector === 'body') {
            // Remove all HTML tags and return text content
            return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
          
          return 'Mock text content';
        }),
        
        html: jest.fn(() => {
          if (selector.includes('script[type="application/ld+json"]')) {
            // Extract JSON content from the first matching script tag
            const scriptMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
            if (scriptMatch) {
              return scriptMatch[1].trim();
            }
          }
          return '';
        }),
        
        attr: jest.fn((attrName?: string) => {
          if (!attrName) return undefined;
          
          if (selector.includes('meta[name="description"]') && attrName === 'content') {
            const match = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/);
            return match ? match[1] : undefined;
          }
          
          if (selector.includes('meta[name="author"]') && attrName === 'content') {
            const match = html.match(/<meta[^>]*name="author"[^>]*content="([^"]+)"/);
            return match ? match[1] : undefined;
          }
          
          if ((selector.includes('meta[property="') || selector.includes('meta[name="')) && attrName === 'content') {
            // Handle both property and name meta tags
            if (selector.includes('property="')) {
              const property = selector.match(/property="([^"]+)"/)?.[1];
              if (property) {
                const regex = new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]+)"`);
                const match = html.match(regex);
                return match ? match[1] : undefined;
              }
            }
            
            if (selector.includes('name="')) {
              const name = selector.match(/name="([^"]+)"/)?.[1];
              if (name) {
                const regex = new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]+)"`);
                const match = html.match(regex);
                return match ? match[1] : undefined;
              }
            }
          }
          
          if (selector.includes('link[rel') && attrName === 'href') {
            if (selector.includes('alternate') && selector.includes('rss')) {
              return html.includes('rss') ? '/feed' : undefined;
            }
            if (selector.includes('alternate') && selector.includes('atom')) {
              return html.includes('atom') ? '/atom.xml' : undefined;
            }
            if (selector.includes('canonical')) {
              const match = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
              return match ? match[1] : undefined;
            }
          }
          
          return undefined;
        }),
        
        each: jest.fn((callback: (i: number, el: any) => void) => {
          if (selector.includes('h1, h2, h3, h4, h5, h6')) {
            // Extract all headings from HTML
            const headingRegex = /<(h[1-6])[^>]*>([^<]*)<\/\1>/gi;
            let match;
            let index = 0;
            while ((match = headingRegex.exec(html)) !== null) {
              callback(index++, {
                tagName: match[1].toUpperCase(),
                textContent: match[2]
              });
            }
          } else if (selector === 'p') {
            // Extract paragraphs
            const paragraphRegex = /<p[^>]*>([^<]*)<\/p>/gi;
            let match;
            let index = 0;
            while ((match = paragraphRegex.exec(html)) !== null) {
              if (match[1].trim()) {
                callback(index++, {
                  textContent: match[1].trim(),
                  tagName: 'P'
                });
              }
            }
          } else if (selector.includes('script[type="application/ld+json"]')) {
            const scriptRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
            let match;
            let index = 0;
            while ((match = scriptRegex.exec(html)) !== null) {
              const scriptContent = match[1].trim();
              // Create a mock element that the structure module expects
              const mockScriptEl = {
                textContent: scriptContent,
                tagName: 'SCRIPT'
              };
              callback(index++, mockScriptEl);
            }
          } else if (selector.includes('a[href^="http"]')) {
            const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/gi;
            let match;
            let index = 0;
            while ((match = linkRegex.exec(html)) !== null) {
              callback(index++, {
                getAttribute: (attr: string) => attr === 'href' ? match[1] : null,
                textContent: match[2]
              });
            }
          } else if (selector.includes('a[href*="feed"]') || selector.includes('a[href*="rss"]')) {
            const feedLinkRegex = /<a[^>]*href="([^"]*(?:feed|rss)[^"]*)"[^>]*>([^<]*)<\/a>/gi;
            let match;
            let index = 0;
            while ((match = feedLinkRegex.exec(html)) !== null) {
              callback(index++, {
                getAttribute: (attr: string) => attr === 'href' ? match[1] : null,
                textContent: match[2]
              });
            }
          }
        }),
        
        filter: jest.fn((filterFn: any) => {
          // If we're filtering links, simulate the citation detection
          if (selector.includes('a[href^="http"]')) {
            const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/gi;
            const filteredLinks = [];
            let match;
            let index = 0;
            
            while ((match = linkRegex.exec(html)) !== null) {
              const href = match[1];
              const text = match[2];
              const context = `According to ${text} research study findings show`;
              
              // Check if this link would pass the citation filter
              const isCitation = 
                href.includes('.gov') ||
                href.includes('.edu') ||
                href.includes('.org') ||
                href.includes('doi.org') ||
                href.includes('pubmed') ||
                href.includes('arxiv') ||
                href.includes('scholar') ||
                context.toLowerCase().includes('source') ||
                context.toLowerCase().includes('study') ||
                context.toLowerCase().includes('research') ||
                context.toLowerCase().includes('report') ||
                text.includes('[');
              
              if (isCitation) {
                filteredLinks.push(match);
              }
              index++;
            }
            
            return {
              length: filteredLinks.length,
              each: results.each,
              filter: results.filter,
              ...results
            };
          }
          
          return results;
        }),
        
        find: jest.fn(() => results),
        first: jest.fn(() => results),
        last: jest.fn(() => results),
        parent: jest.fn(() => results),
        
        map: jest.fn((mapFn: any) => {
          const mappedResults: any[] = [];
          
          if (selector === 'p') {
            const paragraphRegex = /<p[^>]*>([^<]*)<\/p>/gi;
            let match;
            let index = 0;
            while ((match = paragraphRegex.exec(html)) !== null) {
              if (match[1].trim()) {
                mappedResults.push(match[1].trim());
              }
            }
          }
          
          return {
            get: jest.fn(() => mappedResults),
            toArray: jest.fn(() => mappedResults)
          };
        }),
        
        toArray: jest.fn(() => []),
        get: jest.fn(() => undefined),
        eq: jest.fn(() => results),
        
        // Set length based on what was found
        length: 0
      };

      // Update length based on selector
      if (selector === 'table') {
        results.length = html.includes('<table') ? 1 : 0;
      } else if (selector.includes('ul, ol')) {
        results.length = (html.includes('<ul') || html.includes('<ol')) ? 3 : 0;
      } else if (selector === 'dl') {
        results.length = html.includes('<dl') ? 1 : 0;
      } else if (selector.includes('h1, h2, h3, h4, h5, h6')) {
        results.length = (html.match(/<h[1-6][^>]*>/gi) || []).length;
      } else if (selector.includes('link[rel')) {
        if (selector.includes('rss') || selector.includes('atom')) {
          results.length = html.includes('rss') || html.includes('atom') ? 1 : 0;
        }
      } else if (selector.includes('meta[name="author"]')) {
        results.length = html.includes('name="author"') ? 1 : 0;
      } else if (selector.includes('meta[property="article:author"]')) {
        results.length = html.includes('property="article:author"') ? 1 : 0;
      }

      return results;
    });
    
    // Add global methods to $
    ($ as any).text = jest.fn(() => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    ($ as any).html = jest.fn(() => html);
    
    return $;
  }),
};

export = cheerio;