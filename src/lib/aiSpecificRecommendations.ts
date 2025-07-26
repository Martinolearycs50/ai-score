/**
 * AI-Specific Recommendation Engine
 * Generates context-aware recommendations based on content analysis
 */
import type { ExtractedContent } from './contentExtractor';
import type { RecommendationTemplate } from './types';

export interface AIOptimizationIssue {
  issue: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'content' | 'structure' | 'trust' | 'technical';
  specificFix: string;
  impact: string;
  example?: {
    before: string;
    after: string;
  };
}

/**
 * Analyzes content and generates AI-specific optimization recommendations
 */
export function analyzeForAIOptimization(
  content: ExtractedContent,
  scores: Record<string, Record<string, number>>
): AIOptimizationIssue[] {
  const issues: AIOptimizationIssue[] = [];

  // Analyze content depth and completeness
  const contentIssues = analyzeContentQuality(content);
  issues.push(...contentIssues);

  // Check for AI-friendly structure
  const structureIssues = analyzeStructureForAI(content);
  issues.push(...structureIssues);

  // Analyze trustworthiness signals
  const trustIssues = analyzeTrustSignals(content);
  issues.push(...trustIssues);

  // Check semantic completeness
  const semanticIssues = analyzeSemanticCompleteness(content);
  issues.push(...semanticIssues);

  // Sort by severity
  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, major: 1, minor: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function analyzeContentQuality(content: ExtractedContent): AIOptimizationIssue[] {
  const issues: AIOptimizationIssue[] = [];
  const text = content.contentSamples?.paragraphs?.join(' ') || '';
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  // Check content depth
  if (wordCount < 500) {
    issues.push({
      issue: 'Insufficient content depth',
      severity: 'critical',
      category: 'content',
      specificFix: `Your content has only ${wordCount} words. AI engines prefer comprehensive content. Expand to at least 800-1200 words by adding: 1) Background context about ${detectTopic(content)}, 2) Detailed explanations of key concepts, 3) Real-world examples and use cases, 4) Common questions and answers.`,
      impact: 'AI engines may skip thin content in favor of more comprehensive sources',
      example: {
        before: 'Short 200-word overview',
        after:
          'Comprehensive 1200-word guide with sections on: Introduction, How it Works, Benefits, Implementation, Best Practices, FAQs',
      },
    });
  }

  // Check for question-answer pairs
  const questions = (text.match(/\?/g) || []).length;
  const hasQAPairs =
    text.includes('?') &&
    (text.includes('Answer:') || text.includes('A:') || /\?\s*[A-Z]/.test(text));

  if (questions < 3 || !hasQAPairs) {
    issues.push({
      issue: 'Missing question-answer format',
      severity: 'major',
      category: 'content',
      specificFix: `Add a FAQ section with at least 5-7 questions about ${detectTopic(content)}. Format each as: "Q: [Question]?" followed by "A: [Direct answer]". Focus on questions users actually ask AI about this topic.`,
      impact: 'AI engines love Q&A format for extracting direct answers',
      example: {
        before: 'General explanatory text without questions',
        after:
          'Q: What is X?\nA: X is [definition]...\n\nQ: How does X work?\nA: X works by [explanation]...',
      },
    });
  }

  // Check for data points and statistics
  const stats = extractStatistics(text);
  if (stats.length < 3) {
    const topic = detectTopic(content);
    issues.push({
      issue: 'Lack of specific data points',
      severity: 'major',
      category: 'content',
      specificFix: `Add at least 5 specific statistics about ${topic}. Look for: market size, growth rates, user statistics, performance metrics, cost comparisons, or time savings. Use recent data (2023-2024) from Statista, industry reports, or official sources.`,
      impact: 'AI prioritizes fact-rich content as authoritative sources',
    });
  }

  return issues;
}

function analyzeStructureForAI(content: ExtractedContent): AIOptimizationIssue[] {
  const issues: AIOptimizationIssue[] = [];

  // Check for clear information hierarchy
  if (!content.contentSamples?.headings || content.contentSamples.headings.length < 3) {
    issues.push({
      issue: 'Poor information hierarchy',
      severity: 'major',
      category: 'structure',
      specificFix:
        'Restructure content with clear H2 and H3 headings. Each major section should answer a specific question. Use headings like "What is [Topic]?", "How Does [Topic] Work?", "Benefits of [Topic]", "Common Use Cases".',
      impact:
        'AI engines use headings to understand content structure and extract relevant sections',
    });
  }

  // Check for summary sections
  const allText = content.contentSamples?.paragraphs?.join(' ').toLowerCase() || '';
  const hasSummary =
    allText.includes('summary') ||
    allText.includes('overview') ||
    allText.includes('key takeaways');

  if (!hasSummary) {
    issues.push({
      issue: 'Missing summary or key takeaways',
      severity: 'major',
      category: 'structure',
      specificFix:
        'Add a "Key Takeaways" section at the beginning or end with 3-5 bullet points summarizing the main points. AI engines often extract these summaries for quick answers.',
      impact: 'Summaries help AI quickly understand and cite your main points',
    });
  }

  return issues;
}

function analyzeTrustSignals(content: ExtractedContent): AIOptimizationIssue[] {
  const issues: AIOptimizationIssue[] = [];

  // Check for author information
  const textContent = content.contentSamples?.paragraphs?.join(' ') || '';
  if (
    !textContent.toLowerCase().includes('author') &&
    !textContent.toLowerCase().includes('written by')
  ) {
    issues.push({
      issue: 'Missing author credentials',
      severity: 'major',
      category: 'trust',
      specificFix:
        'Add author information with credentials. Include: name, expertise, relevant experience, and a brief bio. Use schema markup: {"@type": "Person", "name": "...", "jobTitle": "...", "description": "..."}',
      impact: 'AI engines trust content more when author expertise is clear',
      example: {
        before: 'No author information',
        after:
          'Written by Dr. Jane Smith, PhD in Computer Science with 10 years experience in AI research',
      },
    });
  }

  // Check for citations
  // TODO: Extract links from content if needed
  const links: string[] = [];
  const authorityLinks = links.filter(
    (link) =>
      link.includes('.edu') ||
      link.includes('.gov') ||
      link.includes('doi.org') ||
      link.includes('pubmed') ||
      link.includes('scholar')
  );

  if (authorityLinks.length < 2) {
    issues.push({
      issue: 'Insufficient authoritative citations',
      severity: 'major',
      category: 'trust',
      specificFix: `Add citations to authoritative sources. Link to: academic papers (Google Scholar), government data (.gov sites), educational institutions (.edu), or peer-reviewed journals. Current authority links: ${authorityLinks.length}`,
      impact: 'AI engines verify claims against authoritative sources',
    });
  }

  return issues;
}

function analyzeSemanticCompleteness(content: ExtractedContent): AIOptimizationIssue[] {
  const issues: AIOptimizationIssue[] = [];
  const topic = detectTopic(content);

  // Check if content answers the "5 W's and H"
  const text = content.contentSamples?.paragraphs?.join(' ').toLowerCase() || '';
  const hasWhat = text.includes('what') || text.includes('definition');
  const hasWhy = text.includes('why') || text.includes('reason') || text.includes('because');
  const hasHow = text.includes('how') || text.includes('steps') || text.includes('process');
  const hasWhen = text.includes('when') || text.includes('time') || /\d{4}/.test(text);
  const hasWho = text.includes('who') || text.includes('author') || text.includes('created');

  const coverage = [hasWhat, hasWhy, hasHow, hasWhen, hasWho].filter(Boolean).length;

  if (coverage < 4) {
    const missing = [];
    if (!hasWhat) missing.push('What (definition/explanation)');
    if (!hasWhy) missing.push('Why (importance/benefits)');
    if (!hasHow) missing.push('How (process/implementation)');
    if (!hasWhen) missing.push('When (timeline/history)');
    if (!hasWho) missing.push('Who (creators/users)');

    issues.push({
      issue: 'Incomplete topic coverage',
      severity: 'major',
      category: 'content',
      specificFix: `Your content about ${topic} is missing key aspects: ${missing.join(', ')}. Add sections addressing each missing element to provide comprehensive coverage that AI engines expect.`,
      impact: 'AI engines prefer comprehensive content that answers all aspects of a topic',
    });
  }

  return issues;
}

function detectTopic(content: ExtractedContent): string {
  // Simple topic detection based on title and content
  const title = content.contentSamples?.title || '';
  const text = content.contentSamples?.paragraphs?.join(' ') || '';

  // Extract main topic from title
  const titleWords = title
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .filter((w) => !['about', 'guide', 'tutorial', 'overview'].includes(w.toLowerCase()));

  if (titleWords.length > 0) {
    return titleWords.slice(0, 2).join(' ');
  }

  // Fallback to most common noun phrases in content
  return 'this topic';
}

function extractStatistics(text: string): string[] {
  const stats: string[] = [];

  // Percentages
  const percentages = text.match(/\d+(\.\d+)?%/g) || [];
  stats.push(...percentages);

  // Numbers with units
  const numbers =
    text.match(/\d+[,.]?\d*\s*(million|billion|thousand|users|customers|downloads|views)/gi) || [];
  stats.push(...numbers);

  // Currency amounts
  const currency = text.match(/[$€£¥]\d+[,.]?\d*[kKmMbB]?/g) || [];
  stats.push(...currency);

  return stats;
}

/**
 * Converts AI issues to recommendation format
 */
export function convertToRecommendations(issues: AIOptimizationIssue[]): RecommendationTemplate[] {
  return issues.map((issue) => ({
    why: issue.impact,
    fix: issue.specificFix,
    gain: issue.severity === 'critical' ? 15 : issue.severity === 'major' ? 10 : 5,
    example: issue.example,
  }));
}
