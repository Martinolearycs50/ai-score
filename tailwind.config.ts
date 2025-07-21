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
        // Map CSS variables to Tailwind utilities
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
      backgroundColor: {
        'design-primary': 'var(--primary)',
        'design-accent': 'var(--accent)',
        'design-background': 'var(--background)',
        'design-card': 'var(--card)',
        'design-success': 'var(--success)',
        'design-warning': 'var(--warning)',
        'design-error': 'var(--error)',
      },
      textColor: {
        'design-foreground': 'var(--foreground)',
        'design-text': 'var(--text)',
        'design-muted': 'var(--muted)',
        'design-success': 'var(--success)',
        'design-warning': 'var(--warning)',
        'design-error': 'var(--error)',
      },
      borderColor: {
        'design-border': 'var(--border)',
        'design-success': 'var(--success)',
        'design-warning': 'var(--warning)',
        'design-error': 'var(--error)',
      },
    },
  },
  plugins: [],
};

export default config;
