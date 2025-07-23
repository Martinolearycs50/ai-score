import type { ExtractedContent } from './contentExtractor';
import { recTemplates } from './recommendations';
import type { RecommendationTemplate } from './types';

/**
 * Generates content-aware recommendations based on extracted content
 */
export class DynamicRecommendationGenerator {
  private content: ExtractedContent;

  constructor(extractedContent: ExtractedContent) {
    this.content = extractedContent;
  }

  /**
   * Generate a dynamic recommendation based on the metric and extracted content
   */
  generateRecommendation(
    metric: string,
    baseTemplate: RecommendationTemplate
  ): RecommendationTemplate {
    // Create a copy of the template to modify
    const template = { ...baseTemplate };

    // Generate content-aware examples
    if (template.example) {
      template.example = this.generateDynamicExample(metric, template.example);
    }

    // Personalize the "why" message based on content and page type
    template.why = this.personalizeWhy(metric, template.why);

    // Make the fix instructions more specific based on page type
    template.fix = this.personalizeFix(metric, template.fix);

    return template;
  }

  /**
   * Get page-type specific context for recommendations
   */
  private getPageTypeContext(): { prefix: string; suffix: string; emphasis?: string } {
    switch (this.content.pageType) {
      case 'homepage':
        return {
          prefix: 'As your homepage,',
          suffix: "This helps AI understand your entire site's purpose and structure.",
          emphasis: 'first impression',
        };
      case 'article':
        return {
          prefix: 'For blog content,',
          suffix: 'This increases chances of being cited as a source by AI.',
          emphasis: 'citation potential',
        };
      case 'product':
        return {
          prefix: 'On product pages,',
          suffix: 'This helps AI recommend your products in shopping queries.',
          emphasis: 'purchase decisions',
        };
      case 'category':
        return {
          prefix: 'For category pages,',
          suffix: 'This helps AI understand your product organization.',
          emphasis: 'navigation clarity',
        };
      case 'documentation':
        return {
          prefix: 'In documentation,',
          suffix: 'This makes your docs the go-to reference for AI coding assistance.',
          emphasis: 'technical accuracy',
        };
      case 'about':
        return {
          prefix: 'On your about page,',
          suffix: 'This establishes credibility and expertise for AI.',
          emphasis: 'trust signals',
        };
      case 'contact':
        return {
          prefix: 'For contact pages,',
          suffix: 'This ensures AI can accurately direct users to you.',
          emphasis: 'accessibility',
        };
      case 'search':
        return {
          prefix: 'On search results,',
          suffix: 'This helps AI understand your content organization.',
          emphasis: 'content discovery',
        };
      default: // 'general'
        return {
          prefix: '',
          suffix: 'This improves overall AI comprehension of your content.',
          emphasis: 'clarity',
        };
    }
  }

  private generateDynamicExample(
    metric: string,
    defaultExample: { before: string; after: string }
  ): { before: string; after: string } {
    switch (metric) {
      case 'listicleFormat':
        return this.generateListicleExample();
      case 'semanticUrl':
        return this.generateSemanticUrlExample();
      case 'directAnswers':
        return this.generateDirectAnswerExample();
      case 'comparisonTables':
        return this.generateComparisonTableExample();
      case 'uniqueStats':
        return this.generateUniqueStatsExample();
      case 'headingFrequency':
        return this.generateHeadingExample();
      case 'structuredData':
        return this.generateStructuredDataExample();
      case 'authorBio':
        return this.generateAuthorBioExample();
      case 'dataMarkup':
        return this.generateDataMarkupExample();
      case 'llmsTxtFile':
        return this.generateLlmsTxtExample();
      default:
        return defaultExample;
    }
  }

  private generateListicleExample(): { before: string; after: string } {
    const title = this.content.contentSamples.title || 'Your Guide';
    const topic = this.content.primaryTopic || 'content';
    const businessType = this.content.businessType;

    // Generate appropriate listicle title based on business type and topic
    let improvedTitle = title;

    if (businessType === 'payment') {
      const numbers = ['7', '10', '12'];
      const num = numbers[Math.floor(Math.random() * numbers.length)];
      improvedTitle = `${num} Essential ${this.capitalizeWords(topic)} Features Every Business Needs`;
    } else if (businessType === 'ecommerce') {
      improvedTitle = `15 ${this.capitalizeWords(topic)} Tips to Boost Your Sales`;
    } else if (businessType === 'documentation') {
      improvedTitle = `10 ${this.capitalizeWords(topic)} Best Practices for Developers`;
    } else if (businessType === 'blog') {
      improvedTitle = `7 ${this.capitalizeWords(topic)} Strategies That Actually Work`;
    } else {
      // Generic improvement
      const hasNumber = /^\d+/.test(title);
      if (!hasNumber) {
        improvedTitle = `10 Essential ${this.capitalizeWords(topic)} Insights`;
      }
    }

    return {
      before: title,
      after: improvedTitle,
    };
  }

  private generateSemanticUrlExample(): { before: string; after: string } {
    // Try to get current URL structure
    const currentUrl = '/blog/post-123'; // Default fallback

    // Generate semantic URL from title and topic
    const slugBase = this.content.primaryTopic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40);

    const year = new Date().getFullYear();
    let semanticUrl = '';

    switch (this.content.businessType) {
      case 'payment':
        semanticUrl = `/resources/${slugBase}-payment-guide`;
        break;
      case 'ecommerce':
        semanticUrl = `/shop/${slugBase}`;
        break;
      case 'documentation':
        semanticUrl = `/docs/${slugBase}-reference`;
        break;
      case 'blog':
        semanticUrl = `/blog/${slugBase}-${year}`;
        break;
      default:
        semanticUrl = `/${slugBase}`;
    }

    return {
      before: currentUrl,
      after: semanticUrl,
    };
  }

  private generateDirectAnswerExample(): { before: string; after: string } {
    // Find a question heading or create one
    const questionHeading = this.content.contentSamples.headings.find((h) => h.text.includes('?'));

    if (questionHeading && questionHeading.content) {
      const improvedAnswer = this.createDirectAnswer(questionHeading.text, questionHeading.content);
      return {
        before: `<h2>${questionHeading.text}</h2>\n<p>${questionHeading.content.substring(0, 100)}...</p>`,
        after: `<h2>${questionHeading.text}</h2>\n<p>${improvedAnswer}</p>`,
      };
    }

    // Create example from topic
    const exampleQuestion = `What is ${this.content.primaryTopic}?`;
    const genericContent =
      this.content.contentSamples.paragraphs[0] || 'Content about the topic...';

    return {
      before: `<h2>${exampleQuestion}</h2>\n<p>${genericContent.substring(0, 100)}...</p>`,
      after: `<h2>${exampleQuestion}</h2>\n<p>${this.capitalizeWords(this.content.primaryTopic)} is ${genericContent.substring(0, 80)}...</p>`,
    };
  }

  private generateComparisonTableExample(): { before: string; after: string } {
    // Look for comparison content
    const comparison = this.content.contentSamples.comparisons[0];

    if (comparison) {
      // Extract items being compared
      const match = comparison.match(/(\w+)\s+(?:vs|versus)\s+(\w+)/i);
      const item1 = match ? match[1] : 'Option A';
      const item2 = match ? match[2] : 'Option B';

      return {
        before: `<h2>${comparison}</h2>\n<p>${item1} offers better performance while ${item2} has more features...</p>`,
        after: `<h2>${comparison}</h2>\n<table>\n  <tr><th>Feature</th><th>${item1}</th><th>${item2}</th></tr>\n  <tr><td>Performance</td><td>Excellent</td><td>Good</td></tr>\n  <tr><td>Features</td><td>Standard</td><td>Advanced</td></tr>\n</table>`,
      };
    }

    // Generate based on business type
    if (this.content.businessType === 'payment') {
      return {
        before:
          '<h2>Payment Methods</h2>\n<p>We support credit cards, debit cards, and digital wallets...</p>',
        after:
          '<h2>Payment Methods Comparison</h2>\n<table>\n  <tr><th>Method</th><th>Processing Time</th><th>Fees</th></tr>\n  <tr><td>Credit Card</td><td>Instant</td><td>2.9%</td></tr>\n  <tr><td>Bank Transfer</td><td>1-3 days</td><td>$0.50</td></tr>\n</table>',
      };
    }

    return {
      before: `<h2>${this.content.primaryTopic} Options</h2>\n<p>There are several options available...</p>`,
      after: `<h2>${this.content.primaryTopic} Options Comparison</h2>\n<table>\n  <tr><th>Option</th><th>Benefits</th><th>Best For</th></tr>\n  <tr><td>Basic</td><td>Easy to start</td><td>Beginners</td></tr>\n  <tr><td>Pro</td><td>Advanced features</td><td>Professionals</td></tr>\n</table>`,
    };
  }

  private generateUniqueStatsExample(): { before: string; after: string } {
    const stats = this.content.contentSamples.statistics;

    if (stats.length > 0) {
      // Use actual statistics from the page
      const vagueVersion = stats[0].replace(/\d+(?:\.\d+)?/, 'many').replace(/\$/, '');
      return {
        before: `Our solution helps ${vagueVersion} users`,
        after: `Our solution helps ${stats[0]} users (${new Date().getFullYear()} data)`,
      };
    }

    // Generate based on business type
    const examples: Record<string, { before: string; after: string }> = {
      payment: {
        before: 'Fast payment processing',
        after: 'Payment processing in under 2.3 seconds (98.5% success rate)',
      },
      ecommerce: {
        before: 'Many satisfied customers',
        after: 'Over 50,000 satisfied customers with 4.8/5 average rating',
      },
      default: {
        before: `Popular ${this.content.primaryTopic} solution`,
        after: `Trusted by 10,000+ users with 95% satisfaction rate (2024 survey)`,
      },
    };

    return examples[this.content.businessType] || examples.default;
  }

  private generateHeadingExample(): { before: string; after: string } {
    const longSection = this.content.contentSamples.paragraphs.find((p) => p.length > 500);

    if (longSection) {
      return {
        before: '<h2>Overview</h2>\n[500+ words without subheadings]',
        after: `<h2>What is ${this.content.primaryTopic}?</h2>\n[150 words]\n<h3>Key Benefits</h3>\n[150 words]\n<h3>How It Works</h3>\n[200 words]`,
      };
    }

    return {
      before: `<h2>${this.content.primaryTopic}</h2>\n[Long content block]`,
      after: `<h2>Understanding ${this.content.primaryTopic}</h2>\n[Content]\n<h3>Core Features</h3>\n[Content]\n<h3>Implementation Guide</h3>\n[Content]`,
    };
  }

  private generateStructuredDataExample(): { before: string; after: string } {
    const schemaType = this.getSchemaType();
    const topic = this.content.primaryTopic;

    return {
      before: `<div class="content">\n  <h1>${this.content.contentSamples.title}</h1>\n  <p>Content about ${topic}...</p>\n</div>`,
      after: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "${schemaType}",\n  "name": "${this.content.contentSamples.title}",\n  "description": "${topic}",\n  "author": {\n    "@type": "Organization",\n    "name": "Your Company"\n  }\n}</script>`,
    };
  }

  private generateAuthorBioExample(): { before: string; after: string } {
    const topic = this.content.primaryTopic;
    const businessType = this.content.businessType;

    let expertise = topic;
    if (businessType === 'payment') expertise = 'payment systems';
    if (businessType === 'ecommerce') expertise = 'e-commerce';
    if (businessType === 'documentation') expertise = 'technical documentation';

    return {
      before: 'By Admin',
      after: `By Sarah Johnson, Senior ${this.capitalizeWords(expertise)} Specialist with 8 years experience`,
    };
  }

  private generateDataMarkupExample(): { before: string; after: string } {
    // Use actual list content if available
    if (this.content.contentSamples.lists.length > 0) {
      const list = this.content.contentSamples.lists[0];
      const items = list.items.slice(0, 3);

      return {
        before: items.join('. ') + '.',
        after: `<${list.type}>\n${items.map((item) => `  <li>${item}</li>`).join('\n')}\n</${list.type}>`,
      };
    }

    // Generate based on content type
    if (this.content.businessType === 'payment') {
      return {
        before: 'We accept Visa, Mastercard, and PayPal',
        after:
          '<ul>\n  <li>Visa - Instant processing</li>\n  <li>Mastercard - Instant processing</li>\n  <li>PayPal - Secure checkout</li>\n</ul>',
      };
    }

    return {
      before: `${this.content.primaryTopic} includes feature A, feature B, and feature C`,
      after: `<ul>\n  <li>Feature A - ${this.content.primaryTopic}</li>\n  <li>Feature B - Enhanced performance</li>\n  <li>Feature C - Easy integration</li>\n</ul>`,
    };
  }

  private generateLlmsTxtExample(): { before: string; after: string } {
    const domain = 'yoursite.com'; // We don't have the actual domain in content
    const contentType = this.content.businessType;
    const topics = this.content.detectedTopics.join(', ');

    return {
      before: 'No llms.txt file found',
      after: `# llms.txt for ${domain}\n# AI Crawler Instructions\n\nSitemap: /sitemap.xml\nContent-Type: ${contentType}\nContent-Focus: ${topics}\nUpdate-Frequency: weekly\nPrimary-Language: ${this.content.language}`,
    };
  }

  private personalizeWhy(metric: string, defaultWhy: string): string {
    const topic = this.content.primaryTopic;
    const businessType = this.content.businessType;
    const pageContext = this.getPageTypeContext();

    // Add page type prefix if available
    const contextualWhy = pageContext.prefix ? `${pageContext.prefix} ${defaultWhy}` : defaultWhy;

    // Add context based on detected content
    const personalizations: Record<string, string> = {
      listicleFormat:
        businessType === 'payment'
          ? `Payment-related content performs 40% better in listicle format. ${contextualWhy}`
          : contextualWhy,
      uniqueStats:
        this.content.contentSamples.statistics.length === 0
          ? `Your ${topic} content lacks specific data points. ${contextualWhy}`
          : `You have some statistics, but adding more will strengthen your ${topic} content. ${contextualWhy}`,
      structuredData: `Help AI understand your ${businessType} content better. ${contextualWhy}`,
      directAnswers: this.content.detectedFeatures.hasQuestions
        ? `Your questions need immediate answers for AI comprehension. ${contextualWhy}`
        : contextualWhy,
    };

    // Get the personalized message or use the contextual default
    const personalizedMessage = personalizations[metric] || contextualWhy;

    // Add page type suffix
    return pageContext.suffix
      ? `${personalizedMessage} ${pageContext.suffix}`
      : personalizedMessage;
  }

  private personalizeFix(metric: string, defaultFix: string): string {
    const topic = this.content.primaryTopic;
    const businessType = this.content.businessType;
    const pageType = this.content.pageType;

    // Start with the default fix
    let personalizedFix = defaultFix;

    // Make fixes more specific to the content
    if (metric === 'listicleFormat' && businessType === 'payment') {
      personalizedFix = defaultFix.replace('AI Search Guide', `${topic} Implementation Guide`);
    }

    if (metric === 'structuredData') {
      const schemaType = this.getSchemaType();
      personalizedFix = defaultFix.replace('Article schema', `${schemaType} schema`);
    }

    // Add page-type specific instructions
    const pageTypeInstructions = this.getPageTypeSpecificFix(metric, pageType);
    if (pageTypeInstructions) {
      personalizedFix += ` ${pageTypeInstructions}`;
    }

    return personalizedFix;
  }

  /**
   * Get page-type specific fix instructions
   */
  private getPageTypeSpecificFix(metric: string, pageType: string): string | null {
    const fixes: Record<string, Record<string, string>> = {
      uniqueStats: {
        homepage:
          'For homepages, include company metrics like "serving 10,000+ customers" or "99.9% uptime".',
        product:
          'For products, add specifications like dimensions, weight, materials, and performance metrics.',
        article:
          'Include research data, survey results, or case study metrics to boost credibility.',
        documentation: 'Add performance benchmarks, version numbers, and compatibility statistics.',
      },
      structuredData: {
        homepage: 'Use Organization schema with complete NAP (Name, Address, Phone) data.',
        product: 'Implement Product schema with price, availability, and review data.',
        article: 'Add Article or BlogPosting schema with author and datePublished.',
        documentation: 'Use TechArticle or HowTo schema for technical content.',
      },
      mainContent: {
        homepage: 'Ensure your value proposition and key services are inside <main> tags.',
        category: 'Place product listings and filters within <main> tags.',
        search: 'Wrap search results in <main> tags, exclude sidebars and ads.',
      },
      directAnswers: {
        homepage: 'Answer "What does [company] do?" in the first paragraph.',
        product: 'Start with "This product is..." or "[Product] helps you...".',
        documentation: 'Begin each section with a one-sentence summary of what it covers.',
      },
    };

    return fixes[metric]?.[pageType] || null;
  }

  private createDirectAnswer(question: string, content: string): string {
    const questionLower = question.toLowerCase();

    if (questionLower.includes('what is')) {
      const subject = question
        .replace(/what is/i, '')
        .replace(/\?/g, '')
        .trim();
      return `${subject} is ${content.substring(0, 100)}...`;
    }

    if (questionLower.includes('how')) {
      return `To ${question
        .replace(/how (to|do|does)/i, '')
        .replace(/\?/g, '')
        .trim()}, ${content.substring(0, 80)}...`;
    }

    // Default: make the first sentence more direct
    return content.substring(0, 120) + '...';
  }

  private getSchemaType(): string {
    const typeMap: Record<string, string> = {
      payment: 'FinancialService',
      ecommerce: 'Product',
      blog: 'BlogPosting',
      news: 'NewsArticle',
      documentation: 'TechArticle',
      corporate: 'Organization',
      educational: 'Course',
      other: 'Article',
    };

    return typeMap[this.content.businessType] || 'Article';
  }

  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Add default export for better Next.js compatibility
export default DynamicRecommendationGenerator;
