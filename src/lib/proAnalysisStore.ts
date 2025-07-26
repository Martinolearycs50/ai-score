/**
 * In-memory store for Pro tier analysis results
 * This will be replaced with Redis or a database in production
 */
import type { AnalysisResultNew } from './analyzer-new';

export interface ProAnalysisResult {
  sessionId: string;
  url: string;
  analysis: AnalysisResultNew;
  deepAnalysis?: DeepAnalysis;
  aiRewrite?: AiRewriteResult;
  createdAt: Date;
  expiresAt: Date;
}

export interface DeepAnalysis {
  headings: Array<{
    level: number;
    text: string;
    line: number;
  }>;
  dataPoints: Array<{
    value: string;
    context: string;
    source?: string;
  }>;
  issues: Array<{
    type: 'technical' | 'content';
    location: string;
    specific: string;
    fix: string;
    impact: number;
    pillar: string;
  }>;
  technicalTasks: string[];
  contentTasks: string[];
}

export interface AiRewriteResult {
  originalContent: string;
  originalMarkdown: string;
  rewrittenContent: string;
  improvements: Array<{
    type: string;
    description: string;
  }>;
  addedDataPoints: Array<{
    value: string;
    source: string;
  }>;
  generatedAt: Date;
  metadata?: {
    tokensUsed?: number;
    estimatedCost?: number;
    generatedAt?: string;
  };
}

export interface UserUsage {
  userId: string; // For now, using session/IP
  count: number;
  resetDate: Date;
  lastScan: Date;
}

class ProAnalysisStore {
  private analysisStore: Map<string, ProAnalysisResult>;
  private userUsage: Map<string, UserUsage>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Configuration
  private readonly RESULT_TTL_DAYS = parseInt(process.env.PRO_RESULT_TTL_DAYS || '7');
  private readonly SCAN_LIMIT = parseInt(process.env.PRO_SCAN_LIMIT || '30');
  private readonly CLEANUP_INTERVAL_MS = 3600000; // 1 hour

  constructor() {
    this.analysisStore = new Map();
    this.userUsage = new Map();
    this.startCleanupJob();
  }

  /**
   * Start the cleanup job to remove expired results
   */
  private startCleanupJob() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Clean up expired results
   */
  private cleanup() {
    const now = new Date();
    let cleaned = 0;

    for (const [id, data] of this.analysisStore) {
      if (data.expiresAt < now) {
        this.analysisStore.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[ProAnalysisStore] Cleaned up ${cleaned} expired results`);
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `pro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store analysis result
   */
  storeAnalysis(sessionId: string, url: string, analysis: AnalysisResultNew): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.RESULT_TTL_DAYS * 24 * 60 * 60 * 1000);

    this.analysisStore.set(sessionId, {
      sessionId,
      url,
      analysis,
      createdAt: now,
      expiresAt,
    });
  }

  /**
   * Update with deep analysis
   */
  updateDeepAnalysis(sessionId: string, deepAnalysis: DeepAnalysis): boolean {
    const result = this.analysisStore.get(sessionId);
    if (!result) return false;

    result.deepAnalysis = deepAnalysis;
    this.analysisStore.set(sessionId, result);
    return true;
  }

  /**
   * Update with AI rewrite
   */
  updateAiRewrite(sessionId: string, aiRewrite: AiRewriteResult): boolean {
    const result = this.analysisStore.get(sessionId);
    if (!result) return false;

    result.aiRewrite = aiRewrite;
    this.analysisStore.set(sessionId, result);
    return true;
  }

  /**
   * Get analysis result
   */
  getAnalysis(sessionId: string): ProAnalysisResult | null {
    const result = this.analysisStore.get(sessionId);
    if (!result) return null;

    // Check if expired
    if (result.expiresAt < new Date()) {
      this.analysisStore.delete(sessionId);
      return null;
    }

    return result;
  }

  /**
   * Check and update user usage
   */
  checkAndUpdateUsage(userId: string): { allowed: boolean; count: number; limit: number } {
    const now = new Date();
    const usage = this.userUsage.get(userId);

    // Initialize or reset if needed
    if (!usage || this.shouldResetUsage(usage.resetDate)) {
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
      this.userUsage.set(userId, {
        userId,
        count: 0,
        resetDate,
        lastScan: now,
      });
    }

    const currentUsage = this.userUsage.get(userId)!;

    if (currentUsage.count >= this.SCAN_LIMIT) {
      return { allowed: false, count: currentUsage.count, limit: this.SCAN_LIMIT };
    }

    // Update usage
    currentUsage.count++;
    currentUsage.lastScan = now;
    this.userUsage.set(userId, currentUsage);

    return { allowed: true, count: currentUsage.count, limit: this.SCAN_LIMIT };
  }

  /**
   * Get user usage without updating
   */
  getUserUsage(userId: string): { count: number; limit: number; resetDate: Date } {
    const usage = this.userUsage.get(userId);
    const now = new Date();

    if (!usage || this.shouldResetUsage(usage.resetDate)) {
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { count: 0, limit: this.SCAN_LIMIT, resetDate };
    }

    return {
      count: usage.count,
      limit: this.SCAN_LIMIT,
      resetDate: usage.resetDate,
    };
  }

  /**
   * Check if usage should be reset
   */
  private shouldResetUsage(resetDate: Date): boolean {
    return new Date() >= resetDate;
  }

  /**
   * Get all active sessions for a user (for future dashboard)
   */
  getUserSessions(userId: string): ProAnalysisResult[] {
    const sessions: ProAnalysisResult[] = [];
    const now = new Date();

    for (const [_, result] of this.analysisStore) {
      // In the future, we'll track userId in the result
      // For now, return recent results
      if (result.expiresAt > now) {
        sessions.push(result);
      }
    }

    return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Stop cleanup job (for graceful shutdown)
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const proAnalysisStore = new ProAnalysisStore();
