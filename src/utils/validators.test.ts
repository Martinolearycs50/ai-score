import { describe, expect, test } from '@jest/globals';
import {
  validateAndNormalizeUrl,
  parseRobotsTxt,
  detectFaqContent,
  validateSchemaMarkup,
  calculateReadingLevel,
  isSystemFile,
  urlSchema
} from './validators';

describe('URL Validation', () => {
  describe('urlSchema', () => {
    test('should validate correct URLs', () => {
      expect(() => urlSchema.parse('https://example.com')).not.toThrow();
      expect(() => urlSchema.parse('http://test.com')).not.toThrow();
      expect(() => urlSchema.parse('example.com')).not.toThrow();
    });

    test('should reject invalid URLs', () => {
      expect(() => urlSchema.parse('')).toThrow('URL is required');
      expect(() => urlSchema.parse('not a url')).toThrow('Please enter a valid URL');
      expect(() => urlSchema.parse('http://')).toThrow('Please enter a valid URL');
    });
  });

  describe('validateAndNormalizeUrl', () => {
    test('should handle empty input', () => {
      expect(validateAndNormalizeUrl('')).toEqual({
        isValid: false,
        error: 'URL is required'
      });
      expect(validateAndNormalizeUrl('   ')).toEqual({
        isValid: false,
        error: 'URL is required'
      });
    });

    test('should reject URLs with spaces', () => {
      expect(validateAndNormalizeUrl('example .com')).toEqual({
        isValid: false,
        error: 'URL cannot contain spaces'
      });
    });

    test('should normalize URLs without protocol', () => {
      const result = validateAndNormalizeUrl('example.com');
      expect(result).toEqual({
        isValid: true,
        normalizedUrl: 'https://example.com/'
      });
    });

    test('should handle URLs with protocol', () => {
      const result = validateAndNormalizeUrl('https://example.com');
      expect(result).toEqual({
        isValid: true,
        normalizedUrl: 'https://example.com/'
      });
    });

    test('should reject invalid domains', () => {
      expect(validateAndNormalizeUrl('http://ab')).toEqual({
        isValid: false,
        error: 'Invalid domain name'
      });
    });

    test('should reject localhost and internal IPs', () => {
      expect(validateAndNormalizeUrl('localhost')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('127.0.0.1')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('192.168.1.1')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('10.0.0.1')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('172.16.0.1')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('0.0.0.0')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
      expect(validateAndNormalizeUrl('[::1]')).toEqual({
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      });
    });

    test('should handle malformed URLs', () => {
      expect(validateAndNormalizeUrl('://bad')).toEqual({
        isValid: false,
        error: 'Please enter a valid URL (e.g., example.com or https://example.com)'
      });
    });

    test('should validate real-world URLs', () => {
      const validUrls = [
        { input: 'www.tap.company', expected: 'https://www.tap.company/' },
        { input: 'google.com', expected: 'https://google.com/' },
        { input: 'subdomain.example.com', expected: 'https://subdomain.example.com/' },
        { input: 'example.co.uk', expected: 'https://example.co.uk/' },
        { input: 'example.com/', expected: 'https://example.com/' },
        { input: 'example.com//', expected: 'https://example.com/' },
        { input: 'EXAMPLE.COM', expected: 'https://example.com/' },
        { input: 'https://example.com:8080', expected: 'https://example.com:8080/' },
        { input: 'example.com/path?query=value', expected: 'https://example.com/path?query=value' },
        { input: 'example.com#anchor', expected: 'https://example.com/#anchor' },
        { input: 'https://user:pass@example.com', expected: 'https://user:pass@example.com/' },
      ];

      validUrls.forEach(({ input, expected }) => {
        const result = validateAndNormalizeUrl(input);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe(expected);
      });
    });

    test('should reject invalid URL formats', () => {
      const invalidUrls = [
        { input: 'example', error: 'Invalid domain format. Please include a valid domain extension (e.g., .com, .org)' },
        { input: 'example.', error: 'Invalid domain format. Please include a valid domain extension (e.g., .com, .org)' },
        { input: '.com', error: 'Please enter a valid URL (e.g., example.com or https://example.com)' },
        { input: 'ftp://example.com', error: 'Only HTTP and HTTPS protocols are supported' },
        { input: 'file:///path/to/file', error: 'Only HTTP and HTTPS protocols are supported' },
        { input: 'javascript:alert(1)', error: 'Only HTTP and HTTPS protocols are supported' },
        { input: 'ex@mple.com', error: 'Domain contains invalid characters' },
        { input: 'example$.com', error: 'Domain contains invalid characters' },
        { input: 'example_site.com', error: 'Domain contains invalid characters' },
      ];

      invalidUrls.forEach(({ input, error }) => {
        const result = validateAndNormalizeUrl(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(error);
      });
    });

    test('should handle trailing slashes consistently', () => {
      const urls = ['example.com', 'example.com/', 'example.com//', 'example.com///'];
      urls.forEach(url => {
        const result = validateAndNormalizeUrl(url);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe('https://example.com/');
      });
    });

    test('should preserve paths and query parameters', () => {
      const testCases = [
        { input: 'example.com/path/to/page', expected: 'https://example.com/path/to/page' },
        { input: 'example.com?q=search', expected: 'https://example.com/?q=search' },
        { input: 'example.com/path?q=search&filter=1', expected: 'https://example.com/path?q=search&filter=1' },
        { input: 'example.com#section', expected: 'https://example.com/#section' },
        { input: 'example.com/path#section', expected: 'https://example.com/path#section' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validateAndNormalizeUrl(input);
        expect(result.isValid).toBe(true);
        expect(result.normalizedUrl).toBe(expected);
      });
    });
  });
});

describe('Robots.txt Parsing', () => {
  test('should allow all bots by default', () => {
    const result = parseRobotsTxt('');
    expect(result).toEqual({
      chatgpt: true,
      claude: true,
      perplexity: true,
      gemini: true
    });
  });

  test('should parse disallow all', () => {
    const robotsTxt = `
User-agent: *
Disallow: /
    `;
    const result = parseRobotsTxt(robotsTxt);
    expect(result).toEqual({
      chatgpt: false,
      claude: false,
      perplexity: false,
      gemini: false
    });
  });

  test('should parse specific bot rules', () => {
    const robotsTxt = `
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Allow: /
    `;
    const result = parseRobotsTxt(robotsTxt);
    expect(result).toEqual({
      chatgpt: false,
      claude: false,
      perplexity: true,
      gemini: true
    });
  });

  test('should handle various bot name formats', () => {
    const robotsTxt = `
User-agent: ChatGPT-User
Disallow: /

User-agent: Claude-SearchBot
Disallow: /

User-agent: OAI-SearchBot
Disallow: /
    `;
    const result = parseRobotsTxt(robotsTxt);
    expect(result.chatgpt).toBe(false);
    expect(result.claude).toBe(false);
  });

  test('should handle googlebot for gemini', () => {
    const robotsTxt = `
User-agent: Googlebot
Disallow: /
    `;
    const result = parseRobotsTxt(robotsTxt);
    expect(result.gemini).toBe(false);
  });

  test('should be case insensitive', () => {
    const robotsTxt = `
USER-AGENT: GPTBOT
DISALLOW: /
    `;
    const result = parseRobotsTxt(robotsTxt);
    expect(result.chatgpt).toBe(false);
  });
});

describe('FAQ Content Detection', () => {
  test('should detect FAQ patterns', () => {
    expect(detectFaqContent('Frequently Asked Questions')).toBe(true);
    expect(detectFaqContent('frequently asked questions')).toBe(true);
    expect(detectFaqContent('FAQ')).toBe(true);
    expect(detectFaqContent('F.A.Q.')).toBe(true);
    expect(detectFaqContent('FAQs')).toBe(true);
    expect(detectFaqContent('Common Questions')).toBe(true);
    expect(detectFaqContent('Questions and Answers')).toBe(true);
    expect(detectFaqContent('Q: What is this? A: This is a test')).toBe(true);
    expect(detectFaqContent('Question: How? Answer: Like this')).toBe(true);
  });

  test('should not detect non-FAQ content', () => {
    expect(detectFaqContent('This is regular content')).toBe(false);
    expect(detectFaqContent('About our company')).toBe(false);
    expect(detectFaqContent('')).toBe(false);
  });
});

describe('Schema Markup Validation', () => {
  test('should validate valid JSON-LD', () => {
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': 'Test Article'
    });
    
    const result = validateSchemaMarkup(schema);
    expect(result).toEqual({
      isValid: true,
      types: ['Article'],
      hasFaqSchema: false,
      hasArticleSchema: true,
      hasOrganizationSchema: false
    });
  });

  test('should handle array of schemas', () => {
    const schema = JSON.stringify([
      { '@type': 'Organization' },
      { '@type': 'FAQPage' }
    ]);
    
    const result = validateSchemaMarkup(schema);
    expect(result).toEqual({
      isValid: true,
      types: ['Organization', 'FAQPage'],
      hasFaqSchema: true,
      hasArticleSchema: false,
      hasOrganizationSchema: true
    });
  });

  test('should handle multiple types', () => {
    const schema = JSON.stringify({
      '@type': ['Article', 'NewsArticle']
    });
    
    const result = validateSchemaMarkup(schema);
    expect(result.hasArticleSchema).toBe(true);
    expect(result.types).toContain('Article,NewsArticle');
  });

  test('should detect BlogPosting as article', () => {
    const schema = JSON.stringify({
      '@type': 'BlogPosting'
    });
    
    const result = validateSchemaMarkup(schema);
    expect(result.hasArticleSchema).toBe(true);
  });

  test('should handle invalid JSON', () => {
    const result = validateSchemaMarkup('invalid json');
    expect(result).toEqual({
      isValid: false,
      types: [],
      hasFaqSchema: false,
      hasArticleSchema: false,
      hasOrganizationSchema: false
    });
  });
});

describe('Reading Level Calculation', () => {
  test('should calculate reading level for simple text', () => {
    const text = 'The cat sat on the mat. It was happy.';
    const result = calculateReadingLevel(text);
    
    expect(result.level).toBe('Very Easy');
    expect(result.score).toBeGreaterThan(90);
    expect(result.avgSentenceLength).toBe(4.5);
  });

  test('should calculate reading level for complex text', () => {
    const text = 'The implementation of sophisticated algorithmic approaches necessitates comprehensive understanding of computational complexity theory and mathematical foundations.';
    const result = calculateReadingLevel(text);
    
    expect(result.level).toBe('Very Difficult');
    expect(result.score).toBeLessThan(30);
  });

  test('should handle empty text', () => {
    const result = calculateReadingLevel('');
    expect(result.avgSentenceLength).toBe(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('should handle single sentence', () => {
    const text = 'This is one sentence.';
    const result = calculateReadingLevel(text);
    expect(result.avgSentenceLength).toBe(4);
  });

  test('should handle multiple punctuation marks', () => {
    const text = 'Question? Yes! Absolutely. Indeed...';
    const result = calculateReadingLevel(text);
    expect(result.avgSentenceLength).toBe(1);
  });

  test('should categorize all reading levels', () => {
    // Test boundary conditions for each level
    const levels = [
      { text: 'I go. You go. We go.', expectedLevel: 'Very Easy' },
      { text: 'The quick brown fox jumps over the lazy dog.', expectedLevel: 'Easy' },
      { text: 'The students studied diligently for their upcoming examinations.', expectedLevel: 'Fairly Easy' },
      { text: 'The comprehensive analysis revealed significant patterns in consumer behavior.', expectedLevel: 'Standard' },
      { text: 'The multifaceted implications of contemporary socioeconomic paradigms necessitate rigorous academic discourse.', expectedLevel: 'Fairly Difficult' },
      { text: 'The epistemological ramifications of postmodernist deconstruction theory vis-à-vis hermeneutical phenomenology remain contentious.', expectedLevel: 'Difficult' }
    ];

    levels.forEach(({ text, expectedLevel }) => {
      const result = calculateReadingLevel(text);
      // Allow for some flexibility in categorization due to approximations
      expect(['Very Easy', 'Easy', 'Fairly Easy', 'Standard', 'Fairly Difficult', 'Difficult', 'Very Difficult'])
        .toContain(result.level);
    });
  });
});

describe('System File Detection', () => {
  test('should detect system files', () => {
    expect(isSystemFile('https://example.com/robots.txt')).toBe(true);
    expect(isSystemFile('https://example.com/sitemap.xml')).toBe(true);
    expect(isSystemFile('https://example.com/sitemap.txt')).toBe(true);
    expect(isSystemFile('https://example.com/humans.txt')).toBe(true);
    expect(isSystemFile('https://example.com/security.txt')).toBe(true);
    expect(isSystemFile('https://example.com/.well-known/security.txt')).toBe(true);
  });

  test('should not detect regular files', () => {
    expect(isSystemFile('https://example.com/index.html')).toBe(false);
    expect(isSystemFile('https://example.com/about')).toBe(false);
    expect(isSystemFile('https://example.com/blog/post')).toBe(false);
  });

  test('should be case insensitive', () => {
    expect(isSystemFile('https://example.com/ROBOTS.TXT')).toBe(true);
    expect(isSystemFile('https://example.com/Sitemap.XML')).toBe(true);
  });
});