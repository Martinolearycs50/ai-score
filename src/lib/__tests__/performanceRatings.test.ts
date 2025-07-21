import { getPerformanceRating, getRatingColor, getRatingEmoji } from '../performanceRatings';

describe('performanceRatings', () => {
  describe('getPerformanceRating', () => {
    it('returns Excellent for 80% and above', () => {
      expect(getPerformanceRating(20, 25)).toBe('Excellent'); // 80%
      expect(getPerformanceRating(25, 25)).toBe('Excellent'); // 100%
      expect(getPerformanceRating(24, 30)).toBe('Excellent'); // 80%
    });

    it('returns Good for 60-79%', () => {
      expect(getPerformanceRating(15, 25)).toBe('Good'); // 60%
      expect(getPerformanceRating(19, 25)).toBe('Good'); // 76%
      expect(getPerformanceRating(18, 30)).toBe('Good'); // 60%
    });

    it('returns Fair for 40-59%', () => {
      expect(getPerformanceRating(10, 25)).toBe('Fair'); // 40%
      expect(getPerformanceRating(14, 25)).toBe('Fair'); // 56%
      expect(getPerformanceRating(12, 30)).toBe('Fair'); // 40%
    });

    it('returns Poor for 20-39%', () => {
      expect(getPerformanceRating(5, 25)).toBe('Poor'); // 20%
      expect(getPerformanceRating(9, 25)).toBe('Poor'); // 36%
      expect(getPerformanceRating(6, 30)).toBe('Poor'); // 20%
    });

    it('returns Critical for below 20%', () => {
      expect(getPerformanceRating(0, 25)).toBe('Critical'); // 0%
      expect(getPerformanceRating(4, 25)).toBe('Critical'); // 16%
      expect(getPerformanceRating(5, 30)).toBe('Critical'); // 16.67%
    });

    it('handles edge case of zero max points', () => {
      expect(getPerformanceRating(0, 0)).toBe('Critical');
      expect(getPerformanceRating(10, 0)).toBe('Critical');
    });
  });

  describe('getRatingColor', () => {
    it('returns correct Tailwind color classes', () => {
      expect(getRatingColor('Excellent')).toBe('text-green-600');
      expect(getRatingColor('Good')).toBe('text-blue-600');
      expect(getRatingColor('Fair')).toBe('text-yellow-600');
      expect(getRatingColor('Poor')).toBe('text-orange-600');
      expect(getRatingColor('Critical')).toBe('text-red-600');
    });
  });

  describe('getRatingEmoji', () => {
    it('returns correct emojis for each rating', () => {
      expect(getRatingEmoji('Excellent')).toBe('🌟');
      expect(getRatingEmoji('Good')).toBe('✅');
      expect(getRatingEmoji('Fair')).toBe('📊');
      expect(getRatingEmoji('Poor')).toBe('⚠️');
      expect(getRatingEmoji('Critical')).toBe('🚨');
    });
  });
});
