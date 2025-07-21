'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChartBarIcon, ChevronDownIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';
import { cssVars } from '@/lib/design-system/colors';

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
    { name: 'Analysis', href: '/dashboard', icon: ChartBarIcon },
    { name: 'AI Insights', href: '/dashboard/ai-insights', icon: SparklesIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: cssVars.background }}>
      {/* Top Navigation Bar */}
      <header
        className="bg-card sticky top-0 z-50 border-b shadow-sm"
        style={{ borderColor: cssVars.border }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Left side: Logo and Navigation */}
            <div className="flex items-center space-x-12">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3">
                <img src="/logo.png" alt="AI Search Score Pro" className="h-12 w-auto" />
                <div
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    color: 'white',
                    backgroundColor: cssVars.primary,
                  }}
                >
                  PRO
                </div>
              </Link>

              {/* Main Navigation */}
              <nav className="hidden items-center space-x-2 md:flex">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center space-x-2.5 rounded-lg px-4 py-2 text-base font-medium transition-all ${active ? 'shadow-sm' : 'hover:bg-gray-50'} `}
                      style={{
                        backgroundColor: active ? cssVars.primary : 'transparent',
                        color: active ? 'white' : cssVars.text,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: active ? 'white' : cssVars.muted }}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              {/* Usage Indicator */}
              <div className="hidden items-center space-x-3 lg:flex">
                <div className="text-sm" style={{ color: cssVars.muted }}>
                  Analyses left
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold" style={{ color: cssVars.foreground }}>
                    12
                  </span>
                  <span className="text-sm" style={{ color: cssVars.muted }}>
                    /month
                  </span>
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 rounded-xl p-2 transition-all hover:bg-gray-50"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
                    style={{ backgroundColor: cssVars.primary }}
                  >
                    <UserIcon className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    style={{ color: cssVars.muted }}
                  />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-card absolute right-0 mt-2 w-56 rounded-xl border py-2 shadow-lg"
                    style={{ borderColor: cssVars.border, color: cssVars.text }}
                  >
                    <div className="border-b px-4 py-3" style={{ borderColor: cssVars.border }}>
                      <p className="text-sm font-medium" style={{ color: cssVars.foreground }}>
                        Pro Account
                      </p>
                      <p className="text-xs" style={{ color: cssVars.muted }}>
                        manage your subscription
                      </p>
                    </div>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: cssVars.text }}
                    >
                      <UserIcon className="mr-3 h-4 w-4" style={{ color: cssVars.muted }} />
                      Profile Settings
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: cssVars.text }}
                    >
                      <svg
                        className="mr-3 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: cssVars.muted }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Billing & Plans
                    </a>
                    <hr className="my-2" />
                    <a
                      href="/"
                      className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: cssVars.text }}
                    >
                      <svg
                        className="mr-3 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: cssVars.muted }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                        />
                      </svg>
                      Back to Analyzer
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2.5 text-sm hover:bg-red-50"
                      style={{ color: cssVars.error }}
                    >
                      <svg
                        className="mr-3 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="pb-4 md:hidden">
            <nav className="flex items-center space-x-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-1 items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${active ? 'shadow-sm' : 'hover:bg-gray-50'} `}
                    style={{
                      backgroundColor: active ? cssVars.primary : 'transparent',
                      color: active ? 'white' : cssVars.text,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: active ? 'white' : cssVars.muted }} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
