'use client';

import { motion } from 'framer-motion';
import type { WebsiteProfile, PageType } from '@/lib/types';

interface WebsiteProfileCardProps {
  profile: WebsiteProfile;
  score: number;
  compact?: boolean;
}

const CONTENT_TYPE_LABELS = {
  blog: { label: 'Blog', icon: '📝', color: '#3B82F6' },
  ecommerce: { label: 'E-commerce', icon: '🛒', color: '#10B981' },
  news: { label: 'News Site', icon: '📰', color: '#F59E0B' },
  corporate: { label: 'Business Site', icon: '🏢', color: '#6366F1' },
  documentation: { label: 'Documentation', icon: '📚', color: '#8B5CF6' },
  other: { label: 'Website', icon: '🌐', color: '#6B7280' },
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

export default function WebsiteProfileCard({ profile, score, compact = true }: WebsiteProfileCardProps) {
  const contentTypeInfo = CONTENT_TYPE_LABELS[profile.contentType || 'other'];
  const pageTypeInfo = PAGE_TYPE_INFO[profile.pageType || 'general'];
  
  // Compact single-line version
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-3 mb-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          {/* Small favicon/icon */}
          <div 
            className="w-8 h-8 rounded flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: contentTypeInfo.color + '20' }}
          >
            {profile.hasFavicon ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${profile.domain}&sz=32`} 
                alt=""
                className="w-6 h-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={profile.hasFavicon ? 'hidden' : ''}>
              {contentTypeInfo.icon}
            </span>
          </div>
          
          {/* Title and domain */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-xs sm:max-w-none">
                {profile.title}
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">{profile.domain}</span>
            </div>
          </div>
          
          {/* Page type badges - responsive */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span 
              className="hidden sm:inline-flex px-2 py-1 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: contentTypeInfo.color + '20',
                color: contentTypeInfo.color 
              }}
            >
              {contentTypeInfo.icon} {contentTypeInfo.label}
            </span>
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
              title={pageTypeInfo.tip}
            >
              {pageTypeInfo.icon} {pageTypeInfo.label}
            </span>
            {/* Word count - hidden on mobile */}
            {profile.wordCount && (
              <span className="hidden sm:inline text-xs text-gray-500">
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
      className="card p-6 mb-8"
      style={{
        background: 'linear-gradient(135deg, var(--card) 0%, var(--background) 100%)',
        borderColor: score >= 70 ? 'var(--accent)' : 'var(--border)',
        borderWidth: '2px',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Website Identity */}
        <div className="md:col-span-2">
          <div className="flex items-start gap-4">
            {/* Favicon or default icon */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: contentTypeInfo.color + '20' }}
            >
              {profile.hasFavicon ? (
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${profile.domain}&sz=64`} 
                  alt={`${profile.domain} favicon`}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={profile.hasFavicon ? 'hidden' : ''}>
                {contentTypeInfo.icon}
              </span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {profile.title}
              </h2>
              <p className="text-sm text-muted mb-3">{profile.domain}</p>
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
              <p className="text-xs text-muted mb-2">Key Topics:</p>
              <div className="flex flex-wrap gap-2">
                {profile.primaryTopics.map((topic, index) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-3 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: 'var(--accent)' + '20',
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
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: contentTypeInfo.color + '20',
                color: contentTypeInfo.color 
              }}
            >
              {contentTypeInfo.icon} {contentTypeInfo.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span 
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: 'var(--accent)' + '10',
                color: 'var(--accent)'
              }}
              title={pageTypeInfo.tip}
            >
              {pageTypeInfo.icon} {pageTypeInfo.label}
            </span>
          </div>
          
          {profile.language && profile.language !== 'en' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Language:</span>
              <span className="text-xs font-medium uppercase">{profile.language}</span>
            </div>
          )}
          
          {profile.wordCount && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Content:</span>
              <span className="text-xs font-medium">
                {profile.wordCount.toLocaleString()} words
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Media:</span>
            <span className="text-xs font-medium">
              {profile.hasImages ? '✓ Images' : '✗ No images'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Personalized message */}
      <motion.div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-muted mb-2">
          <strong>Page Analysis:</strong> We analyzed this {pageTypeInfo.label.toLowerCase()} specifically
        </p>
        <p className="text-sm" style={{ color: contentTypeInfo.color }}>
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
      medium: "Your blog has great potential for AI visibility. Time to optimize!",
      low: "AI engines are missing out on your valuable blog content. Let's fix that!",
    },
    ecommerce: {
      high: "Your products are well-positioned for AI shopping queries!",
      medium: "Let's help AI recommend your products more effectively.",
      low: "Your products need better AI optimization to appear in shopping searches.",
    },
    news: {
      high: "Your news content is prime for AI citation. Keep it fresh!",
      medium: "Your news site can gain more AI visibility with some tweaks.",
      low: "Breaking news: Your site needs AI optimization for better reach!",
    },
    corporate: {
      high: "Your business information is clear to AI engines. Nice work!",
      medium: "Let's ensure AI accurately represents your business.",
      low: "AI needs help understanding your business. Time to clarify!",
    },
    documentation: {
      high: "Developers using AI will love your well-structured docs!",
      medium: "Your documentation can be more AI-friendly for better discovery.",
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