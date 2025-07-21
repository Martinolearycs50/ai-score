import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import LoadingState from './LoadingState';

describe('LoadingState Component', () => {
  test('should render loading text', () => {
    render(<LoadingState />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();
  });
  test('should display three dots', () => {
    render(<LoadingState />);
    const dots = screen.getAllByText('•');
    expect(dots).toHaveLength(3);
  });
  test('should have animated dots', () => {
    const { container } = render(<LoadingState />);
    // Check for animation classes const animatedElements = container.querySelector('.animate-dots');
    expect(animatedElements).toBeInTheDocument();
  });
  test('should display URL when provided', () => {
    render(<LoadingState url="https://example.com" />);
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
  test('should not display URL when not provided', () => {
    render(<LoadingState />);
    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
  });
  test('should center align content', () => {
    const { container } = render(<LoadingState />);
    const centerDiv = container.querySelector('.text-center');
    expect(centerDiv).toBeInTheDocument();
  });
  test('should style dots with accent color', () => {
    const { container } = render(<LoadingState />);
    const dotsContainer = container.querySelector('[style*="color: var(--accent)"]');
    expect(dotsContainer).toBeInTheDocument();
  });
  test('should style analyzing text with foreground color', () => {
    const { container } = render(<LoadingState />);
    const analyzingText = screen.getByText('Analyzing');
    expect(analyzingText).toHaveStyle('color: var(--foreground)');
  });
});
