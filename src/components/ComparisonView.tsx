'use client';

import { motion } from 'framer-motion';
import type { AnalysisResultNew } from '@/lib/analyzer-new';
import PillarScoreDisplay from './PillarScoreDisplay';
import ScoreDifference from './ScoreDifference';

interface ComparisonViewProps {
  results: [AnalysisResultNew, AnalysisResultNew];
}

// Friendly pillar info
const PILLAR_INFO: Record<string, { name: string; emoji: string; tip: string }> = {
  RETRIEVAL: { 
    name: 'Speed & Access', 
    emoji: '⚡',
    tip: 'Faster sites get more AI love!'
  },
  FACT_DENSITY: { 
    name: 'Rich Content', 
    emoji: '📊',
    tip: 'Facts and data make AI happy!'
  },
  STRUCTURE: { 
    name: 'Smart Organization', 
    emoji: '📋',
    tip: 'Lists and structure = AI gold!'
  },
  TRUST: { 
    name: 'Credibility', 
    emoji: '✓',
    tip: 'Trust signals boost rankings!'
  },
  RECENCY: { 
    name: 'Freshness', 
    emoji: '🔄',
    tip: 'Fresh content wins the race!'
  }
};

export default function ComparisonView({ results }: ComparisonViewProps) {
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
        <h2 className="text-3xl font-medium" style={{ color: 'var(--foreground)' }}>
          The AI Battle Results ⚔️
        </h2>
        
        {/* Winner announcement with celebration */}
        <motion.div 
          className="flex items-center justify-center gap-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <div className="text-xl">
            {totalScoreDiff > 0 ? (
              <motion.span 
                style={{ color: 'var(--success)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆 {result1.websiteProfile?.title || result1.pageTitle || new URL(result1.url).hostname} dominates with +{Math.abs(totalScoreDiff)} points!
              </motion.span>
            ) : totalScoreDiff < 0 ? (
              <motion.span 
                style={{ color: 'var(--success)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🏆 {result2.websiteProfile?.title || result2.pageTitle || new URL(result2.url).hostname} crushes it with +{Math.abs(totalScoreDiff)} points!
              </motion.span>
            ) : (
              <span className="text-muted">
                🤝 It's a perfect tie! Both sites are equally optimized
              </span>
            )}
          </div>
        </motion.div>
        
        {/* Encouragement message */}
        <p className="text-muted">
          {totalScoreDiff === 0 ? "Every point counts in the AI search game!" :
           Math.abs(totalScoreDiff) > 20 ? "But remember, there's always room to improve!" :
           "It's a close race - small optimizations can flip the lead!"}
        </p>
      </motion.div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Website 1 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {result1.websiteProfile?.title || result1.pageTitle || new URL(result1.url).hostname}
              </h3>
              <p className="text-xs text-muted truncate">{new URL(result1.url).hostname}</p>
            </div>
            {totalScoreDiff > 0 && (
              <motion.span 
                className="text-sm px-3 py-1 rounded-full font-medium" 
                style={{ 
                  backgroundColor: 'var(--success-bg)', 
                  color: 'var(--success)' 
                }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👑 Champion
              </motion.span>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result1} compact />
            {/* Score difference indicators */}
            <div className="absolute -right-2 top-8">
              <ScoreDifference 
                difference={totalScoreDiff} 
                showSign 
              />
            </div>
          </div>
        </div>

        {/* Website 2 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {result2.websiteProfile?.title || result2.pageTitle || new URL(result2.url).hostname}
              </h3>
              <p className="text-xs text-muted truncate">{new URL(result2.url).hostname}</p>
            </div>
            {totalScoreDiff < 0 && (
              <motion.span 
                className="text-sm px-3 py-1 rounded-full font-medium" 
                style={{ 
                  backgroundColor: 'var(--success-bg)', 
                  color: 'var(--success)' 
                }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👑 Champion
              </motion.span>
            )}
          </div>
          
          <div className="relative">
            <PillarScoreDisplay result={result2} compact />
            {/* Score difference indicators */}
            <div className="absolute -left-2 top-8">
              <ScoreDifference 
                difference={-totalScoreDiff} 
                showSign 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed pillar comparison */}
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-medium text-center mb-2" style={{ color: 'var(--foreground)' }}>
          The Battlefield Breakdown 📊
        </h3>
        <p className="text-center text-muted mb-8">
          See where each site shines and where they can level up!
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
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PILLAR_INFO[pillar1.pillar]?.emoji}</span>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {PILLAR_INFO[pillar1.pillar]?.name || pillar1.pillar}
                        </h4>
                        <p className="text-xs text-muted">
                          {PILLAR_INFO[pillar1.pillar]?.tip}
                        </p>
                      </div>
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
                    <span className="text-xl">{PILLAR_INFO[pillar.pillar]?.emoji}</span>
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
    </div>
  );
}