import { z } from 'zod';
import type { UrlValidationResult } from '@/lib/types';

// Zod schema for URL validation
export const urlSchema = z.string()
  .min(1, 'URL is required')
  .refine((url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }, 'Please enter a valid URL');

// Enhanced URL validation with normalization
export function validateAndNormalizeUrl(input: string): UrlValidationResult {
  // Debug logging for both client and server
  const isServer = typeof window === 'undefined';
  const logPrefix = isServer ? '[Server Validator]' : '[Client Validator]';
  
  console.log(`${logPrefix} Input:`, input);
  console.log(`${logPrefix} Input type:`, typeof input);
  console.log(`${logPrefix} Input length:`, input?.length);
  
  if (!input || input.trim() === '') {
    console.log(`${logPrefix} Failed: empty input`);
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  const trimmed = input.trim();
  
  // Check for obvious invalid patterns
  if (trimmed.includes(' ')) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces'
    };
  }

  // Remove any trailing slashes for consistency
  let cleanedUrl = trimmed.replace(/\/+$/, '');
  
  // Handle common URL patterns
  if (cleanedUrl.includes('://')) {
    // URL already has protocol
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are supported'
      };
    }
  } else {
    // No protocol, add https://
    cleanedUrl = `https://${cleanedUrl}`;
  }

  try {
    // Validate with URL constructor
    console.log(`${logPrefix} Attempting to create URL from:`, cleanedUrl);
    const urlObj = new URL(cleanedUrl);
    console.log(`${logPrefix} URL object created successfully`);
    
    // Additional validation checks
    const hostname = urlObj.hostname.toLowerCase();
    console.log(`${logPrefix} Hostname:`, hostname);
    
    // Check for localhost/internal IPs first (for security)
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.startsWith('[') || // IPv6 localhost
        hostname === '0.0.0.0') {
      console.log(`${logPrefix} Failed: localhost/internal IP`);
      return {
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      };
    }
    
    // Check for valid hostname format
    if (!hostname || hostname.length < 3) {
      console.log(`${logPrefix} Failed: hostname too short or empty:`, hostname);
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }
    
    // Special case: hostname starting with a dot is invalid
    if (hostname.startsWith('.')) {
      console.log(`${logPrefix} Failed: hostname starts with dot:`, hostname);
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }
    
    // Validate domain format (must contain at least one dot for TLD)
    // Exception: localhost was already handled above
    if (!hostname.includes('.') || hostname.endsWith('.')) {
      console.log(`${logPrefix} Failed: invalid domain format (no TLD or ends with dot):`, hostname);
      return {
        isValid: false,
        error: 'Invalid domain format. Please include a valid domain extension (e.g., .com, .org)'
      };
    }
    
    // Check for invalid characters in hostname
    if (!/^[a-z0-9.-]+$/i.test(hostname)) {
      console.log(`${logPrefix} Failed: domain contains invalid characters:`, hostname);
      return {
        isValid: false,
        error: 'Domain contains invalid characters'
      };
    }
    
    // Ensure the URL can be stringified properly
    const normalizedUrl = urlObj.toString();
    console.log(`${logPrefix} Validation successful, normalized URL:`, normalizedUrl);

    return {
      isValid: true,
      normalizedUrl: normalizedUrl
    };
  } catch (error) {
    console.error(`${logPrefix} URL validation error:`, error);
    console.error(`${logPrefix} Error message:`, error instanceof Error ? error.message : 'Unknown error');
    console.error(`${logPrefix} Failed URL was:`, cleanedUrl);
    
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., example.com or https://example.com)'
    };
  }
}

// Validate robots.txt content for AI crawler permissions
export function parseRobotsTxt(robotsTxtContent: string): {
  chatgpt: boolean;
  claude: boolean;
  perplexity: boolean;
  gemini: boolean;
} {
  const lines = robotsTxtContent.toLowerCase().split('\n');
  
  // Default to allowed if no specific rules found
  const result = {
    chatgpt: true,
    claude: true,
    perplexity: true,
    gemini: true
  };

  let currentUserAgent = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('user-agent:')) {
      currentUserAgent = trimmed.replace('user-agent:', '').trim();
    } else if (trimmed.startsWith('disallow:') && currentUserAgent) {
      const disallowPath = trimmed.replace('disallow:', '').trim();
      
      // Check if it's a blanket disallow
      if (disallowPath === '/' || disallowPath === '') {
        // Check which bots are being disallowed
        if (currentUserAgent === '*' || 
            currentUserAgent.includes('gptbot') ||
            currentUserAgent.includes('chatgpt') ||
            currentUserAgent.includes('oai-searchbot')) {
          result.chatgpt = false;
        }
        
        if (currentUserAgent === '*' || 
            currentUserAgent.includes('claudebot') ||
            currentUserAgent.includes('claude-user') ||
            currentUserAgent.includes('claude-searchbot')) {
          result.claude = false;
        }
        
        if (currentUserAgent === '*' || 
            currentUserAgent.includes('perplexitybot')) {
          result.perplexity = false;
        }
        
        if (currentUserAgent === '*' || 
            currentUserAgent.includes('googlebot')) {
          result.gemini = false;
        }
      }
    }
  }
  
  return result;
}

// Check if content appears to be a FAQ section
export function detectFaqContent(text: string): boolean {
  const faqIndicators = [
    /frequently\s+asked\s+questions?/i,
    /f\.?a\.?q\.?s?/i,
    /common\s+questions?/i,
    /questions?\s+and\s+answers?/i,
    /q:\s*.+\s*a:/i,
    /question:\s*.+\s*answer:/i
  ];

  return faqIndicators.some(pattern => pattern.test(text));
}

// Validate schema markup JSON-LD
export function validateSchemaMarkup(schemaContent: string): {
  isValid: boolean;
  types: string[];
  hasFaqSchema: boolean;
  hasArticleSchema: boolean;
  hasOrganizationSchema: boolean;
} {
  try {
    const schema = JSON.parse(schemaContent);
    const types: string[] = [];
    let hasFaqSchema = false;
    let hasArticleSchema = false;
    let hasOrganizationSchema = false;

    // Handle both single objects and arrays
    const schemas = Array.isArray(schema) ? schema : [schema];
    
    for (const item of schemas) {
      if (item['@type']) {
        const type = Array.isArray(item['@type']) ? item['@type'].join(',') : item['@type'];
        types.push(type);
        
        if (type.includes('FAQPage')) hasFaqSchema = true;
        if (type.includes('Article') || type.includes('NewsArticle') || type.includes('BlogPosting')) hasArticleSchema = true;
        if (type.includes('Organization')) hasOrganizationSchema = true;
      }
    }

    return {
      isValid: true,
      types,
      hasFaqSchema,
      hasArticleSchema,
      hasOrganizationSchema
    };
  } catch {
    return {
      isValid: false,
      types: [],
      hasFaqSchema: false,
      hasArticleSchema: false,
      hasOrganizationSchema: false
    };
  }
}

// Calculate reading level (simplified Flesch-Kincaid)
export function calculateReadingLevel(text: string): {
  level: string;
  score: number;
  avgSentenceLength: number;
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;

  // Simplified Flesch Reading Ease Score
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

  let level: string;
  if (score >= 90) level = 'Very Easy';
  else if (score >= 80) level = 'Easy';
  else if (score >= 70) level = 'Fairly Easy';
  else if (score >= 60) level = 'Standard';
  else if (score >= 50) level = 'Fairly Difficult';
  else if (score >= 30) level = 'Difficult';
  else level = 'Very Difficult';

  return {
    level,
    score: Math.max(0, Math.min(100, score)),
    avgSentenceLength
  };
}

// Simple syllable counter
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 0;
  
  // Subtract silent e
  if (word.endsWith('e')) count--;
  
  // Ensure at least 1 syllable
  return Math.max(1, count);
}

// Check if URL is likely to be a sitemap or robots.txt
export function isSystemFile(url: string): boolean {
  const systemFiles = [
    'robots.txt',
    'sitemap.xml',
    'sitemap.txt',
    'humans.txt',
    'security.txt',
    '.well-known'
  ];
  
  return systemFiles.some(file => url.toLowerCase().includes(file));
}