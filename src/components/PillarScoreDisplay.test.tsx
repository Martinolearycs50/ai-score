import { render, screen } from '@testing-library/react';
import PillarScoreDisplay from './PillarScoreDisplay';
import type { PillarScores } from '@/lib/types';

describe('PillarScoreDisplay Component', () => {
  const mockPillarScores: PillarScores = {
    RETRIEVAL: 25,
    FACT_DENSITY: 20,
    STRUCTURE: 15,
    TRUST: 10,
    RECENCY: 5
  };

  it('should render all pillar cards', () => {
    render(<PillarScoreDisplay scores={mockPillarScores} />);
    
    expect(screen.getByText('Retrieval')).toBeInTheDocument();
    expect(screen.getByText('Fact Density')).toBeInTheDocument();
    expect(screen.getByText('Structure')).toBeInTheDocument();
    expect(screen.getByText('Trust')).toBeInTheDocument();
    expect(screen.getByText('Recency')).toBeInTheDocument();
  });

  it('should display correct scores', () => {
    render(<PillarScoreDisplay scores={mockPillarScores} />);
    
    expect(screen.getByText('25/30')).toBeInTheDocument();
    expect(screen.getByText('20/25')).toBeInTheDocument();
    expect(screen.getByText('15/20')).toBeInTheDocument();
    expect(screen.getByText('10/15')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('should display platform performance indicators', () => {
    render(<PillarScoreDisplay scores={mockPillarScores} />);
    
    // Check for platform labels
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
    expect(screen.getByText('Perplexity')).toBeInTheDocument();
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('should show optimal status for high scores', () => {
    const highScores: PillarScores = {
      RETRIEVAL: 30,
      FACT_DENSITY: 25,
      STRUCTURE: 20,
      TRUST: 15,
      RECENCY: 10
    };
    
    render(<PillarScoreDisplay scores={highScores} />);
    
    // Should show "Optimal" for perfect scores
    const optimalElements = screen.getAllByText(/Optimal/);
    expect(optimalElements.length).toBeGreaterThan(0);
  });

  it('should show needs work status for low scores', () => {
    const lowScores: PillarScores = {
      RETRIEVAL: 5,
      FACT_DENSITY: 5,
      STRUCTURE: 5,
      TRUST: 3,
      RECENCY: 2
    };
    
    render(<PillarScoreDisplay scores={lowScores} />);
    
    // Should show "Needs Work" for low scores
    const needsWorkElements = screen.getAllByText(/Needs Work/);
    expect(needsWorkElements.length).toBeGreaterThan(0);
  });

  it('should have proper accessibility attributes', () => {
    render(<PillarScoreDisplay scores={mockPillarScores} />);
    
    // Check for progress bars (role="progressbar")
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(5); // One for each pillar
    
    // Check aria-valuenow attributes
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '83'); // 25/30 * 100
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '80'); // 20/25 * 100
    expect(progressBars[2]).toHaveAttribute('aria-valuenow', '75'); // 15/20 * 100
    expect(progressBars[3]).toHaveAttribute('aria-valuenow', '67'); // 10/15 * 100
    expect(progressBars[4]).toHaveAttribute('aria-valuenow', '50'); // 5/10 * 100
  });

  it('should handle zero scores gracefully', () => {
    const zeroScores: PillarScores = {
      RETRIEVAL: 0,
      FACT_DENSITY: 0,
      STRUCTURE: 0,
      TRUST: 0,
      RECENCY: 0
    };
    
    render(<PillarScoreDisplay scores={zeroScores} />);
    
    expect(screen.getByText('0/30')).toBeInTheDocument();
    expect(screen.getByText('0/25')).toBeInTheDocument();
    expect(screen.getByText('0/20')).toBeInTheDocument();
    expect(screen.getByText('0/15')).toBeInTheDocument();
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });
});