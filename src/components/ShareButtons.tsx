'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

interface ShareButtonsProps {
  score: number;
  url: string;
  title?: string;
}

export default function ShareButtons({ score, url, title = 'AI Search Score' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `My website scored ${score}/100 on AI Search Score! Check how visible your site is to AI tools like ChatGPT and Claude.`;
  const shareUrl = 'https://aisearchscore.com';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card border-default rounded-lg border p-6 shadow-sm"
    >
      <h3 className="mb-4 text-lg font-medium" style={{ color: 'var(--foreground)' }}>
        Share Your Score
      </h3>

      <p className="text-muted mb-6 text-sm">
        Help others improve their AI visibility by sharing your experience
      </p>

      <div className="flex flex-wrap gap-3">
        {/* Twitter/X */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-foreground flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-gray-800"
          style={{ color: 'white' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: cssVars.primary }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: cssVars.accent }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="text-body flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200"
          style={{ backgroundColor: 'var(--gray-200)' }}
        >
          {copied ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 13C10.4295 13.5741 11.0181 13.9988 11.6821 14.2154C12.346 14.4319 13.0542 14.4306 13.7173 14.2117C14.3805 13.9928 14.9674 13.5658 15.3949 12.9875C15.8225 12.4092 16.0714 11.7063 16.1069 10.9755C16.1424 10.2448 15.9628 9.52006 15.594 8.89618C15.2252 8.2723 14.6836 7.77825 14.0392 7.47476C13.3949 7.17126 12.6785 7.07189 11.9781 7.18896C11.2776 7.30602 10.625 7.63431 10.1 8.13M8.5 15.5L5 19M5 19V15M5 19H9M15.5 8.5L19 5M19 5V9M19 5H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Social proof */}
      <p className="text-muted mt-4 text-xs">
        Join 1,000+ businesses improving their AI visibility
      </p>
    </motion.div>
  );
}
