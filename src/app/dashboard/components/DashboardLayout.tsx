'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  SparklesIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    {
      name: 'Analysis',
      href: '/dashboard',
      icon: ChartBarIcon
    },
    {
      name: 'AI Insights',
      href: '/dashboard/ai-insights',
      icon: SparklesIcon
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side: Logo and Navigation */}
            <div className="flex items-center space-x-12">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold">Score Pro</span>
                  <div className="px-2.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs font-semibold">
                    PRO
                  </div>
                </div>
              </Link>

              {/* Main Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        group flex items-center space-x-2.5 px-4 py-2 rounded-lg text-base font-medium transition-all
                        ${active 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              {/* Usage Indicator */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-sm text-gray-400">Analyses left</div>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-white">12</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 text-gray-700 border border-gray-200"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Pro Account</p>
                      <p className="text-xs text-gray-500">manage your subscription</p>
                    </div>
                    <a href="#" className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Profile Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Billing & Plans
                    </a>
                    <hr className="my-2" />
                    <a href="/" className="flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                      Back to Analyzer
                    </a>
                    <a href="#" className="flex items-center px-4 py-2.5 hover:bg-red-50 text-sm text-red-600">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <nav className="flex items-center space-x-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${active 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}