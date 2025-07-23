import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#2D2A7F', // Deep Indigo - Logo, premium CTAs
          accent: '#3F8CFF', // Electric Blue - Primary CTAs, links
        },
        // Surface colors
        surface: {
          background: '#F4F6FA', // Cool Gray - Page background
          card: '#FFFFFF', // White - Cards, modals
        },
        // Content colors
        content: {
          heading: '#1F2937', // Slate - Headings
          body: '#4B5563', // Gray - Body text
          border: '#E5E7EB', // Light Gray - Borders
        },
        // Status colors
        status: {
          success: '#3DDC97', // Mint Green - Success states
          warning: '#F59E0B', // Amber - Warnings
          error: '#EF4444', // Red - Errors
        },
        // Legacy mappings (for gradual migration)
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        card: 'var(--card)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      // Remove redundant color mappings
    },
  },
  plugins: [],
};

export default config;
