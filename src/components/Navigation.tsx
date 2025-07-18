'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTier } from '@/hooks/useTier';


export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tier } = useTier();
  
  // Hide navigation on dashboard routes
  if (pathname.startsWith('/dashboard')) {
    return null;
  }
  
  // Check if we're on a page with analysis results
  // This could be when we have URL params indicating analysis is done
  // or when we're not on the homepage
  const hasAnalysisResults = pathname !== '/' || searchParams.toString().length > 0;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img 
                src="/logo.png" 
                alt="AI Search Score" 
                className="h-10 w-auto"
              />
            </motion.div>
          </Link>

          <div className="flex items-center space-x-6">
            {/* Only show analyzer link when user has results */}
            {hasAnalysisResults && (
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Free Web Page Analyzer
              </Link>
            )}
            
            {/* Always show upgrade button for non-pro users */}
            {tier !== 'pro' && tier !== 'consultation' && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/pricing"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upgrade to Pro
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}