import { run } from '../factDensity';
import { WELL_OPTIMIZED_HTML, POORLY_OPTIMIZED_HTML } from './fixtures';

describe('Fact Density Audit Module', () => {
  describe('Well-optimized content', () => {
    it('should score well for content with rich facts and data', async () => {
      const scores = await run(WELL_OPTIMIZED_HTML);
      
      expect(scores.uniqueStats).toBeGreaterThan(0); // Has statistics
      expect(scores.dataMarkup).toBe(5); // Has tables and lists
      expect(scores.citations).toBe(5); // Has citation to MIT study
      expect(scores.deduplication).toBe(5); // No duplicate paragraphs
    });
  });

  describe('Unique stats extraction', () => {
    it('should detect percentages', async () => {
      const html = '<html><body><p>Growth increased by 50% and efficiency by 75.5%</p></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0);
    });

    it('should detect monetary values', async () => {
      const html = '<html><body><p>Revenue reached $5.2 million, up from $3M last year</p></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0);
    });

    it('should detect measurements', async () => {
      const html = '<html><body><p>The server processes 1000 requests per second at 50ms latency</p></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0);
    });

    it('should detect dates', async () => {
      const html = '<html><body><p>Founded in 2021, we expanded in March 2023</p></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0);
    });

    it('should detect proper names and companies', async () => {
      const html = '<html><body><p>John Smith from Microsoft announced OpenAI partnership</p></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0);
    });

    it('should score based on fact density per 500 words', async () => {
      const richContent = `
        <html><body><main>
          <p>In 2024, our revenue grew 45% to $12.5 million. CEO Jane Doe announced 
          that productivity increased by 30% after implementing AI tools. The company 
          now processes 5000 requests per second with 99.9% uptime.</p>
          <p>${'Filler text '.repeat(200)}</p>
        </main></body></html>
      `;
      const scores = await run(richContent);
      
      expect(scores.uniqueStats).toBe(10); // Should get full points for high density
    });
  });

  describe('Data markup detection', () => {
    it('should detect tables', async () => {
      const html = `
        <html><body>
          <table>
            <tr><th>Year</th><th>Revenue</th></tr>
            <tr><td>2023</td><td>$10M</td></tr>
          </table>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.dataMarkup).toBe(5);
    });

    it('should detect lists', async () => {
      const html = `
        <html><body>
          <ul>
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ul>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.dataMarkup).toBe(5);
    });

    it('should detect definition lists', async () => {
      const html = `
        <html><body>
          <dl>
            <dt>Term</dt>
            <dd>Definition</dd>
          </dl>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.dataMarkup).toBe(5);
    });
  });

  describe('Citation detection', () => {
    it('should detect links to authoritative sources', async () => {
      const html = `
        <html><body>
          <p>According to <a href="https://university.edu/research">research</a></p>
          <p>The <a href="https://gov.agency.gov/report">government report</a> shows</p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.citations).toBe(5); // Has 2+ citations
    });

    it('should detect academic citations', async () => {
      const html = `
        <html><body>
          <p>Study available at <a href="https://doi.org/10.1234/example">DOI</a></p>
          <p>See <a href="https://pubmed.ncbi.nlm.nih.gov/12345">PubMed</a></p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.citations).toBe(5);
    });

    it('should give partial credit for single citation', async () => {
      const html = `
        <html><body>
          <p>Source: <a href="https://research.org/paper">Study</a></p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.citations).toBe(2); // Partial credit
    });
  });

  describe('Content deduplication', () => {
    it('should detect duplicate paragraphs', async () => {
      const html = `
        <html><body>
          <p>This is a unique paragraph with interesting content about AI.</p>
          <p>This is a unique paragraph with interesting content about AI.</p>
          <p>This is a unique paragraph with interesting content about AI.</p>
          <p>Different content here to make it realistic.</p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.deduplication).toBe(0); // Too many duplicates
    });

    it('should allow less than 10% duplication', async () => {
      const html = `
        <html><body>
          ${Array(20).fill(0).map((_, i) => 
            `<p>Unique paragraph ${i} with different content and information.</p>`
          ).join('')}
          <p>Unique paragraph 0 with different content and information.</p>
        </body></html>
      `;
      const scores = await run(html);
      
      expect(scores.deduplication).toBe(5); // Under 10% threshold
    });

    it('should detect near-duplicate content', async () => {
      const html = `
        <html><body>
          <p>This is a paragraph about AI search optimization techniques.</p>
          <p>This is a paragraph about AI search optimization methods.</p>
        </body></html>
      `;
      const scores = await run(html);
      
      // Should detect high similarity
      expect(scores.deduplication).toBeLessThan(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', async () => {
      const html = '<html><body></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBe(0);
      expect(scores.dataMarkup).toBe(0);
      expect(scores.citations).toBe(0);
      expect(scores.deduplication).toBe(5); // No paragraphs = no duplication
    });

    it('should handle content with no main area', async () => {
      const html = '<html><body><div>Some content with facts: 50% growth in 2024</div></body></html>';
      const scores = await run(html);
      
      expect(scores.uniqueStats).toBeGreaterThan(0); // Should still extract from body
    });
  });
});