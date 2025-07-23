/**
 * Global Style Constants
 * Centralized style patterns for consistent UI across the application
 */
import { type ClassValue } from 'clsx';

/**
 * Button style patterns following our design hierarchy
 */
export const buttons = {
  // Base button styles shared by all variants
  base: 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',

  // Primary CTA - Main actions like "Analyze URL"
  primary: 'bg-brand-accent text-white hover:bg-brand-accent/90 focus:ring-brand-accent',

  // Premium/Upgrade CTAs - Deep indigo for premium features
  premium:
    'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary font-bold',

  // Secondary actions - Bordered style
  secondary:
    'bg-surface-card text-brand-primary border border-brand-primary hover:bg-surface-background focus:ring-brand-primary',

  // Success actions - "Apply Fixes", completion states
  success: 'bg-status-success text-white hover:bg-status-success/90 focus:ring-status-success',

  // Destructive actions - Delete, remove, cancel
  destructive: 'bg-status-error text-white hover:bg-status-error/90 focus:ring-status-error',

  // Ghost/Text buttons - Minimal style
  ghost: 'text-brand-accent hover:text-brand-accent/80 hover:bg-brand-accent/5 px-3 py-2',

  // Size variants
  sizes: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3', // default
    lg: 'px-8 py-4 text-lg',
  },

  // Icon button
  icon: 'p-2 rounded-lg',
} as const;

/**
 * Card style patterns
 */
export const cards = {
  // Base card style
  base: 'bg-surface-card rounded-lg border border-content-border shadow-sm',

  // Interactive card with hover state
  interactive:
    'bg-surface-card rounded-lg border border-content-border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer',

  // Status cards with left border
  status: {
    success:
      'bg-surface-card rounded-lg border border-content-border border-l-4 border-l-status-success',
    warning:
      'bg-surface-card rounded-lg border border-content-border border-l-4 border-l-status-warning',
    error:
      'bg-surface-card rounded-lg border border-content-border border-l-4 border-l-status-error',
    info: 'bg-surface-card rounded-lg border border-content-border border-l-4 border-l-brand-accent',
  },

  // Padding variants
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6', // default
    lg: 'p-8',
  },
} as const;

/**
 * Form input styles
 */
export const inputs = {
  // Base input style
  base: 'w-full px-3 py-2 bg-surface-card border border-content-border rounded-md transition-colors duration-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none',

  // Error state
  error: 'border-status-error focus:border-status-error focus:ring-status-error',

  // Success state
  success: 'border-status-success focus:border-status-success focus:ring-status-success',

  // Disabled state
  disabled: 'opacity-50 cursor-not-allowed bg-surface-background',

  // Size variants
  sizes: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2', // default
    lg: 'px-4 py-3 text-lg',
  },
} as const;

/**
 * Typography styles
 */
export const text = {
  // Headings
  h1: 'text-4xl font-bold text-content-heading',
  h2: 'text-3xl font-semibold text-content-heading',
  h3: 'text-2xl font-semibold text-content-heading',
  h4: 'text-xl font-medium text-content-heading',
  h5: 'text-lg font-medium text-content-heading',
  h6: 'text-base font-medium text-content-heading',

  // Body text
  body: 'text-content-body',
  bodyLarge: 'text-lg text-content-body',
  bodySmall: 'text-sm text-content-body',

  // Utility text
  muted: 'text-content-body/70',
  caption: 'text-sm text-content-body/60',

  // Labels
  label: 'text-content-body font-medium',

  // Links
  link: 'text-brand-accent hover:text-brand-accent/80 underline',
} as const;

/**
 * Badge/Pill styles
 */
export const badges = {
  // Base badge style
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',

  // Variants
  default: 'bg-surface-background text-content-body border border-content-border',
  primary: 'bg-brand-primary/10 text-brand-primary',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  error: 'bg-status-error/10 text-status-error',

  // Solid variants
  solid: {
    primary: 'bg-brand-primary text-white',
    success: 'bg-status-success text-white',
    warning: 'bg-status-warning text-white',
    error: 'bg-status-error text-white',
  },
} as const;

/**
 * Animation and transition styles
 */
export const animations = {
  // Fade in
  fadeIn: 'animate-in fade-in duration-300',

  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',

  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Hover transitions
  scaleOnHover: 'transition-transform hover:scale-105',
} as const;

/**
 * Layout utilities
 */
export const layout = {
  // Container
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',

  // Sections
  section: 'py-12 sm:py-16 lg:py-20',

  // Grids
  gridCols: {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },

  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',

  // Spacing
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
} as const;

/**
 * Utility function to get score-based color classes
 */
export function getScoreColorClasses(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 80) {
    return {
      text: 'text-status-success',
      bg: 'bg-status-success/10',
      border: 'border-status-success',
    };
  }
  if (score >= 60) {
    return {
      text: 'text-brand-accent',
      bg: 'bg-brand-accent/10',
      border: 'border-brand-accent',
    };
  }
  if (score >= 40) {
    return {
      text: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning',
    };
  }
  return {
    text: 'text-status-error',
    bg: 'bg-status-error/10',
    border: 'border-status-error',
  };
}

/**
 * Consolidated styles object for easy importing
 */
export const styles = {
  buttons,
  cards,
  inputs,
  text,
  badges,
  animations,
  layout,
} as const;

// Type exports for TypeScript support
export type ButtonVariant = keyof typeof buttons;
export type CardVariant = keyof typeof cards;
export type TextVariant = keyof typeof text;
export type BadgeVariant = keyof typeof badges;
