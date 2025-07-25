'use client';

import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

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
  websiteProfile?: {
    domain: string;
    title: string;
    contentType?: string;
    pageType?: string;
  };
}

// Friendly category mapping with professional icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'CRITICAL':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 10H20L11 23V14H4L13 1V10Z"
            fill={cssVars.warning}
            stroke={cssVars.warning}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'HIGH':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L10.09 7.26L4.6 7.27L8.94 10.52L6.92 15.78L12 12.88L17.08 15.78L15.06 10.52L19.4 7.27L13.91 7.26L12 2Z"
            fill={cssVars.documentation}
            stroke={cssVars.documentation}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'MEDIUM':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill={cssVars.primary}
            fillOpacity="0.2"
            stroke={cssVars.primary}
            strokeWidth="2"
          />
          <path d="M12 8V12L15 15" stroke={cssVars.primary} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

const FRIENDLY_CATEGORIES = {
  CRITICAL: {
    label: 'Quick Win!',
    timeEstimate: '5-10 min fix',
    encouragement: 'This one change could transform your AI visibility!',
  },
  HIGH: {
    label: 'Big Impact',
    timeEstimate: '15-30 min',
    encouragement: 'A small effort for a huge gain!',
  },
  MEDIUM: {
    label: 'Nice Boost',
    timeEstimate: '30-60 min',
    encouragement: 'Every point counts towards excellence!',
  },
};

// Friendly pillar names and colors
const FRIENDLY_PILLARS: Record<string, { name: string; color: string; metaphor: string }> = {
  RETRIEVAL: {
    name: 'Speed & Access',
    color: cssVars.error,
    metaphor: 'Like opening doors for AI visitors',
  },
  FACT_DENSITY: {
    name: 'Rich Content',
    color: cssVars.accent,
    metaphor: 'Like adding nutrients to your content diet',
  },
  STRUCTURE: {
    name: 'Smart Organization',
    color: cssVars.primary,
    metaphor: 'Like creating a roadmap for AI to follow',
  },
  TRUST: {
    name: 'Credibility',
    color: cssVars.success,
    metaphor: 'Like building your reputation with AI',
  },
  RECENCY: {
    name: 'Freshness',
    color: cssVars.warning,
    metaphor: 'Like keeping your content garden blooming',
  },
};

// Page type icons for context
const PAGE_TYPE_ICONS: Record<string, string> = {
  homepage: '🏠',
  article: '📝',
  product: '🛍️',
  category: '📂',
  documentation: '📚',
  about: 'ℹ️',
  contact: '📧',
  search: '🔍',
  general: '📄',
};

export default function FriendlyRecommendationCard({
  metric,
  why,
  fix,
  gain,
  pillar,
  example,
  index,
  websiteProfile,
}: FriendlyRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging
  if (index === 0) {
    console.log('[FriendlyRecommendationCard] First card - websiteProfile:', websiteProfile);
  }

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
      <div
        className="card transition-all duration-300"
        style={{
          borderColor: isHovered ? friendlyPillar.color : 'transparent',
          borderWidth: '2px',
        }}
      >
        <button className="w-full p-6 text-left" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header with emoji and friendly labels */}
              <div className="mb-3 flex items-center gap-3">
                <motion.div
                  animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {getCategoryIcon(category)}
                </motion.div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: friendlyPillar.color + '20',
                    color: friendlyPillar.color,
                  }}
                >
                  {friendlyPillar.name}
                </span>

                <span className="text-muted text-xs font-medium">
                  {friendlyCategory.timeEstimate}
                </span>

                {/* Page type indicator */}
                {websiteProfile?.pageType && (
                  <span
                    className="ml-2 rounded-full px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--accent)' + '20',
                      color: 'var(--accent)',
                    }}
                    title={`For ${websiteProfile.pageType} pages`}
                  >
                    {PAGE_TYPE_ICONS[websiteProfile.pageType] || PAGE_TYPE_ICONS.general}
                    {websiteProfile.pageType}
                  </span>
                )}

                {/* Animated point gain preview */}
                <motion.div
                  className="ml-auto flex items-center gap-2"
                  animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                >
                  <span className="text-sm font-bold" style={{ color: friendlyPillar.color }}>
                    +{gain}
                  </span>
                  <span className="text-muted text-xs">points</span>
                </motion.div>
              </div>

              {/* Friendly title and description */}
              <h3 className="mb-2 text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                {friendlyTitle}
              </h3>

              <p className="text-muted mb-2 text-sm leading-relaxed">{friendlyPillar.metaphor}</p>

              {/* Why it matters - made more conversational and personalized */}
              <div className="flex items-start gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 flex-shrink-0"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                    fill={cssVars.warning}
                    fillOpacity="0.2"
                    stroke={cssVars.warning}
                    strokeWidth="2"
                  />
                  <path
                    d="M9 21H15"
                    stroke={cssVars.warning}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 18V21"
                    stroke={cssVars.warning}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {getPersonalizedWhy(why, metric, websiteProfile)}
                </p>
              </div>

              {/* Encouragement text */}
              {!isExpanded && (
                <motion.p
                  className="mt-3 text-xs font-medium"
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
                className="h-5 w-5"
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
              <div className="px-6 pt-0 pb-6" style={{ borderTop: '1px solid var(--border)' }}>
                {/* How to fix - made friendlier */}
                <div className="mt-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <span>🛠️</span>
                    <span style={{ color: 'var(--foreground)' }}>Here's how to fix it:</span>
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {fix}
                  </p>
                </div>

                {/* Visual Before/After Example */}
                {example && (
                  <div className="mt-6 space-y-4">
                    <h4
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <span>👀</span>
                      <span>See the difference:</span>
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Before */}
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="error-text text-xs font-medium">😕 Current</span>
                        </div>
                        <pre
                          className="mono overflow-x-auto rounded-lg p-4 text-xs"
                          style={{
                            background: `${cssVars.error}10`,
                            border: `1px solid ${cssVars.error}30`,
                            color: 'var(--foreground-muted)',
                          }}
                        >
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
                          <span className="success-text text-xs font-medium">😊 Optimized</span>
                        </div>
                        <pre
                          className="mono overflow-x-auto rounded-lg p-4 text-xs"
                          style={{
                            background: `${cssVars.success}10`,
                            border: `1px solid ${cssVars.success}30`,
                            color: 'var(--foreground)',
                          }}
                        >
                          <code>{example.after}</code>
                        </pre>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Motivational call-to-action section */}
                <motion.div
                  className="mt-6 rounded-lg p-4"
                  style={{ background: friendlyPillar.color + '10' }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: friendlyPillar.color }}>
                        Ready to implement?
                      </p>
                      <p className="text-muted text-xs">
                        You'll gain {gain} points with this {friendlyCategory.timeEstimate} fix
                      </p>
                    </div>
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
          className="pointer-events-none absolute inset-0"
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

function getPersonalizedWhy(
  defaultWhy: string,
  metric: string,
  profile?: { domain: string; title: string; contentType?: string }
): string {
  if (!profile) return defaultWhy;

  // Add site-specific context to certain recommendations
  const personalizations: Record<string, (profile: any) => string> = {
    ttfb: (p) => `We noticed ${p.domain} takes a bit longer to respond. ${defaultWhy}`,
    paywall: (p) =>
      `Your ${p.contentType === 'news' ? 'news articles' : 'content'} on ${p.domain} may be behind a paywall. ${defaultWhy}`,
    mainContent: (p) =>
      `${p.title} has great content, but AI needs clearer structure. ${defaultWhy}`,
    uniqueStats: (p) =>
      `${p.contentType === 'blog' ? 'Your blog posts' : 'Your pages'} could benefit from more specific data. ${defaultWhy}`,
    authorBio: (p) => `Readers of ${p.title} want to know who's behind the content. ${defaultWhy}`,
    structuredData: (p) => `Help AI understand ${p.domain}'s content better. ${defaultWhy}`,
    headingFrequency: (p) =>
      `${p.title}'s content needs more navigational signposts. ${defaultWhy}`,
  };

  const personalizer = personalizations[metric];
  return personalizer ? personalizer(profile) : defaultWhy;
}
