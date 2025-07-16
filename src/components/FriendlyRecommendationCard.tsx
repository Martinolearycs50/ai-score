'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendlyRecommendationCardProps {
  metric: string;
  why: string;
  fix: string;
  gain: number;
  pillar: string;
  example?: {
    before: string;
    after: string;
  };
  index: number;
}

// Friendly category mapping
const FRIENDLY_CATEGORIES = {
  CRITICAL: { 
    emoji: '🚀', 
    label: 'Quick Win!', 
    timeEstimate: '5-10 min fix',
    encouragement: 'This one change could transform your AI visibility!'
  },
  HIGH: { 
    emoji: '💎', 
    label: 'Big Impact', 
    timeEstimate: '15-30 min',
    encouragement: 'A small effort for a huge gain!'
  },
  MEDIUM: { 
    emoji: '⭐', 
    label: 'Nice Boost', 
    timeEstimate: '30-60 min',
    encouragement: 'Every point counts towards excellence!'
  },
};

// Friendly pillar names and colors
const FRIENDLY_PILLARS: Record<string, { name: string; color: string; metaphor: string }> = {
  RETRIEVAL: { 
    name: 'Speed & Access', 
    color: '#FF6B6B',
    metaphor: 'Like opening doors for AI visitors'
  },
  FACT_DENSITY: { 
    name: 'Rich Content', 
    color: '#4ECDC4',
    metaphor: 'Like adding nutrients to your content diet'
  },
  STRUCTURE: { 
    name: 'Smart Organization', 
    color: '#45B7D1',
    metaphor: 'Like creating a roadmap for AI to follow'
  },
  TRUST: { 
    name: 'Credibility', 
    color: '#96CEB4',
    metaphor: 'Like building your reputation with AI'
  },
  RECENCY: { 
    name: 'Freshness', 
    color: '#FECA57',
    metaphor: 'Like keeping your content garden blooming'
  },
};

export default function FriendlyRecommendationCard({
  metric,
  why,
  fix,
  gain,
  pillar,
  example,
  index,
}: FriendlyRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const category = gain >= 10 ? 'CRITICAL' : gain >= 5 ? 'HIGH' : 'MEDIUM';
  const friendlyCategory = FRIENDLY_CATEGORIES[category];
  const friendlyPillar = FRIENDLY_PILLARS[pillar];

  // Convert camelCase metric to friendly title
  const friendlyTitle = metric
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Ttfb/, 'Speed')
    .replace(/Llms Txt/, 'AI Instructions')
    .replace(/Nap/, 'Business Info');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden"
    >
      <div className="card transition-all duration-300" style={{
        borderColor: isHovered ? friendlyPillar.color : 'transparent',
        borderWidth: '2px',
      }}>
        <button
          className="w-full p-6 text-left"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Header with emoji and friendly labels */}
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-2xl"
                  animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {friendlyCategory.emoji}
                </motion.span>
                
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: friendlyPillar.color + '20',
                    color: friendlyPillar.color,
                  }}
                >
                  {friendlyPillar.name}
                </span>
                
                <span className="text-xs font-medium text-muted">
                  {friendlyCategory.timeEstimate}
                </span>
                
                {/* Animated point gain preview */}
                <motion.div
                  className="ml-auto flex items-center gap-2"
                  animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                >
                  <span className="text-sm font-bold" style={{ color: friendlyPillar.color }}>
                    +{gain}
                  </span>
                  <span className="text-xs text-muted">points</span>
                </motion.div>
              </div>

              {/* Friendly title and description */}
              <h3 className="font-medium text-lg mb-2" style={{ color: 'var(--foreground)' }}>
                {friendlyTitle}
              </h3>

              <p className="text-sm text-muted leading-relaxed mb-2">
                {friendlyPillar.metaphor}
              </p>

              {/* Why it matters - made more conversational */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                💡 {why}
              </p>

              {/* Encouragement text */}
              {!isExpanded && (
                <motion.p
                  className="text-xs mt-3 font-medium"
                  style={{ color: friendlyPillar.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  {friendlyCategory.encouragement}
                </motion.p>
              )}
            </div>

            {/* Expand icon with animation */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke={friendlyPillar.color}
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Expanded content with animations */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
                {/* How to fix - made friendlier */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>🛠️</span>
                    <span style={{ color: 'var(--foreground)' }}>Here\'s how to fix it:</span>
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    {fix}
                  </p>
                </div>

                {/* Visual Before/After Example */}
                {example && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                      <span>👀</span>
                      <span>See the difference:</span>
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Before */}
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-red-600">😕 Current</span>
                        </div>
                        <pre className="text-xs mono p-4 rounded-lg overflow-x-auto" style={{
                          background: 'rgba(255, 0, 0, 0.05)',
                          border: '1px solid rgba(255, 0, 0, 0.2)',
                          color: 'var(--foreground-muted)',
                        }}>
                          <code>{example.before}</code>
                        </pre>
                      </motion.div>

                      {/* After */}
                      <motion.div
                        className="space-y-2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-600">😊 Optimized</span>
                        </div>
                        <pre className="text-xs mono p-4 rounded-lg overflow-x-auto" style={{
                          background: 'rgba(0, 255, 0, 0.05)',
                          border: '1px solid rgba(0, 255, 0, 0.2)',
                          color: 'var(--foreground)',
                        }}>
                          <code>{example.after}</code>
                        </pre>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Motivational completion section */}
                <motion.div
                  className="mt-6 p-4 rounded-lg"
                  style={{ background: friendlyPillar.color + '10' }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: friendlyPillar.color }}>
                          Ready to implement?
                        </p>
                        <p className="text-xs text-muted">
                          You\'ll gain {gain} points with this {friendlyCategory.timeEstimate}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      className="px-4 py-2 rounded-full text-xs font-medium text-white"
                      style={{ background: friendlyPillar.color }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Future: Mark as completed
                      }}
                    >
                      Mark Complete ✓
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover glow effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at center, ${friendlyPillar.color}10 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}