'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTier } from '@/hooks/useTier';

export default function Navigation() {
  const pathname = usePathname();
  const { tier } = useTier();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold text-gray-900"
            >
              AI Search Analyzer
            </motion.span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className={`${
                pathname === '/' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              Analyzer
            </Link>
            <Link 
              href="/pricing"
              className={`${
                pathname === '/pricing' 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              Pricing
            </Link>
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