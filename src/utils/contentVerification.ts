/**
 * Content Verification Utility
 * 
 * Verifies that displayed content matches actual analysis results
 * Helps identify and fix any inaccuracies in the UI
 */

import type { AnalysisResultNew } from '@/lib/analyzer-new';
import { capturedDomain } from '@/lib/audit/retrieval';
import { capturedHeadings } from '@/lib/audit/factDensity';
import { capturedContent } from '@/lib/audit/structure';

interface VerificationIssue {
  component: string;
  field: string;
  displayed: any;
  actual: any;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export class ContentAccuracyVerifier {
  private issues: VerificationIssue[] = [];

  /**
   * Verify all content in analysis results
   */
  verifyAnalysisResults(result: AnalysisResultNew): VerificationIssue[] {
    this.issues = [];

    // Verify RETRIEVAL metrics
    this.verifyRetrievalMetrics(result);

    // Verify FACT_DENSITY metrics
    this.verifyFactDensityMetrics(result);

    // Verify STRUCTURE metrics
    this.verifyStructureMetrics(result);

    // Verify TRUST metrics
    this.verifyTrustMetrics(result);

    // Verify RECENCY metrics
    this.verifyRecencyMetrics(result);

    // Verify score calculations
    this.verifyScoreCalculations(result);

    return this.issues;
  }

  private verifyRetrievalMetrics(result: AnalysisResultNew) {
    // Verify TTFB accuracy
    if (result.dataSources) {
      const ttfbSource = result.dataSources.find(ds => ds.metric === 'ttfb');
      if (ttfbSource && capturedDomain.actualTtfb !== undefined) {
        if (ttfbSource.details?.ttfb !== capturedDomain.actualTtfb) {
          this.addIssue({
            component: 'DataSource',
            field: 'ttfb',
            displayed: ttfbSource.details?.ttfb,
            actual: capturedDomain.actualTtfb,
            severity: 'error',
            message: 'TTFB value mismatch between data source and captured value'
          });
        }
      }
    }

    // Verify paywall detection
    if (result.breakdown?.RETRIEVAL.paywall !== undefined) {
      const expectedPaywallScore = capturedDomain.hasPaywall ? 0 : 5;
      if (result.breakdown.RETRIEVAL.paywall !== expectedPaywallScore) {
        this.addIssue({
          component: 'RETRIEVAL',
          field: 'paywall',
          displayed: result.breakdown.RETRIEVAL.paywall,
          actual: expectedPaywallScore,
          severity: 'error',
          message: 'Paywall score does not match detection'
        });
      }
    }

    // Verify HTML size
    if (capturedDomain.htmlSizeKB && result.breakdown?.RETRIEVAL.htmlSize !== undefined) {
      const expectedScore = capturedDomain.htmlSizeKB <= 2048 ? 5 : 0;
      if (result.breakdown.RETRIEVAL.htmlSize !== expectedScore) {
        this.addIssue({
          component: 'RETRIEVAL',
          field: 'htmlSize',
          displayed: result.breakdown.RETRIEVAL.htmlSize,
          actual: expectedScore,
          severity: 'warning',
          message: `HTML size ${capturedDomain.htmlSizeKB}KB should give score ${expectedScore}`
        });
      }
    }
  }

  private verifyFactDensityMetrics(result: AnalysisResultNew) {
    // Verify direct answers detection
    if (capturedHeadings.length > 0 && result.breakdown?.FACT_DENSITY.directAnswers !== undefined) {
      // If we captured headings without direct answers, score should be less than 5
      if (result.breakdown.FACT_DENSITY.directAnswers === 5 && capturedHeadings.length > 0) {
        this.addIssue({
          component: 'FACT_DENSITY',
          field: 'directAnswers',
          displayed: result.breakdown.FACT_DENSITY.directAnswers,
          actual: '<5',
          severity: 'warning',
          message: `Found ${capturedHeadings.length} headings without direct answers`
        });
      }
    }
  }

  private verifyStructureMetrics(result: AnalysisResultNew) {
    // Verify schema detection
    // TODO: Fix when schemaTypes is added to CapturedContent interface
    // if (capturedContent.schemaTypes && result.breakdown?.STRUCTURE.structuredData !== undefined) {
    //   const hasSchema = capturedContent.schemaTypes.length > 0;
    //   const expectedScore = hasSchema ? 5 : 0;
    //   
    //   if ((result.breakdown.STRUCTURE.structuredData > 0) !== hasSchema) {
    //     this.addIssue({
    //       component: 'STRUCTURE',
    //       field: 'structuredData',
    //       displayed: result.breakdown.STRUCTURE.structuredData,
    //       actual: expectedScore,
    //       severity: 'error',
    //       message: `Schema types found: ${capturedContent.schemaTypes.join(', ') || 'none'}`
    //     });
    //   }
    // }

    // Verify heading issues
    // TODO: Fix when headingIssues is added to CapturedContent interface
    // if (capturedContent.headingIssues && capturedContent.headingIssues.length > 0) {
    //   if (result.breakdown?.STRUCTURE.headingDepth === 5) {
    //     this.addIssue({
    //       component: 'STRUCTURE',
    //       field: 'headingDepth',
    //       displayed: result.breakdown.STRUCTURE.headingDepth,
    //       actual: '<5',
    //       severity: 'warning',
    //       message: `Heading issues found: ${capturedContent.headingIssues.join(', ')}`
    //     });
    //   }
    // }
  }

  private verifyTrustMetrics(result: AnalysisResultNew) {
    // Trust metrics verification would go here
    // Currently limited by what's captured in audit modules
  }

  private verifyRecencyMetrics(result: AnalysisResultNew) {
    // Recency metrics verification would go here
  }

  private verifyScoreCalculations(result: AnalysisResultNew) {
    // Verify pillar scores sum to total
    const pillarSum = Object.values(result.scoringResult.pillarScores).reduce((a, b) => a + b, 0);
    if (result.aiSearchScore !== pillarSum) {
      this.addIssue({
        component: 'ScoreCalculation',
        field: 'total',
        displayed: result.aiSearchScore,
        actual: pillarSum,
        severity: 'error',
        message: 'Total score does not equal sum of pillar scores'
      });
    }

    // Verify each pillar breakdown
    if (result.breakdown) {
      for (const [pillar, checks] of Object.entries(result.breakdown)) {
        const checkSum = Object.values(checks).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
        const pillarScore = result.scoringResult.pillarScores[pillar as keyof typeof result.scoringResult.pillarScores];
        
        if (checkSum !== pillarScore) {
          this.addIssue({
            component: pillar,
            field: 'pillarTotal',
            displayed: pillarScore,
            actual: checkSum,
            severity: 'error',
            message: `${pillar} score does not equal sum of its checks`
          });
        }
      }
    }
  }

  private addIssue(issue: VerificationIssue) {
    this.issues.push(issue);
    
    // Log based on severity
    const prefix = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[issue.severity];
    
    console.log(`${prefix} [Content Verification] ${issue.component}.${issue.field}: ${issue.message}`);
    console.log(`    Displayed: ${JSON.stringify(issue.displayed)}`);
    console.log(`    Actual: ${JSON.stringify(issue.actual)}`);
  }

  /**
   * Generate verification report
   */
  generateReport(): string {
    const report = [
      '=== CONTENT VERIFICATION REPORT ===',
      `Generated: ${new Date().toISOString()}`,
      `Total Issues: ${this.issues.length}`,
      `Errors: ${this.issues.filter(i => i.severity === 'error').length}`,
      `Warnings: ${this.issues.filter(i => i.severity === 'warning').length}`,
      `Info: ${this.issues.filter(i => i.severity === 'info').length}`,
      '',
      'ISSUES BY COMPONENT:'
    ];

    // Group by component
    const byComponent = this.issues.reduce((acc, issue) => {
      if (!acc[issue.component]) acc[issue.component] = [];
      acc[issue.component].push(issue);
      return acc;
    }, {} as Record<string, VerificationIssue[]>);

    for (const [component, issues] of Object.entries(byComponent)) {
      report.push(`\n${component}:`);
      issues.forEach(issue => {
        report.push(`  ${issue.severity.toUpperCase()}: ${issue.field}`);
        report.push(`    ${issue.message}`);
        report.push(`    Displayed: ${JSON.stringify(issue.displayed)} | Actual: ${JSON.stringify(issue.actual)}`);
      });
    }

    return report.join('\n');
  }

  /**
   * Check if results are accurate enough
   */
  isAccurate(errorThreshold: number = 0): boolean {
    const errors = this.issues.filter(i => i.severity === 'error');
    return errors.length <= errorThreshold;
  }
}

/**
 * Helper to verify specific content pieces
 */
export function verifyDisplayedContent(
  elementText: string,
  expectedContent: string | number | RegExp
): boolean {
  if (typeof expectedContent === 'string') {
    return elementText.includes(expectedContent);
  } else if (typeof expectedContent === 'number') {
    const numberMatch = elementText.match(/\d+/);
    return numberMatch ? parseInt(numberMatch[0]) === expectedContent : false;
  } else if (expectedContent instanceof RegExp) {
    return expectedContent.test(elementText);
  }
  return false;
}

/**
 * Verify recommendations show actual data
 */
export function verifyRecommendationAccuracy(
  recommendation: any,
  websiteProfile?: any
): VerificationIssue[] {
  const issues: VerificationIssue[] = [];

  // Check for placeholder content
  const placeholders = [
    'your-site.com',
    'yoursite.com',
    'example.com',
    '[INSERT',
    'PLACEHOLDER',
    'Lorem ipsum',
    'TODO'
  ];

  const recText = JSON.stringify(recommendation);
  
  for (const placeholder of placeholders) {
    if (recText.includes(placeholder)) {
      issues.push({
        component: 'Recommendation',
        field: recommendation.metric,
        displayed: placeholder,
        actual: websiteProfile?.domain || 'actual domain',
        severity: 'error',
        message: `Recommendation contains placeholder: "${placeholder}"`
      });
    }
  }

  // Verify personalization
  if (websiteProfile?.domain && !recText.includes(websiteProfile.domain)) {
    issues.push({
      component: 'Recommendation',
      field: recommendation.metric,
      displayed: 'generic content',
      actual: websiteProfile.domain,
      severity: 'warning',
      message: 'Recommendation not personalized with actual domain'
    });
  }

  return issues;
}