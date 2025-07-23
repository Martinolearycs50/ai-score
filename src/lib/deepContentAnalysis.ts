/**
 * Deep Content Analysis for Pro Tier
 * Provides detailed, line-by-line analysis with specific fixes
 */
import * as cheerio from 'cheerio';

import type { AnalysisResultNew } from './analyzer-new';
import type { DeepAnalysis } from './proAnalysisStore';
import type { PillarScores } from './types';

interface ContentIssue {
  type: 'technical' | 'content';
  location: string;
  specific: string;
  fix: string;
  impact: number;
  pillar: keyof PillarScores;
}

export async function deepContentAnalysis(
  url: string,
  standardAnalysis: AnalysisResultNew
): Promise<DeepAnalysis> {
  // Fetch HTML content for deep analysis
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchScoreBot/1.0)',
      },
    });
    html = await response.text();
  } catch (error) {
    console.error('Failed to fetch HTML for deep analysis:', error);
  }

  const $ = cheerio.load(html);

  // Extract headings with line numbers
  const headings = extractHeadingsWithLineNumbers($, html);

  // Extract data points
  const dataPoints = extractDataPoints($, standardAnalysis);

  // Identify specific issues
  const issues = identifySpecificIssues($, standardAnalysis, html);

  // Categorize tasks
  const { technicalTasks, contentTasks } = categorizeTasks(issues);

  return {
    headings,
    dataPoints,
    issues,
    technicalTasks,
    contentTasks,
  };
}

function extractHeadingsWithLineNumbers(
  $: cheerio.CheerioAPI,
  html: string
): DeepAnalysis['headings'] {
  const headings: DeepAnalysis['headings'] = [];
  const lines = html.split('\n');

  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    const tagName = element.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1));

    // Find line number by searching for the element's HTML
    const elementHtml = $.html(element);
    let lineNumber = 1;
    let currentPosition = 0;

    for (let i = 0; i < lines.length; i++) {
      if (
        html.indexOf(elementHtml, currentPosition) >= currentPosition &&
        html.indexOf(elementHtml, currentPosition) < currentPosition + lines[i].length + 1
      ) {
        lineNumber = i + 1;
        break;
      }
      currentPosition += lines[i].length + 1; // +1 for newline
    }

    headings.push({ level, text, line: lineNumber });
  });

  return headings;
}

function extractDataPoints(
  $: cheerio.CheerioAPI,
  analysis: AnalysisResultNew
): DeepAnalysis['dataPoints'] {
  const dataPoints: DeepAnalysis['dataPoints'] = [];

  // Extract numbers with context
  const text = $.text();
  const numberPattern = /(\d+(?:\.\d+)?%?)\s+(?:of\s+)?([^.!?]+)/g;
  const matches = text.matchAll(numberPattern);

  for (const match of matches) {
    const value = match[1];
    const context = match[2].trim();

    // Skip common non-data numbers (years, addresses, etc.)
    if (context.length > 10 && !context.match(/^\d{4}$/) && !context.includes('street')) {
      dataPoints.push({
        value,
        context: context.substring(0, 100),
      });
    }
  }

  // Add statistics from meta tags or structured data
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      const data = JSON.parse($(script).html() || '{}');
      if (data.aggregateRating) {
        dataPoints.push({
          value: `${data.aggregateRating.ratingValue}/5`,
          context: `Average rating from ${data.aggregateRating.reviewCount} reviews`,
          source: 'Structured Data',
        });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  return dataPoints;
}

function identifySpecificIssues(
  $: cheerio.CheerioAPI,
  analysis: AnalysisResultNew,
  html: string
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const lines = html.split('\n');

  // Check for missing H1
  if ($('h1').length === 0) {
    issues.push({
      type: 'technical',
      location: 'Document head',
      specific: 'No H1 tag found on the page',
      fix: 'Add an H1 tag with your main keyword, e.g., <h1>AI Search Optimization Guide</h1>',
      impact: 8,
      pillar: 'STRUCTURE',
    });
  }

  // Check for missing meta description
  if (!$('meta[name="description"]').attr('content')) {
    issues.push({
      type: 'technical',
      location: '<head> section',
      specific: 'Meta description is missing',
      fix: 'Add <meta name="description" content="Clear 150-160 character description">',
      impact: 6,
      pillar: 'RETRIEVAL',
    });
  }

  // Check heading hierarchy
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  if (h3Count > 0 && h2Count === 0) {
    const firstH3Line = findElementLine($, 'h3', lines);
    issues.push({
      type: 'technical',
      location: `Line ${firstH3Line}`,
      specific: 'H3 headings used without H2 headings',
      fix: 'Add H2 headings before H3s to maintain proper hierarchy',
      impact: 5,
      pillar: 'STRUCTURE',
    });
  }

  // Check for data/statistics
  if (analysis.scoringResult.pillarScores.FACT_DENSITY < 15) {
    issues.push({
      type: 'content',
      location: 'Throughout content',
      specific: 'Low density of facts, statistics, or data points',
      fix: 'Add 3-5 specific statistics, percentages, or data points with sources',
      impact: 10,
      pillar: 'FACT_DENSITY',
    });
  }

  // Check for update date
  const text = $.text();
  const hasUpdateDate =
    $('meta[property="article:modified_time"]').length > 0 ||
    $('time[datetime]').length > 0 ||
    text.includes('Updated') ||
    text.includes('Last modified');

  if (!hasUpdateDate) {
    issues.push({
      type: 'technical',
      location: 'Article metadata',
      specific: 'No last updated date found',
      fix: 'Add <meta property="article:modified_time" content="2024-01-20"> or visible "Last updated" text',
      impact: 4,
      pillar: 'RECENCY',
    });
  }

  // Check for author information
  const hasAuthor =
    $('meta[name="author"]').length > 0 ||
    $('[rel="author"]').length > 0 ||
    $('.author, .by-line, .byline').length > 0;

  if (!hasAuthor) {
    issues.push({
      type: 'technical',
      location: 'Article metadata',
      specific: 'No author information found',
      fix: 'Add <meta name="author" content="Your Name"> and visible author byline',
      impact: 7,
      pillar: 'TRUST',
    });
  }

  // Check content length
  const wordCount = analysis.extractedContent?.wordCount || 0;
  if (wordCount < 600) {
    issues.push({
      type: 'content',
      location: 'Main content',
      specific: `Content is too short (${wordCount} words)`,
      fix: 'Expand content to at least 800 words with detailed explanations',
      impact: 9,
      pillar: 'FACT_DENSITY',
    });
  }

  return issues;
}

function findElementLine($: cheerio.CheerioAPI, selector: string, lines: string[]): number {
  const element = $(selector).first();
  if (element.length === 0) return 1;

  const elementHtml = $.html(element);
  let lineNumber = 1;
  let currentPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(elementHtml.substring(0, 50))) {
      lineNumber = i + 1;
      break;
    }
    currentPosition += lines[i].length + 1;
  }

  return lineNumber;
}

function categorizeTasks(issues: ContentIssue[]): {
  technicalTasks: string[];
  contentTasks: string[];
} {
  const technicalTasks: string[] = [];
  const contentTasks: string[] = [];

  // Sort by impact (highest first)
  const sortedIssues = [...issues].sort((a, b) => b.impact - a.impact);

  for (const issue of sortedIssues) {
    const task = `[Impact: ${issue.impact}/10] ${issue.location}: ${issue.fix}`;

    if (issue.type === 'technical') {
      technicalTasks.push(task);
    } else {
      contentTasks.push(task);
    }
  }

  return { technicalTasks, contentTasks };
}
