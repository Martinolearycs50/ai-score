/**
 * Content Preparation Utilities
 * Converts HTML content to clean Markdown for AI rewriting
 */
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

import type { ExtractedContent } from '../contentExtractor';

export interface PreparedContent {
  markdown: string;
  structure: {
    headings: Array<{ level: number; text: string }>;
    paragraphCount: number;
    listCount: number;
    hasImages: boolean;
    hasLinks: boolean;
    hasCode: boolean;
  };
  metadata: {
    title: string;
    description?: string;
    author?: string;
    publishDate?: string;
    wordCount: number;
  };
}

export class ContentPreparation {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });

    // Configure turndown rules for cleaner output
    this.configureTurndownRules();
  }

  /**
   * Configure Turndown rules for better Markdown conversion
   */
  private configureTurndownRules() {
    // Remove script and style tags
    this.turndownService.remove(['script', 'style', 'noscript']);

    // Simplify navigation elements
    this.turndownService.remove(['nav', 'footer']);

    // Handle images with alt text
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: (content, node: any) => {
        const alt = node.getAttribute('alt') || 'Image';
        const src = node.getAttribute('src') || '';
        return src ? `![${alt}](${src})` : '';
      },
    });

    // Preserve important semantic elements
    this.turndownService.addRule('semantic', {
      filter: ['aside', 'blockquote', 'figure'],
      replacement: (content) => {
        return content ? `\n${content}\n` : '';
      },
    });
  }

  /**
   * Prepare HTML content for AI rewriting
   */
  prepareContent(html: string, extractedContent?: ExtractedContent): PreparedContent {
    const $ = cheerio.load(html);

    // Remove unnecessary elements
    this.cleanHtml($);

    // Extract main content
    const mainContent = this.extractMainContent($);

    // Convert to Markdown
    const markdown = this.turndownService.turndown(mainContent);

    // Clean up the Markdown
    const cleanedMarkdown = this.cleanMarkdown(markdown);

    // Extract structure information
    const structure = this.analyzeStructure($, mainContent);

    // Extract metadata
    const metadata = this.extractMetadata($, extractedContent);

    return {
      markdown: cleanedMarkdown,
      structure,
      metadata,
    };
  }

  /**
   * Clean HTML before conversion
   */
  private cleanHtml($: cheerio.CheerioAPI) {
    // Remove common UI elements
    $('.cookie-notice, .popup, .modal, .banner, .advertisement').remove();
    $('[class*="cookie"], [class*="popup"], [class*="modal"], [id*="cookie"]').remove();

    // Remove social media widgets
    $('.social-share, .share-buttons, [class*="share"], [class*="social"]').remove();

    // Remove navigation elements
    $('nav, .navigation, .nav-menu, .breadcrumb').remove();

    // Remove sidebars (but keep main content)
    $('.sidebar, aside:not(.important), [class*="sidebar"]').remove();

    // Remove comments sections
    $('.comments, #comments, [class*="comment-section"]').remove();

    // Remove related posts (we'll focus on main content)
    $('.related-posts, .related-articles, [class*="related"]').remove();
  }

  /**
   * Extract the main content area
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try common main content selectors
    const selectors = [
      'main article',
      'article.main-content',
      '.post-content',
      '.entry-content',
      '.content-body',
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '#content',
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().trim().length > 100) {
        return element.html() || '';
      }
    }

    // Fallback: use body but remove header/footer
    $('header, footer').remove();
    return $('body').html() || '';
  }

  /**
   * Clean up Markdown formatting
   */
  private cleanMarkdown(markdown: string): string {
    let cleaned = markdown;

    // Remove excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Fix heading spacing
    cleaned = cleaned.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    // Remove trailing spaces
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');

    // Ensure proper list formatting
    cleaned = cleaned.replace(/^(\s*)([\*\-\+])\s+/gm, '$1$2 ');

    // Remove empty links
    cleaned = cleaned.replace(/\[([^\]]*)\]\(\s*\)/g, '$1');

    // Clean up image descriptions
    cleaned = cleaned.replace(/!\[\s*\]\(/g, '![Image](');

    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Trim and ensure single newline at end
    cleaned = cleaned.trim() + '\n';

    return cleaned;
  }

  /**
   * Analyze content structure
   */
  private analyzeStructure($: cheerio.CheerioAPI, html: string): PreparedContent['structure'] {
    const $content = cheerio.load(html);

    return {
      headings: this.extractHeadings($content),
      paragraphCount: $content('p').length,
      listCount: $content('ul, ol').length,
      hasImages: $content('img').length > 0,
      hasLinks: $content('a[href]').length > 0,
      hasCode: $content('code, pre').length > 0,
    };
  }

  /**
   * Extract heading structure
   */
  private extractHeadings($: cheerio.CheerioAPI): Array<{ level: number; text: string }> {
    const headings: Array<{ level: number; text: string }> = [];

    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const $el = $(element);
      const level = parseInt(element.tagName.charAt(1));
      const text = $el.text().trim();

      if (text) {
        headings.push({ level, text });
      }
    });

    return headings;
  }

  /**
   * Extract metadata from the page
   */
  private extractMetadata(
    $: cheerio.CheerioAPI,
    extractedContent?: ExtractedContent
  ): PreparedContent['metadata'] {
    const title =
      extractedContent?.contentSamples.title ||
      $('title').text() ||
      $('h1').first().text() ||
      'Untitled';

    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content');

    const author =
      $('meta[name="author"]').attr('content') ||
      $('.author, .by-line, .byline').first().text().trim();

    const publishDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').first().attr('datetime');

    const wordCount =
      extractedContent?.wordCount ||
      $.text()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

    return {
      title,
      description,
      author: author || undefined,
      publishDate: publishDate || undefined,
      wordCount,
    };
  }

  /**
   * Convert content to a format suitable for the AI prompt
   */
  formatForPrompt(preparedContent: PreparedContent): string {
    const { markdown, metadata } = preparedContent;

    let formatted = '';

    // Add title if not already in content
    if (metadata.title && !markdown.startsWith(`# ${metadata.title}`)) {
      formatted += `# ${metadata.title}\n\n`;
    }

    // Add metadata as context (but not part of content to rewrite)
    if (metadata.author || metadata.publishDate) {
      formatted += `*Author: ${metadata.author || 'Unknown'} | `;
      if (metadata.publishDate) {
        formatted += `Published: ${new Date(metadata.publishDate).toLocaleDateString()}*\n\n`;
      } else {
        formatted += `Date: Not specified*\n\n`;
      }
    }

    // Add the main content
    formatted += markdown;

    return formatted;
  }
}

// Export singleton instance
export const contentPreparation = new ContentPreparation();
