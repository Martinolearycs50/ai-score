/**
 * OpenAI Content Rewriter Service
 * Handles AI-powered content optimization for better AI search visibility
 */
import OpenAI from 'openai';

import type { AnalysisResultNew } from '../analyzer-new';
import type { ExtractedContent } from '../contentExtractor';
import type { DeepAnalysis } from '../proAnalysisStore';

export interface RewriteOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  focusAreas?: string[];
}

export interface RewriteResult {
  success: boolean;
  rewrittenContent?: string;
  improvements?: Array<{
    type: string;
    description: string;
  }>;
  addedDataPoints?: Array<{
    value: string;
    source: string;
  }>;
  tokensUsed?: number;
  estimatedCost?: number;
  error?: string;
}

export class ContentRewriter {
  private client: OpenAI | null = null;
  private initialized = false;
  private totalTokensUsed = 0;
  private totalCost = 0;
  private requestCount = 0;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('[ContentRewriter] OpenAI API key not configured');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
      });
      this.initialized = true;
    } catch (error) {
      console.error('[ContentRewriter] Failed to initialize OpenAI client:', error);
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Rewrite content for better AI search visibility
   */
  async rewriteContent(
    originalContent: string,
    analysis: AnalysisResultNew,
    deepAnalysis: DeepAnalysis,
    options: RewriteOptions = {}
  ): Promise<RewriteResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error:
          'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
      };
    }

    const {
      model = 'gpt-4-turbo-preview',
      maxTokens = 4000,
      temperature = 0.7,
      focusAreas = [],
    } = options;

    try {
      // Prepare the rewrite prompt
      const prompt = this.buildRewritePrompt(originalContent, analysis, deepAnalysis, focusAreas);

      // Count tokens (rough estimate)
      const promptTokens = Math.ceil(prompt.length / 4);
      if (promptTokens > 12000) {
        return {
          success: false,
          error: 'Content too long for rewriting. Please try with shorter content.',
        };
      }

      // Call OpenAI API
      const completion = await this.client!.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content optimizer specializing in making content more discoverable and citable by AI search engines like ChatGPT, Claude, and Perplexity.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const rewrittenContent = completion.choices[0]?.message?.content;

      if (!rewrittenContent) {
        return {
          success: false,
          error: 'No content generated',
        };
      }

      // Parse improvements and data points from the response
      const { improvements, addedDataPoints } = this.parseRewriteResponse(rewrittenContent);

      // Calculate cost
      const tokensUsed = completion.usage?.total_tokens || 0;
      const estimatedCost = this.calculateCost(tokensUsed, model);

      // Track usage
      this.totalTokensUsed += tokensUsed;
      this.totalCost += estimatedCost;
      this.requestCount += 1;

      // Log usage for monitoring
      console.log('[ContentRewriter] Usage:', {
        request: this.requestCount,
        tokensThisRequest: tokensUsed,
        costThisRequest: estimatedCost,
        totalTokens: this.totalTokensUsed,
        totalCost: this.totalCost.toFixed(3),
      });

      return {
        success: true,
        rewrittenContent,
        improvements,
        addedDataPoints,
        tokensUsed,
        estimatedCost,
      };
    } catch (error: any) {
      console.error('[ContentRewriter] Rewrite failed:', error);

      if (error.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your OpenAI configuration.',
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to rewrite content',
      };
    }
  }

  /**
   * Build the rewrite prompt based on analysis results
   */
  private buildRewritePrompt(
    originalContent: string,
    analysis: AnalysisResultNew,
    deepAnalysis: DeepAnalysis,
    focusAreas: string[]
  ): string {
    const pageType = analysis.extractedContent?.pageType || 'general';
    const issues = deepAnalysis.issues || [];
    const contentIssues = issues.filter((i) => i.type === 'content').slice(0, 5);
    const technicalContext = issues.filter((i) => i.type === 'technical').slice(0, 3);

    // Build issue summary
    const issueSummary = contentIssues.map((issue) => `- ${issue.specific}`).join('\n');

    // Build focus areas
    const focusAreasText =
      focusAreas.length > 0 ? `\nSpecial focus areas: ${focusAreas.join(', ')}` : '';

    return `Rewrite this ${pageType} content to rank better in AI search results. The content currently scores ${analysis.aiSearchScore}/100.

CURRENT ISSUES TO ADDRESS:
${issueSummary || '- Low fact density\n- Missing data points\n- Poor structure'}

REQUIREMENTS:
1. Add at least 3 specific data points, statistics, or citations (with sources)
2. Improve heading structure for better scannability
3. Include current date references (today is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})
4. Optimize for "${pageType}" content type
5. Maintain factual accuracy and original message
6. Keep similar length to original (±20%)
7. Use clear, authoritative language
8. Add specific examples where relevant${focusAreasText}

FORMAT YOUR RESPONSE AS:
[IMPROVEMENTS]
• List each improvement made
• Be specific about what was added/changed

[ADDED DATA POINTS]
• Data point 1: [value] (Source: [source])
• Data point 2: [value] (Source: [source])
• Data point 3: [value] (Source: [source])

[REWRITTEN CONTENT]
${originalContent}

Remember: The goal is to make this content more likely to be cited by AI assistants when users ask questions related to this topic.`;
  }

  /**
   * Parse the rewrite response to extract improvements and data points
   */
  private parseRewriteResponse(response: string): {
    improvements: Array<{ type: string; description: string }>;
    addedDataPoints: Array<{ value: string; source: string }>;
  } {
    const improvements: Array<{ type: string; description: string }> = [];
    const addedDataPoints: Array<{ value: string; source: string }> = [];

    // Extract improvements section
    const improvementsMatch = response.match(/\[IMPROVEMENTS\]([\s\S]*?)\[ADDED DATA POINTS\]/);
    if (improvementsMatch) {
      const improvementLines = improvementsMatch[1].trim().split('\n');
      improvementLines.forEach((line) => {
        const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleaned) {
          // Categorize improvements
          let type = 'general';
          if (cleaned.toLowerCase().includes('heading')) type = 'structure';
          else if (
            cleaned.toLowerCase().includes('data') ||
            cleaned.toLowerCase().includes('statistic')
          )
            type = 'data';
          else if (
            cleaned.toLowerCase().includes('keyword') ||
            cleaned.toLowerCase().includes('seo')
          )
            type = 'optimization';

          improvements.push({ type, description: cleaned });
        }
      });
    }

    // Extract data points section
    const dataPointsMatch = response.match(/\[ADDED DATA POINTS\]([\s\S]*?)\[REWRITTEN CONTENT\]/);
    if (dataPointsMatch) {
      const dataLines = dataPointsMatch[1].trim().split('\n');
      dataLines.forEach((line) => {
        const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
        const dataMatch = cleaned.match(/(.+?)\s*\(Source:\s*(.+?)\)/);
        if (dataMatch) {
          addedDataPoints.push({
            value: dataMatch[1].trim(),
            source: dataMatch[2].trim(),
          });
        }
      });
    }

    return { improvements, addedDataPoints };
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      totalTokensUsed: this.totalTokensUsed,
      totalCost: this.totalCost.toFixed(3),
      averageTokensPerRequest: this.requestCount > 0 ? Math.round(this.totalTokensUsed / this.requestCount) : 0,
      averageCostPerRequest: this.requestCount > 0 ? (this.totalCost / this.requestCount).toFixed(3) : '0',
    };
  }

  /**
   * Calculate estimated cost based on token usage
   */
  private calculateCost(tokens: number, model: string): number {
    // Pricing as of 2024 (in USD per 1K tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    // Rough estimate: 70% input, 30% output
    const inputTokens = Math.ceil(tokens * 0.7);
    const outputTokens = tokens - inputTokens;

    const cost =
      (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;

    return Math.round(cost * 1000) / 1000; // Round to 3 decimal places
  }
}

// Export singleton instance
export const contentRewriter = new ContentRewriter();
