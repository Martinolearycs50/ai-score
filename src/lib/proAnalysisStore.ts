/**
 * In-memory store for Pro tier analysis results with file-based persistence
 * This will be replaced with Redis or a database in production
 */
import * as fs from 'fs';
import * as path from 'path';

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
    benefitType?: 'ai' | 'seo' | 'dual';
  }>;
  addedDataPoints: Array<{
    value: string;
    source: string;
  }>;
  seoEnhancements?: Array<{
    description: string;
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
  private persistInterval: NodeJS.Timeout | null = null;
  private persistencePath: string;

  // Configuration
  private readonly RESULT_TTL_DAYS = parseInt(process.env.PRO_RESULT_TTL_DAYS || '7');
  private readonly SCAN_LIMIT = parseInt(process.env.PRO_SCAN_LIMIT || '30');
  private readonly CLEANUP_INTERVAL_MS = 3600000; // 1 hour
  private readonly PERSIST_INTERVAL_MS = 30000; // 30 seconds

  constructor() {
    this.analysisStore = new Map();
    this.userUsage = new Map();

    // Set up persistence directory
    this.persistencePath = path.join(process.cwd(), '.next', 'cache', 'pro-analysis');
    this.ensurePersistenceDir();

    // Load persisted data
    this.loadPersistedData();

    // Start background jobs
    this.startCleanupJob();
    this.startPersistenceJob();
  }

  /**
   * Ensure persistence directory exists
   */
  private ensurePersistenceDir() {
    try {
      if (!fs.existsSync(this.persistencePath)) {
        fs.mkdirSync(this.persistencePath, { recursive: true });
      }
    } catch (error) {
      console.error('[ProAnalysisStore] Failed to create persistence directory:', error);
    }
  }

  /**
   * Load persisted data on startup
   */
  private loadPersistedData() {
    try {
      // Load analysis store
      const analysisPath = path.join(this.persistencePath, 'analysis.json');
      if (fs.existsSync(analysisPath)) {
        const data = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
        // Convert dates back to Date objects
        for (const [id, result] of Object.entries(data) as [string, any][]) {
          result.createdAt = new Date(result.createdAt);
          result.expiresAt = new Date(result.expiresAt);
          if (result.aiRewrite?.generatedAt) {
            result.aiRewrite.generatedAt = new Date(result.aiRewrite.generatedAt);
          }
          this.analysisStore.set(id, result);
        }
        console.log(
          `[ProAnalysisStore] Loaded ${this.analysisStore.size} analysis results from disk`
        );
      }

      // Load user usage
      const usagePath = path.join(this.persistencePath, 'usage.json');
      if (fs.existsSync(usagePath)) {
        const data = JSON.parse(fs.readFileSync(usagePath, 'utf-8'));
        for (const [id, usage] of Object.entries(data) as [string, any][]) {
          usage.resetDate = new Date(usage.resetDate);
          usage.lastScan = new Date(usage.lastScan);
          this.userUsage.set(id, usage);
        }
        console.log(
          `[ProAnalysisStore] Loaded ${this.userUsage.size} user usage records from disk`
        );
      }
    } catch (error) {
      console.error('[ProAnalysisStore] Failed to load persisted data:', error);
    }
  }

  /**
   * Persist data to disk
   */
  private persistData() {
    try {
      // Persist analysis store
      const analysisData: Record<string, ProAnalysisResult> = {};
      for (const [id, result] of this.analysisStore) {
        analysisData[id] = result;
      }
      fs.writeFileSync(
        path.join(this.persistencePath, 'analysis.json'),
        JSON.stringify(analysisData, null, 2)
      );

      // Persist user usage
      const usageData: Record<string, UserUsage> = {};
      for (const [id, usage] of this.userUsage) {
        usageData[id] = usage;
      }
      fs.writeFileSync(
        path.join(this.persistencePath, 'usage.json'),
        JSON.stringify(usageData, null, 2)
      );
    } catch (error) {
      console.error('[ProAnalysisStore] Failed to persist data:', error);
    }
  }

  /**
   * Start the persistence job
   */
  private startPersistenceJob() {
    this.persistInterval = setInterval(() => {
      this.persistData();
    }, this.PERSIST_INTERVAL_MS);
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
      this.persistData(); // Persist after cleanup
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

    // Persist immediately for important operations
    this.persistData();
  }

  /**
   * Update with deep analysis
   */
  updateDeepAnalysis(sessionId: string, deepAnalysis: DeepAnalysis): boolean {
    const result = this.analysisStore.get(sessionId);
    if (!result) return false;

    result.deepAnalysis = deepAnalysis;
    this.analysisStore.set(sessionId, result);
    this.persistData();
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
    this.persistData();
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
    this.persistData();

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
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
      this.persistInterval = null;
    }
    // Final persist before shutdown
    this.persistData();
  }
}

// Export singleton instance
export const proAnalysisStore = new ProAnalysisStore();
