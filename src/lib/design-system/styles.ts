/**
 * Style utilities and helpers
 * Provides consistent styling patterns across the application
 */
import type { CSSProperties } from 'react';

import { cssVars } from './colors';

/**
 * Common gradient patterns
 */
export const gradients = {
  success: {
    light: `linear-gradient(135deg, ${cssVars.success}05, ${cssVars.success}10)`,
    medium: `linear-gradient(135deg, ${cssVars.success}10, ${cssVars.success}15)`,
    strong: `linear-gradient(to right, ${cssVars.success}, ${cssVars.accent})`,
  },
  primary: {
    light: `linear-gradient(135deg, ${cssVars.primary}10, ${cssVars.primary}15)`,
    medium: `linear-gradient(135deg, ${cssVars.primary}15, ${cssVars.primary}20)`,
    strong: `linear-gradient(135deg, ${cssVars.primary}, ${cssVars.accent})`,
  },
  accent: {
    light: `linear-gradient(135deg, ${cssVars.accent}10, ${cssVars.accent}15)`,
    medium: `linear-gradient(135deg, ${cssVars.accent}15, ${cssVars.accent}20)`,
    strong: `linear-gradient(to right, ${cssVars.accent}, ${cssVars.primary})`,
  },
  error: {
    light: `linear-gradient(135deg, ${cssVars.error}05, ${cssVars.error}10)`,
    medium: `linear-gradient(135deg, ${cssVars.error}10, ${cssVars.error}15)`,
  },
  warning: {
    light: `linear-gradient(135deg, ${cssVars.warning}05, ${cssVars.warning}10)`,
    medium: `linear-gradient(135deg, ${cssVars.warning}10, ${cssVars.warning}15)`,
  },
  journey: {
    light: `linear-gradient(135deg, ${cssVars.journey}05, ${cssVars.journey}10)`,
    medium: `linear-gradient(135deg, ${cssVars.journey}10, ${cssVars.journey}15)`,
  },
} as const;

/**
 * Common border styles
 */
export const borders = {
  default: `1px solid ${cssVars.border}`,
  primary: `2px solid ${cssVars.primary}`,
  accent: `2px solid ${cssVars.accent}`,
  success: `2px solid ${cssVars.success}`,
  error: `2px solid ${cssVars.error}`,
  warning: `2px solid ${cssVars.warning}`,
  // With opacity
  primaryLight: `2px solid ${cssVars.primary}40`,
  accentLight: `2px solid ${cssVars.accent}40`,
  successLight: `2px solid ${cssVars.success}40`,
  errorLight: `2px solid ${cssVars.error}40`,
  warningLight: `2px solid ${cssVars.warning}40`,
} as const;

/**
 * Common shadow styles
 */
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  hover: 'var(--shadow-hover)',
  default: 'var(--shadow-default)',
} as const;

/**
 * Spacing utilities (using CSS variables)
 */
export const spacing = {
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
  '2xl': 'var(--space-2xl)',
  '3xl': 'var(--space-3xl)',
} as const;

/**
 * Typography styles
 */
export const typography = {
  heading: {
    color: cssVars.foreground,
    fontWeight: 500,
    lineHeight: 1.2,
  },
  body: {
    color: cssVars.text,
    lineHeight: 1.6,
  },
  muted: {
    color: cssVars.muted,
  },
} as const;

/**
 * Button style presets
 */
export const buttonStyles = {
  primary: {
    backgroundColor: cssVars.accent,
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    transition: 'all var(--transition)',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,

  upgrade: {
    backgroundColor: cssVars.primary,
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    transition: 'all var(--transition)',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,

  secondary: {
    backgroundColor: cssVars.card,
    color: cssVars.text,
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    transition: 'all var(--transition)',
    border: borders.default,
    cursor: 'pointer',
  } as CSSProperties,

  ghost: {
    backgroundColor: 'transparent',
    color: cssVars.text,
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    transition: 'all var(--transition)',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
} as const;

/**
 * Card style presets
 */
export const cardStyles = {
  default: {
    backgroundColor: cssVars.card,
    borderRadius: '16px',
    boxShadow: shadows.sm,
    transition: 'all var(--transition)',
  } as CSSProperties,

  hover: {
    backgroundColor: cssVars.card,
    borderRadius: '16px',
    boxShadow: shadows.hover,
    transform: 'translateY(-2px)',
  } as CSSProperties,

  bordered: {
    backgroundColor: cssVars.card,
    borderRadius: '16px',
    border: borders.default,
    transition: 'all var(--transition)',
  } as CSSProperties,
} as const;

/**
 * Helper to combine multiple style objects
 */
export function combineStyles(...styles: (CSSProperties | undefined)[]): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Helper to create conditional styles
 */
export function conditionalStyle(
  condition: boolean,
  trueStyle: CSSProperties,
  falseStyle?: CSSProperties
): CSSProperties {
  return condition ? trueStyle : falseStyle || {};
}

/**
 * Helper to create opacity variants
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle CSS variables
  if (color.startsWith('var(')) {
    // Modern browsers support this syntax
    return `rgb(from ${color} r g b / ${opacity})`;
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
}

/**
 * Create a style object for centering content
 */
export const centerStyles = {
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  absolute: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  } as CSSProperties,

  text: {
    textAlign: 'center',
  } as CSSProperties,
} as const;

/**
 * Common transition styles
 */
export const transitions = {
  default: 'all var(--transition)',
  fast: 'all 150ms ease-out',
  slow: 'all 300ms ease-out',
  spring: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;
