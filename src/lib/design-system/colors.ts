/**
 * Design System Color Utilities
 * Centralized color management for consistent theming
 */

// Color definitions matching CSS variables
export const colors = {
  primary: 'var(--primary)', // Deep Indigo - Brand color
  accent: 'var(--accent)', // Electric Blue - CTAs
  background: 'var(--background)', // Cool Gray - Page background
  foreground: 'var(--foreground)', // Slate - Headings
  text: 'var(--text)', // Gray - Body text
  muted: 'var(--muted)', // Lighter gray - Secondary text
  border: 'var(--border)', // Light Gray - Borders
  card: 'var(--card)', // White - Cards
  success: 'var(--success)', // Mint Green - Success
  warning: 'var(--warning)', // Amber - Warning
  error: 'var(--error)', // Red - Error
  documentation: 'var(--documentation)', // Purple - Documentation content type
  winner: 'var(--winner)', // Dark Green - Winner emphasis
  outstanding: 'var(--outstanding)', // Emerald - Outstanding scores
  journey: 'var(--journey)', // Pink - Journey/Transform theme
} as const;

// CSS variable names
export const cssVars = {
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
  documentation: 'var(--documentation)',
  winner: 'var(--winner)',
  outstanding: 'var(--outstanding)',
  journey: 'var(--journey)',
} as const;

// Type-safe color getter
export function getCssVar(color: keyof typeof cssVars): string {
  return cssVars[color];
}

// Score-based color calculation
export function getScoreColor(score: number): string {
  if (score >= 80) return cssVars.success;
  if (score >= 60) return cssVars.accent;
  if (score >= 40) return cssVars.warning;
  return cssVars.error;
}

// Performance rating colors
export function getRatingColor(
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'
): string {
  switch (rating) {
    case 'Excellent':
      return cssVars.success;
    case 'Good':
      return cssVars.accent;
    case 'Fair':
    case 'Poor':
      return cssVars.warning;
    case 'Critical':
      return cssVars.error;
  }
}

// State-based color classes
export const stateClasses = {
  success: {
    text: 'success-text',
    bg: 'success-bg',
    border: 'success-border',
  },
  warning: {
    text: 'warning-text',
    bg: 'warning-bg',
    border: 'warning-border',
  },
  error: {
    text: 'error-text',
    bg: 'error-bg',
    border: 'error-border',
  },
  info: {
    text: 'accent-text',
    bg: 'accent-bg',
    border: 'accent-border',
  },
} as const;

// Button color schemes
export const buttonColors = {
  primary: {
    base: 'text-white',
    background: cssVars.primary,
    hover: 'hover:opacity-90',
    active: 'active:opacity-95',
  },
  accent: {
    base: 'text-white',
    background: cssVars.accent,
    hover: 'hover:opacity-90',
    active: 'active:opacity-95',
  },
  secondary: {
    base: 'bg-card',
    text: cssVars.primary,
    border: cssVars.primary,
    hover: 'hover:bg-opacity-5',
    active: 'active:bg-opacity-10',
  },
  success: {
    base: 'text-white',
    background: cssVars.success,
    hover: 'hover:opacity-90',
    active: 'active:opacity-95',
  },
  ghost: {
    base: 'bg-transparent',
    text: cssVars.text,
    hover: 'hover:bg-opacity-5',
    active: 'active:bg-opacity-10',
  },
} as const;

// Utility function to apply color with opacity
export function withOpacity(color: string, opacity: number): string {
  // If it's a CSS variable, we need to handle it differently
  if (color.startsWith('var(')) {
    return `rgb(from ${color} r g b / ${opacity})`;
  }

  // For hex colors
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Semantic color mappings for score themes
export const themeColors = {
  outstanding: cssVars.outstanding, // 80+ scores
  strong: cssVars.accent, // 60-79 scores
  journey: cssVars.warning, // 40-59 scores
  transform: cssVars.journey, // 0-39 scores
} as const;

// Content type color mappings
export const contentTypeColors = {
  blog: cssVars.accent,
  ecommerce: cssVars.success,
  news: cssVars.warning,
  corporate: cssVars.primary,
  documentation: cssVars.documentation,
  other: cssVars.muted,
} as const;

// Priority level color mappings
export const priorityColors = {
  high: cssVars.error,
  medium: cssVars.warning,
  low: cssVars.accent,
} as const;

// Get theme color by score
export function getThemeByScore(score: number): { color: string; gradient: string; label: string } {
  if (score >= 80) {
    return {
      color: themeColors.outstanding,
      gradient: `linear-gradient(135deg, ${themeColors.outstanding} 0%, ${cssVars.success} 100%)`,
      label: 'Outstanding',
    };
  }
  if (score >= 60) {
    return {
      color: themeColors.strong,
      gradient: `linear-gradient(135deg, ${themeColors.strong} 0%, ${cssVars.accent} 100%)`,
      label: 'Strong Foundation',
    };
  }
  if (score >= 40) {
    return {
      color: themeColors.journey,
      gradient: `linear-gradient(135deg, ${themeColors.journey} 0%, ${cssVars.warning} 100%)`,
      label: 'Journey Starts',
    };
  }
  return {
    color: themeColors.transform,
    gradient: `linear-gradient(135deg, ${themeColors.transform} 0%, ${cssVars.primary} 100%)`,
    label: 'Transform Your Visibility',
  };
}

// Get content type color
export function getContentTypeColor(type: string): string {
  const normalizedType = type.toLowerCase().replace(/[^a-z]/g, '');
  return (
    contentTypeColors[normalizedType as keyof typeof contentTypeColors] || contentTypeColors.other
  );
}

// Get priority color
export function getPriorityColor(priority: string): string {
  return (
    priorityColors[priority.toLowerCase() as keyof typeof priorityColors] || priorityColors.low
  );
}

// Export type definitions
export type ColorName = keyof typeof colors;
export type StateType = keyof typeof stateClasses;
export type ButtonVariant = keyof typeof buttonColors;
export type ThemeColor = keyof typeof themeColors;
export type ContentType = keyof typeof contentTypeColors;
export type Priority = keyof typeof priorityColors;
