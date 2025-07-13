import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from './ScoreDisplay';

describe('ScoreDisplay Component', () => {
  test('should render overall score', () => {
    render(<ScoreDisplay score={85} categoryScores={{
      crawler_accessibility: 22,
      content_structure: 21,
      technical_seo: 21,
      ai_optimization: 21
    }} />);
    
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Overall Score/i)).toBeInTheDocument();
  });

  test('should render all category scores', () => {
    render(<ScoreDisplay score={80} categoryScores={{
      crawler_accessibility: 20,
      content_structure: 20,
      technical_seo: 20,
      ai_optimization: 20
    }} />);
    
    expect(screen.getByText(/Crawler Accessibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Content Structure/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical SEO/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Optimization/i)).toBeInTheDocument();
    
    // Check all scores are displayed
    const scores = screen.getAllByText('20');
    expect(scores).toHaveLength(4);
  });

  test('should apply correct color classes for high scores', () => {
    const { container } = render(<ScoreDisplay score={90} categoryScores={{
      crawler_accessibility: 23,
      content_structure: 23,
      technical_seo: 22,
      ai_optimization: 22
    }} />);
    
    // Check for green color classes (high score)
    const mainScore = container.querySelector('.text-green-400');
    expect(mainScore).toBeInTheDocument();
  });

  test('should apply correct color classes for medium scores', () => {
    const { container } = render(<ScoreDisplay score={65} categoryScores={{
      crawler_accessibility: 16,
      content_structure: 16,
      technical_seo: 17,
      ai_optimization: 16
    }} />);
    
    // Check for yellow color classes (medium score)
    const mainScore = container.querySelector('.text-yellow-400');
    expect(mainScore).toBeInTheDocument();
  });

  test('should apply correct color classes for low scores', () => {
    const { container } = render(<ScoreDisplay score={45} categoryScores={{
      crawler_accessibility: 11,
      content_structure: 11,
      technical_seo: 12,
      ai_optimization: 11
    }} />);
    
    // Check for red color classes (low score)
    const mainScore = container.querySelector('.text-red-400');
    expect(mainScore).toBeInTheDocument();
  });

  test('should display /100 suffix for overall score', () => {
    render(<ScoreDisplay score={75} categoryScores={{
      crawler_accessibility: 19,
      content_structure: 19,
      technical_seo: 19,
      ai_optimization: 18
    }} />);
    
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  test('should display /25 suffix for category scores', () => {
    render(<ScoreDisplay score={75} categoryScores={{
      crawler_accessibility: 19,
      content_structure: 19,
      technical_seo: 19,
      ai_optimization: 18
    }} />);
    
    const suffixes = screen.getAllByText('/25');
    expect(suffixes).toHaveLength(4);
  });

  test('should handle perfect scores', () => {
    render(<ScoreDisplay score={100} categoryScores={{
      crawler_accessibility: 25,
      content_structure: 25,
      technical_seo: 25,
      ai_optimization: 25
    }} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    const perfectScores = screen.getAllByText('25');
    expect(perfectScores).toHaveLength(4);
  });

  test('should handle zero scores', () => {
    render(<ScoreDisplay score={0} categoryScores={{
      crawler_accessibility: 0,
      content_structure: 0,
      technical_seo: 0,
      ai_optimization: 0
    }} />);
    
    const zeroScores = screen.getAllByText('0');
    expect(zeroScores).toHaveLength(5); // 1 overall + 4 categories
  });
});