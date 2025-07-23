import type { AnalysisResultNew } from './analyzer-new';
import {
  getBusinessPersona,
  getTypicalCompetitors,
  personalizeNarrative,
} from './businessPersonas';
import type { ExtractedContent } from './contentExtractor';

export interface StoryArc {
  stages: {
    recognition: StageContent;
    curiosity: StageContent;
    revelation: StageContent;
    concern: StageContent;
    hope: StageContent;
    action: StageContent;
    celebration: StageContent;
  };
  metadata: {
    businessType: string;
    competitorCount: number;
    improvementPotential: number;
    estimatedLostTraffic: number;
  };
}

interface StageContent {
  title: string;
  message: string;
  subMessage?: string;
  emotion:
    | 'neutral'
    | 'curious'
    | 'surprised'
    | 'concerned'
    | 'hopeful'
    | 'excited'
    | 'celebratory';
  visualHint?: 'loading' | 'discovery' | 'warning' | 'opportunity' | 'success';
  duration: number; // milliseconds to display
  data?: Record<string, any>; // Stage-specific data
}

/**
 * Generates a personalized narrative journey based on analysis results
 * This creates the emotional arc that drives engagement and action
 */
export class NarrativeEngine {
  private analysisResult: AnalysisResultNew;
  private extractedContent: ExtractedContent;
  private businessPersona: ReturnType<typeof getBusinessPersona>;

  constructor(analysisResult: AnalysisResultNew, extractedContent: ExtractedContent) {
    this.analysisResult = analysisResult;
    this.extractedContent = extractedContent;
    this.businessPersona = getBusinessPersona(extractedContent);
  }

  /**
   * Generate the complete story arc for the user journey
   */
  generateStoryArc(): StoryArc {
    const score = this.analysisResult.aiSearchScore;
    const competitors = this.detectCompetitors();
    const improvementPotential = this.calculateImprovementPotential(score);
    const estimatedLostTraffic = this.estimateLostTraffic(score);

    return {
      stages: {
        recognition: this.createRecognitionStage(),
        curiosity: this.createCuriosityStage(competitors),
        revelation: this.createRevelationStage(score, improvementPotential),
        concern: this.createConcernStage(competitors, estimatedLostTraffic),
        hope: this.createHopeStage(improvementPotential),
        action: this.createActionStage(),
        celebration: this.createCelebrationStage(),
      },
      metadata: {
        businessType: this.extractedContent.businessType,
        competitorCount: competitors.length,
        improvementPotential,
        estimatedLostTraffic,
      },
    };
  }

  private createRecognitionStage(): StageContent {
    const { businessAttributes } = this.extractedContent;
    const recognitionMessage = personalizeNarrative(
      this.businessPersona.narratives.recognition,
      this.extractedContent
    );

    let subMessage = '';
    if (businessAttributes.yearFounded) {
      subMessage = `Established ${new Date().getFullYear() - parseInt(businessAttributes.yearFounded)} years ago`;
    } else if (businessAttributes.location) {
      subMessage = `Based in ${businessAttributes.location}`;
    }

    return {
      title: 'Analyzing Your Digital Presence',
      message: recognitionMessage,
      subMessage,
      emotion: 'neutral',
      visualHint: 'loading',
      duration: 3000,
      data: {
        businessType: this.businessPersona.displayName,
        mainFocus: businessAttributes.mainProduct || businessAttributes.mainService,
      },
    };
  }

  private createCuriosityStage(competitors: string[]): StageContent {
    const topCompetitor = competitors[0] || 'your competitors';
    const extractedCompetitorCount = this.extractedContent.competitorMentions.length;
    const curiosityMessage = personalizeNarrative(
      this.businessPersona.narratives.curiosityGap,
      this.extractedContent,
      {
        competitor: topCompetitor,
        searchQuery: this.getRelevantSearchQuery(),
      }
    );

    return {
      title: 'Making a Discovery...',
      message: curiosityMessage,
      subMessage: 'Comparing with industry leaders...',
      emotion: 'curious',
      visualHint: 'discovery',
      duration: 4000,
      data: {
        competitorsFound: extractedCompetitorCount,
        topCompetitor,
      },
    };
  }

  private createRevelationStage(score: number, potential: number): StageContent {
    const scoreMessage =
      score < 40
        ? 'Your current visibility to AI is limited'
        : score < 70
          ? 'You have a solid foundation for AI visibility'
          : "You're already performing well in AI search";

    const potentialMessage = `With optimization, you could reach a score of ${score + potential}`;

    return {
      title: `AI Search Score: ${score}`,
      message: scoreMessage,
      subMessage: potentialMessage,
      emotion: score < 40 ? 'concerned' : 'hopeful',
      visualHint: score < 40 ? 'warning' : 'opportunity',
      duration: 5000,
      data: {
        currentScore: score,
        potentialScore: score + potential,
        improvement: potential,
      },
    };
  }

  private createConcernStage(competitors: string[], lostTraffic: number): StageContent {
    const topCompetitor = competitors[0] || 'competitors';
    const concernMessage = personalizeNarrative(
      this.businessPersona.narratives.concernTrigger,
      this.extractedContent,
      {
        competitor: topCompetitor,
        visitorCount: lostTraffic,
        searchQuery: this.getRelevantSearchQuery(),
      }
    );

    return {
      title: 'The Hidden Cost',
      message: concernMessage,
      subMessage: `That's ${lostTraffic * 30} potential customers per month`,
      emotion: 'concerned',
      visualHint: 'warning',
      duration: 4000,
      data: {
        dailyLoss: lostTraffic,
        monthlyLoss: lostTraffic * 30,
        mainCompetitor: topCompetitor,
      },
    };
  }

  private createHopeStage(potential: number): StageContent {
    const hopeMessage = personalizeNarrative(
      this.businessPersona.narratives.hopeTrigger,
      this.extractedContent,
      {
        missingElement: this.getKeyMissingElement(),
      }
    );

    const quickWins = this.businessPersona.recommendations.quickWins.slice(0, 3);

    return {
      title: 'The Path Forward',
      message: hopeMessage,
      subMessage: `Starting with: ${quickWins[0]}`,
      emotion: 'hopeful',
      visualHint: 'opportunity',
      duration: 5000,
      data: {
        potentialImprovement: potential,
        topRecommendations: quickWins,
      },
    };
  }

  private createActionStage(): StageContent {
    const priorities = this.businessPersona.recommendations.priorities;
    const actionSteps = this.getTopActionSteps();

    return {
      title: 'Your Optimization Roadmap',
      message: `Focus on these ${priorities.length} key areas for maximum impact`,
      subMessage: `Each improvement brings you closer to AI visibility`,
      emotion: 'excited',
      visualHint: 'success',
      duration: 4000,
      data: {
        priorities,
        actionSteps,
        estimatedTime: this.estimateImplementationTime(),
      },
    };
  }

  private createCelebrationStage(): StageContent {
    const celebrationMessage = personalizeNarrative(
      this.businessPersona.narratives.celebrationMessage,
      this.extractedContent
    );

    return {
      title: 'Ready to Transform Your AI Visibility',
      message: celebrationMessage,
      subMessage: 'View your detailed analysis and recommendations below',
      emotion: 'celebratory',
      visualHint: 'success',
      duration: 3000,
      data: {
        readyToImplement: true,
      },
    };
  }

  /**
   * Detect competitors from various sources
   */
  private detectCompetitors(): string[] {
    const competitors = new Set<string>();

    // From extracted competitor mentions
    this.extractedContent.competitorMentions.forEach((mention) => {
      competitors.add(mention.name);
    });

    // From typical competitors for this business type
    const typicalCompetitors = getTypicalCompetitors(this.extractedContent.businessType);
    typicalCompetitors.slice(0, 3).forEach((comp) => competitors.add(comp));

    return Array.from(competitors).slice(0, 5);
  }

  /**
   * Calculate improvement potential based on current score and business type
   */
  private calculateImprovementPotential(currentScore: number): number {
    // Base potential on how far from 100
    let basePotential = 100 - currentScore;

    // Realistic achievement factor (can't usually get to 100)
    const achievableFactor = 0.7;

    // Business type modifier
    const businessModifiers: Record<string, number> = {
      documentation: 0.8, // Easier to optimize
      blog: 0.75,
      ecommerce: 0.7,
      corporate: 0.65,
      payment: 0.6,
      news: 0.6,
      educational: 0.7,
      other: 0.65,
    };

    const modifier = businessModifiers[this.extractedContent.businessType] || 0.65;

    return Math.round(basePotential * achievableFactor * modifier);
  }

  /**
   * Estimate daily lost traffic based on score and business type
   */
  private estimateLostTraffic(score: number): number {
    // Base calculation: lower scores = more lost traffic
    const scoreFactor = (100 - score) / 100;

    // Business type base traffic estimates
    const baseTrafficByType: Record<string, number> = {
      ecommerce: 500,
      blog: 300,
      news: 1000,
      documentation: 200,
      corporate: 150,
      payment: 100,
      educational: 250,
      other: 100,
    };

    const baseTraffic = baseTrafficByType[this.extractedContent.businessType] || 100;

    return Math.round(baseTraffic * scoreFactor * 0.3); // 30% of potential traffic is AI-driven
  }

  /**
   * Get the most relevant search query for this business
   */
  private getRelevantSearchQuery(): string {
    const { businessAttributes, primaryTopic } = this.extractedContent;

    if (businessAttributes.mainService) {
      return `best ${businessAttributes.mainService}`;
    } else if (businessAttributes.mainProduct) {
      return businessAttributes.mainProduct;
    } else {
      return primaryTopic;
    }
  }

  /**
   * Identify the key missing element for this site
   */
  private getKeyMissingElement(): string {
    const scoreBreakdown = this.analysisResult.scoringResult.pillarScores;

    // Find the weakest pillar
    let weakestPillar = '';
    let lowestPercentage = 100;

    Object.entries(scoreBreakdown).forEach(([pillar, score]) => {
      // Get the max score for this pillar
      const maxScores: Record<string, number> = {
        RETRIEVAL: 30,
        FACT_DENSITY: 25,
        STRUCTURE: 20,
        TRUST: 15,
        RECENCY: 10,
      };

      const percentage = (score / maxScores[pillar]) * 100;
      if (percentage < lowestPercentage) {
        lowestPercentage = percentage;
        weakestPillar = pillar;
      }
    });

    const missingElements: Record<string, string> = {
      RETRIEVAL: 'technical optimization',
      FACT_DENSITY: 'specific data and statistics',
      STRUCTURE: 'clear content organization',
      TRUST: 'credibility signals',
      RECENCY: 'fresh, updated content',
    };

    return missingElements[weakestPillar] || 'key optimization elements';
  }

  /**
   * Get top 3 actionable steps based on analysis
   */
  private getTopActionSteps(): string[] {
    const recommendations = this.analysisResult.scoringResult.recommendations
      .filter((rec) => rec.gain >= 5) // High impact = gain >= 5
      .slice(0, 3)
      .map((rec) => rec.fix);

    if (recommendations.length < 3) {
      // Add some from business persona if needed
      const personaRecs = this.businessPersona.recommendations.quickWins;
      recommendations.push(...personaRecs.slice(0, 3 - recommendations.length));
    }

    return recommendations;
  }

  /**
   * Estimate time to implement improvements
   */
  private estimateImplementationTime(): string {
    const score = this.analysisResult.aiSearchScore;

    if (score < 30) return '2-3 days';
    if (score < 50) return '1-2 days';
    if (score < 70) return '4-8 hours';
    return '2-4 hours';
  }

  /**
   * Generate a progress-based narrative for returning users
   */
  generateProgressNarrative(previousScore: number): StageContent {
    const currentScore = this.analysisResult.aiSearchScore;
    const improvement = currentScore - previousScore;

    if (improvement > 0) {
      return {
        title: `You've Improved by ${improvement} Points!`,
        message: `Your efforts are paying off. Your site is now more visible to AI search.`,
        subMessage: `Previous: ${previousScore} → Current: ${currentScore}`,
        emotion: 'celebratory',
        visualHint: 'success',
        duration: 4000,
        data: {
          previousScore,
          currentScore,
          improvement,
        },
      };
    } else if (improvement < 0) {
      return {
        title: 'Time for a Refresh',
        message: `Your score has decreased slightly. This often happens when content becomes outdated.`,
        subMessage: `Let's get you back on track`,
        emotion: 'concerned',
        visualHint: 'warning',
        duration: 4000,
        data: {
          previousScore,
          currentScore,
          decrease: Math.abs(improvement),
        },
      };
    } else {
      return {
        title: 'Maintaining Your Position',
        message: `Your score remains stable, but there's room for growth.`,
        subMessage: `New opportunities detected`,
        emotion: 'neutral',
        visualHint: 'discovery',
        duration: 3000,
        data: {
          currentScore,
          status: 'stable',
        },
      };
    }
  }
}
