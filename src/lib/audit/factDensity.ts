import * as cheerio from 'cheerio';

interface FactDensityScores {
  uniqueStats: number;      // ≥ 5 unique stats/dates/names per 500 words (+5) - REDUCED
  dataMarkup: number;       // Table/list markup for data (+5)
  citations: number;        // ≥ 2 outbound citations to primary sources (+5)
  deduplication: number;    // Internal deduplication (< 10% repeated paragraphs) (+5)
  directAnswers: number;    // Direct answers after headings (+5) - NEW for 2025
}

// Store captured content for dynamic recommendations
export interface CapturedHeadings {
  heading: string;
  content: string;
  hasDirectAnswer: boolean;
}

export let capturedHeadings: CapturedHeadings[] = [];

/**
 * Audit module for the Fact Density pillar (20 points max) - UPDATED for 2025
 * Checks: Unique facts, data markup, citations, content deduplication, direct answers
 */
export async function run(html: string): Promise<FactDensityScores> {
  // Reset captured content for this analysis
  capturedHeadings = [];
  
  const scores: FactDensityScores = {
    uniqueStats: 0,
    dataMarkup: 0,
    citations: 0,
    deduplication: 0,
    directAnswers: 0,
  };

  const $ = cheerio.load(html);

  // Get main content text
  const contentText = $('main, article, [role="main"], .content, #content').text() || $('body').text();
  const words = contentText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Check for unique stats, dates, and names
  const stats = extractUniqueStats(contentText);
  const dates = extractDates(contentText);
  const names = extractProperNames(contentText);
  
  const totalFacts = stats.size + dates.size + names.size;
  const factsPerWords = (totalFacts / wordCount) * 500;
  
  scores.uniqueStats = factsPerWords >= 5 ? 5 : Math.floor((factsPerWords / 5) * 5); // Reduced from 10 to 5

  // Check for table/list markup for data
  const tables = $('table').length;
  const lists = $('ul, ol').length;
  const dataLists = $('dl').length; // Definition lists often contain data
  
  scores.dataMarkup = (tables > 0 || lists > 2 || dataLists > 0) ? 5 : 0;

  // Check for outbound citations to primary sources
  const outboundLinks = $('a[href^="http"]');
  const citations = outboundLinks.filter((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    const context = $(el).parent().text().toLowerCase();
    
    // Check if link appears to be a citation
    return (
      href.includes('.gov') ||
      href.includes('.edu') ||
      href.includes('.org') ||
      href.includes('doi.org') ||
      href.includes('pubmed') ||
      href.includes('arxiv') ||
      href.includes('scholar') ||
      context.includes('source') ||
      context.includes('study') ||
      context.includes('research') ||
      context.includes('report') ||
      text.includes('[') // Often citations are numbered
    );
  });
  
  scores.citations = citations.length >= 2 ? 5 : Math.floor((citations.length / 2) * 5);

  // Check for internal deduplication
  const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
    .filter(text => text.length > 50); // Only consider substantial paragraphs
  
  if (paragraphs.length > 0) {
    const duplicates = findDuplicatedContent(paragraphs);
    const duplicationRatio = duplicates / paragraphs.length;
    
    scores.deduplication = duplicationRatio < 0.1 ? 5 : 0;
  } else {
    scores.deduplication = 5; // No paragraphs means no duplication
  }

  // NEW for 2025: Check for direct answers after headings (5 points)
  const headings = $('h2, h3');
  let headingsWithDirectAnswers = 0;
  let totalHeadingsChecked = 0;
  
  headings.each((_, heading) => {
    const $heading = $(heading);
    const headingText = $heading.text().trim();
    
    // Skip empty headings
    if (!headingText) return;
    
    // Get the next elements after the heading
    let nextElement = $heading.next();
    let contentAfterHeading = '';
    let elementsChecked = 0;
    
    // Collect text from next few elements (up to 150 words)
    while (nextElement.length && elementsChecked < 5) {
      const tagName = nextElement.prop('tagName')?.toLowerCase();
      
      // Stop if we hit another heading
      if (tagName && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        break;
      }
      
      // Collect text from paragraphs, lists, etc.
      if (tagName && ['p', 'ul', 'ol', 'div'].includes(tagName)) {
        contentAfterHeading += ' ' + nextElement.text();
      }
      
      nextElement = nextElement.next();
      elementsChecked++;
    }
    
    // Get first 100 words
    const words = contentAfterHeading.trim().split(/\s+/).slice(0, 100);
    const firstHundredWords = words.join(' ');
    
    // Check for direct answer patterns
    const hasDirectAnswer = checkForDirectAnswer(headingText, firstHundredWords);
    
    // Capture for recommendations (limit to 5 headings without direct answers)
    if (!hasDirectAnswer && capturedHeadings.length < 5) {
      capturedHeadings.push({
        heading: headingText,
        content: firstHundredWords,
        hasDirectAnswer: false
      });
    }
    
    if (hasDirectAnswer) {
      headingsWithDirectAnswers++;
    }
    totalHeadingsChecked++;
  });
  
  // Calculate score based on percentage of headings with direct answers
  if (totalHeadingsChecked > 0) {
    const percentage = (headingsWithDirectAnswers / totalHeadingsChecked) * 100;
    
    if (percentage >= 80) {
      scores.directAnswers = 5;
    } else if (percentage >= 60) {
      scores.directAnswers = 4;
    } else if (percentage >= 40) {
      scores.directAnswers = 2;
    } else {
      scores.directAnswers = 0;
    }
  } else {
    scores.directAnswers = 0;
  }

  return scores;
}

function checkForDirectAnswer(heading: string, content: string): boolean {
  const headingLower = heading.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Check for question patterns and their answers
  if (headingLower.includes('what is') || headingLower.includes('what are')) {
    // Look for definition patterns
    return /\b(is|are|means|refers to|defined as)\b/.test(contentLower.slice(0, 50));
  }
  
  if (headingLower.includes('how to') || headingLower.includes('how do')) {
    // Look for instructional patterns
    return /\b(first|start|begin|step|to\s+\w+,|by\s+\w+ing)\b/.test(contentLower.slice(0, 50));
  }
  
  if (headingLower.includes('why')) {
    // Look for reasoning patterns
    return /\b(because|due to|since|as a result|this is)\b/.test(contentLower.slice(0, 50));
  }
  
  if (headingLower.includes('when')) {
    // Look for temporal patterns
    return /\b(in\s+\d{4}|on\s+\w+|during|after|before|at\s+\d+)\b/.test(contentLower.slice(0, 50));
  }
  
  // Check for general direct statement patterns
  const firstSentence = content.split(/[.!?]/).find(s => s.trim().length > 10)?.trim() || '';
  
  // A good direct answer usually:
  // 1. Starts with the subject of the heading
  // 2. Contains a verb within the first few words
  // 3. Is a complete statement
  const headingKeywords = headingLower.split(/\s+/).filter(w => w.length > 3);
  const hasSubjectMatch = headingKeywords.some(kw => firstSentence.toLowerCase().includes(kw));
  const hasEarlyVerb = /^(\w+\s+){0,3}(is|are|was|were|has|have|can|will|does|provides|offers|includes|helps|makes|allows|enables)\b/i.test(firstSentence);
  
  return hasSubjectMatch && hasEarlyVerb;
}

function extractUniqueStats(text: string): Set<string> {
  const stats = new Set<string>();
  
  // Extract percentages
  const percentages = text.match(/\d+(\.\d+)?%/g) || [];
  percentages.forEach(p => stats.add(p));
  
  // Extract numbers with context (e.g., "5 million", "$100", "3.5x")
  const numbers = text.match(/[$€£¥]\d+[kKmMbB]?|\d+[,.]?\d*\s*(million|billion|thousand|hundred|x|X)/g) || [];
  numbers.forEach(n => stats.add(n.trim()));
  
  // Extract specific measurements
  const measurements = text.match(/\d+\s*(mph|km\/h|kg|lbs|meters|feet|miles|kilometers|GB|MB|TB|ms|seconds?|minutes?|hours?|requests?\s*(?:per|\/)\s*(?:second|minute|hour)|req\/s|rps|qps)/gi) || [];
  measurements.forEach(m => stats.add(m.trim()));
  
  return stats;
}

function extractDates(text: string): Set<string> {
  const dates = new Set<string>();
  
  // Extract years
  const years = text.match(/\b(19|20)\d{2}\b/g) || [];
  years.forEach(y => dates.add(y));
  
  // Extract month-year patterns
  const monthYear = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(19|20)\d{2}\b/gi) || [];
  monthYear.forEach(my => dates.add(my));
  
  // Extract date patterns
  const datePatterns = text.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g) || [];
  datePatterns.forEach(d => dates.add(d));
  
  return dates;
}

function extractProperNames(text: string): Set<string> {
  const names = new Set<string>();
  
  // Extract capitalized words that might be names (simple heuristic)
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const current = words[i];
    const next = words[i + 1];
    
    // Check for "FirstName LastName" pattern
    if (
      current.length > 1 &&
      next &&
      next.length > 1 &&
      /^[A-Z][a-z]+$/.test(current) &&
      /^[A-Z][a-z]+$/.test(next) &&
      !isCommonWord(current) &&
      !isCommonWord(next)
    ) {
      names.add(`${current} ${next}`);
    }
    
    // Check for company names (e.g., "Microsoft", "OpenAI")
    if (
      current.length > 4 &&
      /^[A-Z]/.test(current) &&
      (current.includes('Corp') || current.includes('Inc') || current.includes('LLC') || 
       current.includes('Ltd') || /^[A-Z]+$/.test(current))
    ) {
      names.add(current);
    }
  }
  
  return names;
}

function isCommonWord(word: string): boolean {
  const common = ['The', 'This', 'That', 'These', 'Those', 'What', 'When', 'Where', 'Why', 'How', 'Who'];
  return common.includes(word);
}

function findDuplicatedContent(paragraphs: string[]): number {
  let duplicates = 0;
  const seen = new Set<string>();
  
  for (const paragraph of paragraphs) {
    // Normalize for comparison
    const normalized = paragraph.toLowerCase().replace(/\s+/g, ' ').trim();
    
    if (seen.has(normalized)) {
      duplicates++;
    } else {
      seen.add(normalized);
      
      // Also check for near-duplicates (80% similarity)
      for (const existing of seen) {
        if (similarity(normalized, existing) > 0.8) {
          duplicates++;
          break;
        }
      }
    }
  }
  
  return duplicates;
}

function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}