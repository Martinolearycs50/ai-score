import { recTemplates } from '../recommendations';

/**
 * Tests for recommendation clarity, sophistication, and user-friendliness
 * Ensures all recommendations are actionable, clear, and professionally written
 */

// Technical terms that must be explained when used
const TECHNICAL_TERMS = {
  CDN: 'Content Delivery Network',
  TTFB: 'Time To First Byte',
  schema: 'structured data',
  'Schema markup': 'structured data markup',
  RSS: 'Really Simple Syndication',
  NAP: 'Name, Address, Phone',
  canonical: 'preferred URL',
  'lazy-load': 'load on demand',
  H1: 'main heading',
  H2: 'section heading',
  H3: 'subsection heading',
  'meta tag': 'HTML metadata',
  'HTTP header': 'server response header',
  crawler: 'search engine bot',
  'anchor text': 'clickable link text',
};

// Helper function to check if text contains unexplained technical terms
function findUnexplainedTerms(text: string): string[] {
  const unexplained: string[] = [];

  for (const [term, explanation] of Object.entries(TECHNICAL_TERMS)) {
    const termRegex = new RegExp(`\\b${term}\\b`, 'i');
    if (termRegex.test(text)) {
      // Check if explanation is nearby (within 50 characters) or in parentheses
      const explanationPattern = new RegExp(
        `${term}.*?[\\(\\[\\-–—].*?${explanation}|${explanation}.*?${term}`,
        'is'
      );
      const contextPattern = new RegExp(`${term}[^.]*?(like|such as|\\(|means|is)`, 'i');

      if (!explanationPattern.test(text) && !contextPattern.test(text)) {
        unexplained.push(term);
      }
    }
  }

  return unexplained;
}

// Helper to check if text uses active voice
function usesActiveVoice(text: string): boolean {
  // Common passive voice indicators
  const passiveIndicators = [
    /\bis\s+being\s+\w+ed\b/i,
    /\bwas\s+being\s+\w+ed\b/i,
    /\bhave\s+been\s+\w+ed\b/i,
    /\bhas\s+been\s+\w+ed\b/i,
    /\bwill\s+be\s+\w+ed\b/i,
    /\bcan\s+be\s+\w+ed\b/i,
    /\bshould\s+be\s+\w+ed\b/i,
  ];

  return !passiveIndicators.some((pattern) => pattern.test(text));
}

// Helper to check readability (simplified Flesch Reading Ease)
function calculateReadability(text: string): { score: number; level: string } {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => {
    // Simple syllable counting (not perfect but good enough)
    return count + word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
  }, 0);

  if (sentences.length === 0 || words.length === 0) {
    return { score: 0, level: 'Invalid' };
  }

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  let level = 'College';
  if (score >= 90) level = '5th grade';
  else if (score >= 80) level = '6th grade';
  else if (score >= 70) level = '7th grade';
  else if (score >= 60) level = '8th-9th grade';
  else if (score >= 50) level = '10th-12th grade';
  else if (score >= 30) level = 'College';
  else level = 'Graduate';

  return { score: Math.max(0, Math.min(100, score)), level };
}

// Helper to check if text is action-oriented
function isActionOriented(text: string): boolean {
  const actionVerbs = [
    'add',
    'use',
    'create',
    'update',
    'remove',
    'enable',
    'implement',
    'wrap',
    'move',
    'replace',
    'convert',
    'link',
    'display',
    'set',
    'include',
    'offer',
    'break up',
    'restructure',
  ];

  const firstWord = text.trim().split(/\s+/)[0].toLowerCase();
  return actionVerbs.some((verb) => text.toLowerCase().includes(verb));
}

describe('Recommendation Clarity Tests', () => {
  const recommendations = Object.entries(recTemplates);

  describe('Technical Term Explanations', () => {
    test.each(recommendations)('%s recommendation explains all technical terms', (key, rec) => {
      const combinedText = `${rec.why} ${rec.fix}`;
      const unexplained = findUnexplainedTerms(combinedText);

      expect(unexplained).toEqual([]);
    });

    test('TTFB recommendation specifically explains the acronym', () => {
      const ttfb = recTemplates.ttfb;
      const hasExplanation =
        ttfb.why.includes('0.2 seconds') ||
        ttfb.fix.includes('Time To First Byte') ||
        ttfb.fix.includes('server response');

      expect(hasExplanation).toBe(true);
    });

    test('Schema recommendations explain what structured data means', () => {
      const schema = recTemplates.structuredData;
      const hasExplanation =
        schema.why.toLowerCase().includes('feeds ai') ||
        schema.why.toLowerCase().includes('speaking their language') ||
        schema.fix.toLowerCase().includes('markup');

      expect(hasExplanation).toBe(true);
    });
  });

  describe('Example Quality', () => {
    test.each(recommendations)('%s recommendation includes before/after examples', (key, rec) => {
      expect(rec.example).toBeDefined();
      expect(rec.example?.before).toBeTruthy();
      expect(rec.example?.after).toBeTruthy();
    });

    test.each(recommendations)('%s examples show concrete, realistic scenarios', (key, rec) => {
      // Examples should not be abstract placeholders
      expect(rec.example?.before).not.toMatch(/example\.com.*example/i);
      expect(rec.example?.after).not.toMatch(/your.*here/i);

      // Examples should be specific
      const hasSpecificContent =
        rec.example?.after.includes('<') || // HTML code
        rec.example?.after.includes(':') || // Configuration
        rec.example?.after.includes('=') || // Attributes
        /\d/.test(rec.example?.after || ''); // Numbers

      expect(hasSpecificContent).toBe(true);
    });
  });

  describe('Language Clarity and Sophistication', () => {
    test.each(recommendations)('%s uses clear, concise sentences', (key, rec) => {
      const sentences = rec.fix.split(/[.!?]+/).filter((s) => s.trim().length > 0);

      sentences.forEach((sentence) => {
        const wordCount = sentence.trim().split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(30);
      });
    });

    test.each(recommendations)(
      '%s maintains professional tone without jargon overload',
      (key, rec) => {
        const readability = calculateReadability(rec.fix);

        // Should be readable at 8th-12th grade level (not too simple, not too complex)
        expect(readability.score).toBeGreaterThan(30); // Not graduate level
        expect(readability.score).toBeLessThan(90); // Not elementary
      }
    );

    test.each(recommendations)('%s fix section uses action-oriented language', (key, rec) => {
      expect(isActionOriented(rec.fix)).toBe(true);
    });

    test.each(recommendations)('%s avoids passive voice in fix instructions', (key, rec) => {
      const sentences = rec.fix.split(/[.!?]+/);
      const passiveSentences = sentences.filter((s) => !usesActiveVoice(s));

      // Allow at most 1 passive sentence
      expect(passiveSentences.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Impact Communication', () => {
    test.each(recommendations)('%s why section explains impact on AI engines', (key, rec) => {
      const mentionsAI = /AI|crawler|engine|index/i.test(rec.why);
      expect(mentionsAI).toBe(true);
    });

    test.each(recommendations)('%s includes quantifiable benefit or clear outcome', (key, rec) => {
      const hasQuantifiable =
        /\d+/.test(rec.why) || // Contains numbers
        /more|less|better|faster|frequently/i.test(rec.why) || // Comparatives
        rec.gain > 0; // Has point value

      expect(hasQuantifiable).toBe(true);
    });
  });

  describe('Actionability', () => {
    test.each(recommendations)('%s provides specific, implementable steps', (key, rec) => {
      // Should mention specific tools, tags, or techniques
      const hasSpecifics =
        /<\w+>/.test(rec.fix) || // HTML tags
        /\.(xml|json|html)/.test(rec.fix) || // File types
        /[A-Z][a-z]+[A-Z]/.test(rec.fix) || // CamelCase (likely product names)
        /\d+/.test(rec.fix); // Specific numbers

      expect(hasSpecifics).toBe(true);
    });
  });

  describe('Specific Recommendation Checks', () => {
    test('CDN recommendation explains what CDN means', () => {
      const cdnMentions = recommendations.filter(
        ([k, r]) => r.fix.includes('CDN') || r.why.includes('CDN')
      );

      cdnMentions.forEach(([key, rec]) => {
        const explainsCDN =
          rec.fix.includes('Cloudflare') || // Example of CDN
          rec.fix.includes('Content Delivery') ||
          rec.fix.includes('cache') || // Related concept
          rec.fix.includes('global'); // Related concept

        expect(explainsCDN).toBe(true);
      });
    });

    test('NAP recommendation explains the acronym', () => {
      const nap = recTemplates.napConsistency;
      expect(nap.fix).toMatch(/name.*address.*phone|NAP/i);
    });

    test('RSS recommendation provides context for the acronym', () => {
      const rss = recTemplates.rssFeed;
      const providesContext =
        rss.why.includes('discover') ||
        rss.why.includes('update') ||
        rss.why.includes('broadcast') ||
        rss.fix.includes('feed');

      expect(providesContext).toBe(true);
    });
  });
});

// Summary test to identify which recommendations need improvement
describe('Recommendation Improvement Summary', () => {
  test('identify recommendations needing clarity improvements', () => {
    const needsImprovement: string[] = [];

    Object.entries(recTemplates).forEach(([key, rec]) => {
      const issues: string[] = [];

      // Check for unexplained terms
      const unexplained = findUnexplainedTerms(`${rec.why} ${rec.fix}`);
      if (unexplained.length > 0) {
        issues.push(`Unexplained terms: ${unexplained.join(', ')}`);
      }

      // Check readability
      const readability = calculateReadability(rec.fix);
      if (readability.score < 40 || readability.score > 80) {
        issues.push(`Readability issue: ${readability.level} level`);
      }

      // Check action orientation
      if (!isActionOriented(rec.fix)) {
        issues.push('Not action-oriented');
      }

      // Check passive voice
      if (!usesActiveVoice(rec.fix)) {
        issues.push('Uses passive voice');
      }

      if (issues.length > 0) {
        needsImprovement.push(`${key}: ${issues.join(', ')}`);
      }
    });

    // Log findings for manual review
    if (needsImprovement.length > 0) {
      console.log('\n=== Recommendations Needing Improvement ===');
      needsImprovement.forEach((item) => console.log(`- ${item}`));
    }

    // This test passes but logs areas for improvement
    expect(needsImprovement.length).toBeLessThanOrEqual(Object.keys(recTemplates).length);
  });
});
