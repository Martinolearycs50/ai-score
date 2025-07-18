'use client';

import { motion } from 'framer-motion';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import PillarScoreDisplay from './PillarScoreDisplay';
import ScoreDifference from './ScoreDifference';
import { useTier } from '@/hooks/useTier';

interface ComparisonViewProps {
  results: [AnalysisResultNew, AnalysisResultNew];
}

// Pillar information
const PILLAR_INFO: Record<string, { name: string; tip: string }> = {
  RETRIEVAL: { 
    name: 'Speed & Access', 
    tip: 'Optimization for AI crawler access and speed'
  },
  FACT_DENSITY: { 
    name: 'Rich Content', 
    tip: 'Density of facts and structured data'
  },
  STRUCTURE: { 
    name: 'Smart Organization', 
    tip: 'Content structure and formatting quality'
  },
  TRUST: { 
    name: 'Credibility', 
    tip: 'Authority and trust signals'
  },
  RECENCY: { 
    name: 'Freshness', 
    tip: 'Content recency and update frequency'
  }
};

export default function ComparisonView({ results }: ComparisonViewProps) {
  const { features } = useTier();
  const [result1, result2] = results;
  
  // Calculate score differences
  const totalScoreDiff = result1.aiSearchScore - result2.aiSearchScore;
  
  return (
    <div className="space-y-8">
      {/* Overall comparison header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-medium" style={{ color: 'var(--foreground)' }}>
          Analysis Complete
        </h2>
        
        {/* Winner announcement with sophisticated design */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {totalScoreDiff !== 0 && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z" fill="#10B981" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg font-medium" style={{ color: '#059669' }}>
                {totalScoreDiff > 0 
                  ? `${result1.websiteProfile?.title || new URL(result1.url).hostname} leads by ${Math.abs(totalScoreDiff)} points`
                  : `${result2.websiteProfile?.title || new URL(result2.url).hostname} leads by ${Math.abs(totalScoreDiff)} points`
                }
              </span>
            </div>
          )}
          {totalScoreDiff === 0 && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-full border border-gray-200">
              <span className="text-lg text-gray-600">
                Perfect tie - Both sites score {result1.aiSearchScore} points
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Insight message */}
        <p className="text-lg text-muted mt-4">
          {totalScoreDiff === 0 ? "Both sites are equally optimized for AI search engines" :
           Math.abs(totalScoreDiff) > 20 ? "A significant gap that can be closed with targeted improvements" :
           "Small optimizations could change the rankings"}
        </p>
      </motion.div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Website 1 */}
        <motion.div 
          className={`space-y-4 p-6 rounded-lg border-2 transition-all ${
            totalScoreDiff > 0 
              ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 shadow-lg' 
              : totalScoreDiff < 0
              ? 'border-gray-200 bg-gray-50/50'
              : 'border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {result1.websiteProfile?.title || result1.pageTitle || new URL(result1.url).hostname}
              </h3>
              <p className="text-sm text-muted truncate">{new URL(result1.url).hostname}</p>
            </div>
            {totalScoreDiff > 0 && (
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L7 7L12 3L17 7L19 12L12 19L5 12Z" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2"/>
                  <circle cx="12" cy="8" r="2" fill="#10B981"/>
                </svg>
                <span className="text-sm font-medium text-green-700">Winner</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result1} compact />
          </div>
        </motion.div>

        {/* Website 2 */}
        <motion.div 
          className={`space-y-4 p-6 rounded-lg border-2 transition-all ${
            totalScoreDiff < 0 
              ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 shadow-lg' 
              : totalScoreDiff > 0
              ? 'border-gray-200 bg-gray-50/50'
              : 'border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {result2.websiteProfile?.title || result2.pageTitle || new URL(result2.url).hostname}
              </h3>
              <p className="text-sm text-muted truncate">{new URL(result2.url).hostname}</p>
            </div>
            {totalScoreDiff < 0 && (
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L7 7L12 3L17 7L19 12L12 19L5 12Z" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2"/>
                  <circle cx="12" cy="8" r="2" fill="#10B981"/>
                </svg>
                <span className="text-sm font-medium text-green-700">Winner</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result2} compact />
          </div>
        </motion.div>
      </div>

      {/* Detailed pillar comparison - only for pro users */}
      {features.showPillarBreakdown && (
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-medium text-center mb-2" style={{ color: 'var(--foreground)' }}>
          Detailed Breakdown
        </h3>
        <p className="text-center text-muted mb-8">
          Category-by-category performance comparison
        </p>
        
        <div className="space-y-4">
          {result1.scoringResult.breakdown.map((pillar1, index) => {
            // Find the matching pillar in result2
            const pillar2 = result2.scoringResult.breakdown.find(
              p => p.pillar === pillar1.pillar
            );
            
            if (!pillar2) return null;
            
            const diff = pillar1.earned - pillar2.earned;
            
            return (
              <motion.div 
                key={pillar1.pillar} 
                className="card p-6 hover:shadow-lg transition-all"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div>
                      <h4 className="font-medium text-lg" style={{ color: 'var(--foreground)' }}>
                        {PILLAR_INFO[pillar1.pillar]?.name || pillar1.pillar}
                      </h4>
                      <p className="text-sm text-muted">
                        {PILLAR_INFO[pillar1.pillar]?.tip}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    {/* Website 1 score */}
                    <div className="text-right">
                      <div className="text-sm text-muted">{new URL(result1.url).hostname}</div>
                      <div className="text-lg font-medium" style={{ 
                        color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--error)' : 'var(--foreground)' 
                      }}>
                        {pillar1.earned}/{pillar1.max}
                      </div>
                    </div>
                    
                    {/* Difference */}
                    <div className="w-20 text-center">
                      <ScoreDifference difference={diff} />
                    </div>
                    
                    {/* Website 2 score */}
                    <div className="text-left">
                      <div className="text-sm text-muted">{new URL(result2.url).hostname}</div>
                      <div className="text-lg font-medium" style={{ 
                        color: diff < 0 ? 'var(--success)' : diff > 0 ? 'var(--error)' : 'var(--foreground)' 
                      }}>
                        {pillar2.earned}/{pillar2.max}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Quick Wins Section for the losing site */}
        {totalScoreDiff !== 0 && (
          <motion.div 
            className="mt-12 p-6 rounded-lg"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              border: '2px solid rgba(139, 92, 246, 0.2)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span style={{ color: 'var(--foreground)' }}>
                Quick Wins for {totalScoreDiff > 0 ? new URL(result2.url).hostname : new URL(result1.url).hostname}
              </span>
            </h4>
            <p className="text-sm text-muted mb-4">
              Focus on these areas to close the gap and boost your AI visibility:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {(totalScoreDiff > 0 ? result2 : result1).scoringResult.breakdown
                .filter(pillar => {
                  const otherPillar = (totalScoreDiff > 0 ? result1 : result2).scoringResult.breakdown.find(
                    p => p.pillar === pillar.pillar
                  );
                  return otherPillar && pillar.earned < otherPillar.earned;
                })
                .slice(0, 4)
                .map((pillar, idx) => (
                  <motion.div 
                    key={pillar.pillar}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/50"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        Improve {PILLAR_INFO[pillar.pillar]?.name}
                      </p>
                      <p className="text-xs text-muted">
                        Potential gain: +{pillar.max - pillar.earned} points
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>
      )}

      {/* Upgrade CTA for free tier users */}
      {features.showUpgradeCTA && (
        <motion.div 
          className="mt-12 p-8 rounded-lg text-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
            border: '2px solid rgba(59, 130, 246, 0.2)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Want the Full Battle Analysis? ⚔️
          </h3>
          <p className="text-lg text-muted mb-6">
            Unlock detailed pillar breakdowns, strategic recommendations, and quick wins to dominate the AI search game!
          </p>
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade to Pro →
          </button>
        </motion.div>
      )}
    </div>
  );
}