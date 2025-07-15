import axios from 'axios';
import * as cheerio from 'cheerio';
import { validateAndNormalizeUrl } from '@/utils/validators';
import { DEFAULT_HEADERS, TIMEOUTS } from '@/utils/constants';
import { score, type ScoringResult } from './scorer-new';
import type { PillarResults } from './types';

// Import audit modules
import * as retrieval from './audit/retrieval';
import * as factDensity from './audit/factDensity';
import * as structure from './audit/structure';
import * as trust from './audit/trust';
import * as recency from './audit/recency';

export interface AnalysisResultNew {
  url: string;
  aiSearchScore: number; // 0-100
  scoringResult: ScoringResult;
  timestamp: string;
  pageTitle?: string;
  pageDescription?: string;
}

export class AiSearchAnalyzer {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: TIMEOUTS.page_fetch,
      headers: DEFAULT_HEADERS,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });
  }

  async analyzeUrl(url: string): Promise<AnalysisResultNew> {
    console.log(`[AiSearchAnalyzer] Starting analysis for: ${url}`);
    
    // Validate and normalize URL
    const validation = validateAndNormalizeUrl(url);
    
    if (!validation.isValid) {
      throw new Error(`Invalid URL: ${validation.error}`);
    }

    const normalizedUrl = validation.normalizedUrl!;
    console.log(`[AiSearchAnalyzer] Using normalized URL: ${normalizedUrl}`);

    try {
      // Fetch page content
      const { data: html, headers } = await this.fetchPageContent(normalizedUrl);
      
      // Load HTML with Cheerio
      const $ = cheerio.load(html);
      
      // Extract basic metadata
      const pageTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const pageDescription = $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '';

      // Run all audit modules
      const pillarResults: PillarResults = {
        RETRIEVAL: await retrieval.run(html, normalizedUrl),
        FACT_DENSITY: await factDensity.run(html),
        STRUCTURE: await structure.run(html),
        TRUST: await trust.run(html),
        RECENCY: await recency.run(html, headers),
      };

      // Calculate scores
      const scoringResult = score(pillarResults);

      return {
        url: normalizedUrl,
        aiSearchScore: scoringResult.total,
        scoringResult,
        timestamp: new Date().toISOString(),
        pageTitle,
        pageDescription,
      };
    } catch (error) {
      console.error('[AiSearchAnalyzer] Analysis failed:', error);
      throw error;
    }
  }

  private async fetchPageContent(url: string): Promise<{
    data: string;
    headers: Record<string, string>;
    status: number;
  }> {
    try {
      const response = await this.axiosInstance.get(url);
      
      // Convert headers to plain object
      const headers: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });

      return {
        data: response.data,
        headers,
        status: response.status,
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        throw new Error(`Server returned ${error.response.status}: ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Domain not found');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }
}