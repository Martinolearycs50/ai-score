'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';
import { useTier } from '@/hooks/useTier';
import { cssVars } from '@/lib/design-system/colors';

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tier } = useTier();

  // Hide navigation on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="bg-card" style={{ borderBottom: `1px solid ${cssVars.border}` }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
              <img src="/logo.png" alt="AI Search Score" className="h-10 w-auto" />
            </motion.div>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Free analyzer link - only show when not on homepage */}
            {pathname !== '/' && (
              <Link
                href="/"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: cssVars.text }}
              >
                Free Web Page Analyzer
              </Link>
            )}

            {/* Always show upgrade button for non-pro users */}
            {tier !== 'pro' && tier !== 'consultation' && (
              <Link href="/pricing">
                <Button variant="primary" size="md">
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
