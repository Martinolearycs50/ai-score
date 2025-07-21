import { render, screen } from '@testing-library/react';

import type { Recommendation } from '@/lib/types-new';

import AIRecommendationCard from './AIRecommendationCard';

describe('AIRecommendationCard Component', () => {
  const mockRecommendation: Recommendation = {
    metric: 'https',
    pillar: 'RETRIEVAL',
    why: 'HTTPS is required for AI bots to crawl your site safely',
    fix: 'Enable HTTPS by getting an SSL certificate from your hosting provider',
    gain: 10,
    example: {
      before: 'http://example.com',
      after: 'https://example.com',
    },
  };

  it('should render recommendation details', () => {
    render(<AIRecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText('Enable HTTPS')).toBeInTheDocument();
    expect(screen.getByText(/HTTPS is required/)).toBeInTheDocument();
    expect(screen.getByText(/Enable HTTPS by getting/)).toBeInTheDocument();
    expect(screen.getByText('+10 points')).toBeInTheDocument();
  });

  it('should display pillar badge with correct color', () => {
    render(<AIRecommendationCard recommendation={mockRecommendation} />);

    const badge = screen.getByText('Retrieval');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-500/10');
  });

  it('should show before/after examples when provided', () => {
    render(<AIRecommendationCard recommendation={mockRecommendation} />);

    expect(screen.getByText('Before:')).toBeInTheDocument();
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
    expect(screen.getByText('After:')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('should handle recommendations without examples', () => {
    const recommendationWithoutExample: Recommendation = {
      ...mockRecommendation,
      example: undefined,
    };

    render(<AIRecommendationCard recommendation={recommendationWithoutExample} />);

    expect(screen.queryByText('Before:')).not.toBeInTheDocument();
    expect(screen.queryByText('After:')).not.toBeInTheDocument();
  });

  it('should display correct colors for different pillars', () => {
    const pillarsAndColors = [
      { pillar: 'RETRIEVAL' as const, colorClass: 'bg-blue-500/10' },
      { pillar: 'FACT_DENSITY' as const, colorClass: 'bg-green-500/10' },
      { pillar: 'STRUCTURE' as const, colorClass: 'bg-purple-500/10' },
      { pillar: 'TRUST' as const, colorClass: 'bg-orange-500/10' },
      { pillar: 'RECENCY' as const, colorClass: 'bg-pink-500/10' },
    ];

    pillarsAndColors.forEach(({ pillar, colorClass }) => {
      const { rerender } = render(
        <AIRecommendationCard recommendation={{ ...mockRecommendation, pillar }} />
      );

      const badge = screen.getByText(
        pillar.charAt(0) + pillar.slice(1).toLowerCase().replace('_', ' ')
      );
      expect(badge).toHaveClass(colorClass);

      rerender(<></>);
    });
  });

  it('should format metric names correctly', () => {
    const testCases = [
      { metric: 'uniqueStats', expected: 'Add Unique Statistics' },
      { metric: 'dataMarkup', expected: 'Improve Data Markup' },
      { metric: 'structuredData', expected: 'Add Structured Data' },
      { metric: 'ttfb', expected: 'Improve TTFB' },
    ];

    testCases.forEach(({ metric, expected }) => {
      const { rerender } = render(
        <AIRecommendationCard recommendation={{ ...mockRecommendation, metric }} />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      rerender(<></>);
    });
  });

  it('should have proper heading hierarchy', () => {
    render(<AIRecommendationCard recommendation={mockRecommendation} />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Enable HTTPS');
  });

  it('should display sparkles icon', () => {
    render(<AIRecommendationCard recommendation={mockRecommendation} />);

    // Check for the Sparkles icon by looking for its parent element
    const iconContainer = screen.getByText('+10 points').previousElementSibling;
    expect(iconContainer).toBeInTheDocument();
  });
});
