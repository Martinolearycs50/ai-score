/**
 * Performance Rating System for Free Tier Display
 * Converts numerical scores to simple ratings
 */

export type PerformanceRating = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

/**
 * Converts a numerical score to a performance rating
 * @param earned - Points earned
 * @param max - Maximum possible points
 * @returns Performance rating based on percentage
 */
export function getPerformanceRating(earned: number, max: number): PerformanceRating {
  if (max === 0) return 'Critical'; // Handle edge case

  const percentage = (earned / max) * 100;

  if (percentage >= 80) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Fair';
  if (percentage >= 20) return 'Poor';
  return 'Critical';
}

/**
 * Gets a color class name for a performance rating
 * @param rating - The performance rating
 * @returns Tailwind color class
 */
export function getRatingColor(rating: PerformanceRating): string {
  switch (rating) {
    case 'Excellent':
      return 'success-text';
    case 'Good':
      return 'accent-text';
    case 'Fair':
      return 'warning-text';
    case 'Poor':
      return 'warning-text';
    case 'Critical':
      return 'error-text';
  }
}

/**
 * Gets an emoji for a performance rating
 * @param rating - The performance rating
 * @returns Emoji representing the rating
 */
export function getRatingEmoji(rating: PerformanceRating): string {
  switch (rating) {
    case 'Excellent':
      return '🌟';
    case 'Good':
      return '✅';
    case 'Fair':
      return '📊';
    case 'Poor':
      return '⚠️';
    case 'Critical':
      return '🚨';
  }
}

/**
 * Maps pillar names to user-friendly display names for free tier
 */
export const PILLAR_DISPLAY_NAMES = {
  RETRIEVAL: 'Speed & Access',
  FACT_DENSITY: 'Information Richness',
  STRUCTURE: 'Content Organization',
  TRUST: 'Credibility',
  RECENCY: 'Freshness',
} as const;
