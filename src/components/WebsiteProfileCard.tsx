'use client';

import { motion } from 'framer-motion';

import { contentTypeColors, cssVars, getContentTypeColor } from '@/lib/design-system/colors';
import type { PageType, WebsiteProfile } from '@/lib/types';

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  score: number;
  compact?: boolean;
}

const CONTENT_TYPE_LABELS = {
  blog: { label: 'Blog', icon: '📝' },
  ecommerce: { label: 'E-commerce', icon: '🛒' },
  news: { label: 'News Site', icon: '📰' },
  corporate: { label: 'Business Site', icon: '🏢' },
  documentation: { label: 'Documentation', icon: '📚' },
  other: { label: 'Website', icon: '🌐' },
};

const PAGE_TYPE_INFO: Record<PageType, { icon: string; label: string; tip: string }> = {
  homepage: { icon: '🏠', label: 'Homepage', tip: 'Main entry point for your site' },
  article: { icon: '📝', label: 'Article', tip: 'Content-focused page' },
  blog: { icon: '📝', label: 'Blog Post', tip: 'Blog or news content' },
  product: { icon: '🛍️', label: 'Product Page', tip: 'Individual product showcase' },
  category: { icon: '📂', label: 'Category Page', tip: 'Product or content listing' },
  about: { icon: 'ℹ️', label: 'About Page', tip: 'Company or personal information' },
  contact: { icon: '📧', label: 'Contact Page', tip: 'Contact information and forms' },
  documentation: { icon: '📚', label: 'Documentation', tip: 'Technical or help content' },
  search: { icon: '🔍', label: 'Search Results', tip: 'Search or filter results' },
  general: { icon: '📄', label: 'General Page', tip: 'Standard content page' },
};

export default function WebsiteProfileCard({
  profile,
  score,
  compact = true,
}: WebsiteProfileCardProps) {
  const contentTypeInfo = CONTENT_TYPE_LABELS[profile.contentType || 'other'];
  const pageTypeInfo = PAGE_TYPE_INFO[profile.pageType || 'general'];

  // Compact single-line version
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-default mb-4 rounded-lg border p-3 shadow-sm"
      >
        <div className="flex items-center gap-3">
          {/* Small favicon/icon */}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-lg"
            style={{ backgroundColor: `${getContentTypeColor(profile.contentType || 'other')}20` }}
          >
            {profile.hasFavicon ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${profile.domain}&sz=32`}
                alt=""
                className="h-6 w-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={profile.hasFavicon ? 'hidden' : ''}>{contentTypeInfo.icon}</span>
          </div>

          {/* Title and domain */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-foreground max-w-xs truncate text-sm font-medium sm:max-w-none sm:text-base">
                {profile.title}
              </h2>
              <span className="text-muted text-xs sm:text-sm">{profile.domain}</span>
            </div>
          </div>

          {/* Page type badges - responsive */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <span
              className="hidden rounded-full px-2 py-1 text-xs font-medium sm:inline-flex"
              style={{
                backgroundColor: `${getContentTypeColor(profile.contentType || 'other')}20`,
                color: getContentTypeColor(profile.contentType || 'other'),
              }}
            >
              {contentTypeInfo.icon} {contentTypeInfo.label}
            </span>
            <span
              className="text-body rounded-full bg-gray-100 px-2 py-1 text-xs font-medium"
              title={pageTypeInfo.tip}
            >
              {pageTypeInfo.icon} {pageTypeInfo.label}
            </span>
            {/* Word count - hidden on mobile */}
            {profile.wordCount && (
              <span className="text-muted hidden text-xs sm:inline">
                {profile.wordCount.toLocaleString()} words
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Original full version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8 p-6"
      style={{
        background: 'linear-gradient(135deg, var(--card) 0%, var(--background) 100%)',
        borderColor: score >= 70 ? 'var(--accent)' : 'var(--border)',
        borderWidth: '2px',
      }}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: Website Identity */}
        <div className="md:col-span-2">
          <div className="flex items-start gap-4">
            {/* Favicon or default icon */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
              style={{
                backgroundColor: `${getContentTypeColor(profile.contentType || 'other')}20`,
              }}
            >
              {profile.hasFavicon ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${profile.domain}&sz=64`}
                  alt={`${profile.domain} favicon`}
                  className="h-8 w-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={profile.hasFavicon ? 'hidden' : ''}>{contentTypeInfo.icon}</span>
            </div>

            <div className="flex-1">
              <h2 className="mb-1 text-2xl font-medium" style={{ color: 'var(--foreground)' }}>
                {profile.title}
              </h2>
              <p className="text-muted mb-3 text-sm">{profile.domain}</p>
              {profile.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          {/* Topics if available */}
          {profile.primaryTopics && profile.primaryTopics.length > 0 && (
            <div className="mt-4">
              <p className="text-muted mb-2 text-xs">Key Topics:</p>
              <div className="flex flex-wrap gap-2">
                {profile.primaryTopics.map((topic, index) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-full px-3 py-1 text-xs"
                    style={{
                      backgroundColor: `${cssVars.accent}20`,
                      color: 'var(--accent)',
                    }}
                  >
                    {topic}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${getContentTypeColor(profile.contentType || 'other')}20`,
                color: getContentTypeColor(profile.contentType || 'other'),
              }}
            >
              {contentTypeInfo.icon} {contentTypeInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${cssVars.accent}10`,
                color: 'var(--accent)',
              }}
              title={pageTypeInfo.tip}
            >
              {pageTypeInfo.icon} {pageTypeInfo.label}
            </span>
          </div>

          {profile.language && profile.language !== 'en' && (
            <div className="flex items-center gap-2">
              <span className="text-muted text-xs">Language:</span>
              <span className="text-xs font-medium uppercase">{profile.language}</span>
            </div>
          )}

          {profile.wordCount && (
            <div className="flex items-center gap-2">
              <span className="text-muted text-xs">Content:</span>
              <span className="text-xs font-medium">
                {profile.wordCount.toLocaleString()} words
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-muted text-xs">Media:</span>
            <span className="text-xs font-medium">
              {profile.hasImages ? '✓ Images' : '✗ No images'}
            </span>
          </div>
        </div>
      </div>

      {/* Personalized message */}
      <motion.div
        className="mt-4 border-t pt-4"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-muted mb-2 text-sm">
          <strong>Page Analysis:</strong> We analyzed this {pageTypeInfo.label.toLowerCase()}{' '}
          specifically
        </p>
        <p
          className="text-sm"
          style={{ color: getContentTypeColor(profile.contentType || 'other') }}
        >
          {getPersonalizedMessage(profile.contentType || 'other', score)}
        </p>
      </motion.div>
    </motion.div>
  );
}

function getPersonalizedMessage(contentType: string, score: number): string {
  const messages = {
    blog: {
      high: "Your blog is performing well in AI search! Let's make it even better.",
      medium: 'Your blog has great potential for AI visibility. Time to optimize!',
      low: "AI engines are missing out on your valuable blog content. Let's fix that!",
    },
    ecommerce: {
      high: 'Your products are well-positioned for AI shopping queries!',
      medium: "Let's help AI recommend your products more effectively.",
      low: 'Your products need better AI optimization to appear in shopping searches.',
    },
    news: {
      high: 'Your news content is prime for AI citation. Keep it fresh!',
      medium: 'Your news site can gain more AI visibility with some tweaks.',
      low: 'Breaking news: Your site needs AI optimization for better reach!',
    },
    corporate: {
      high: 'Your business information is clear to AI engines. Nice work!',
      medium: "Let's ensure AI accurately represents your business.",
      low: 'AI needs help understanding your business. Time to clarify!',
    },
    documentation: {
      high: 'Developers using AI will love your well-structured docs!',
      medium: 'Your documentation can be more AI-friendly for better discovery.',
      low: "Your docs are hard for AI to parse. Let's improve accessibility!",
    },
    other: {
      high: "Your site is AI-friendly! Let's polish the remaining details.",
      medium: "Your content has potential. Let's unlock it for AI engines!",
      low: "AI engines need help understanding your content. We'll guide you!",
    },
  };

  const category = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return messages[contentType as keyof typeof messages]?.[category] || messages.other[category];
}
