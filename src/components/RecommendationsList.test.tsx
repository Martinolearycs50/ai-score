import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import RecommendationsList from './RecommendationsList';
import type { Recommendation } from '@/lib/types';

describe('RecommendationsList Component', () => {
  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      category: 'crawler_accessibility',
      priority: 'critical',
      title: 'Enable HTTPS',
      description: 'Switch to HTTPS to ensure secure connections.',
      impact_score: 8,
      difficulty: 'medium',
      estimated_time: '1-2 hours',
      platform_benefits: ['ChatGPT', 'Claude', 'Perplexity', 'Gemini']
    },
    {
      id: 'rec-2',
      category: 'content_structure',
      priority: 'high',
      title: 'Add FAQ Section',
      description: 'FAQ sections are ideal for AI platforms.',
      impact_score: 6,
      difficulty: 'easy',
      estimated_time: '30-60 minutes',
      platform_benefits: ['ChatGPT', 'Claude']
    },
    {
      id: 'rec-3',
      category: 'technical_seo',
      priority: 'medium',
      title: 'Add Meta Description',
      description: 'Meta descriptions help AI platforms understand your content.',
      impact_score: 3,
      difficulty: 'easy',
      estimated_time: '10-15 minutes',
      platform_benefits: ['Perplexity', 'Gemini']
    }
  ];

  test('should render all recommendations', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Enable HTTPS')).toBeInTheDocument();
    expect(screen.getByText('Add FAQ Section')).toBeInTheDocument();
    expect(screen.getByText('Add Meta Description')).toBeInTheDocument();
  });

  test('should display recommendation descriptions', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/Switch to HTTPS/)).toBeInTheDocument();
    expect(screen.getByText(/FAQ sections are ideal/)).toBeInTheDocument();
    expect(screen.getByText(/Meta descriptions help/)).toBeInTheDocument();
  });

  test('should display priority badges with correct styles', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // Check for priority badges
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    
    // Check for correct styling
    const criticalBadge = screen.getByText('Critical');
    expect(criticalBadge.className).toContain('bg-red-500');
  });

  test('should display impact scores', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/Impact: 8\/10/)).toBeInTheDocument();
    expect(screen.getByText(/Impact: 6\/10/)).toBeInTheDocument();
    expect(screen.getByText(/Impact: 3\/10/)).toBeInTheDocument();
  });

  test('should display difficulty levels', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    const mediumDifficulties = screen.getAllByText(/medium/i);
    const easyDifficulties = screen.getAllByText(/easy/i);
    
    expect(mediumDifficulties.length).toBeGreaterThan(0);
    expect(easyDifficulties.length).toBeGreaterThan(0);
  });

  test('should display estimated time', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('1-2 hours')).toBeInTheDocument();
    expect(screen.getByText('30-60 minutes')).toBeInTheDocument();
    expect(screen.getByText('10-15 minutes')).toBeInTheDocument();
  });

  test('should display platform benefits', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // Check for platform names
    expect(screen.getAllByText('ChatGPT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Claude').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Perplexity').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gemini').length).toBeGreaterThan(0);
  });

  test('should handle empty recommendations list', () => {
    render(<RecommendationsList recommendations={[]} />);
    
    // Should render without errors
    const container = screen.getByText(/Recommendations/);
    expect(container).toBeInTheDocument();
  });

  test('should group recommendations by category', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // Check for category headers
    expect(screen.getByText(/Crawler Accessibility/)).toBeInTheDocument();
    expect(screen.getByText(/Content Structure/)).toBeInTheDocument();
    expect(screen.getByText(/Technical SEO/)).toBeInTheDocument();
  });

  test('should display code examples when available', () => {
    const recommendationWithCode: Recommendation = {
      id: 'rec-4',
      category: 'technical_seo',
      priority: 'high',
      title: 'Add Schema Markup',
      description: 'Schema helps AI understand content.',
      impact_score: 7,
      difficulty: 'medium',
      estimated_time: '30 minutes',
      platform_benefits: ['ChatGPT'],
      code_example: '<script type="application/ld+json">{}</script>'
    };
    
    render(<RecommendationsList recommendations={[recommendationWithCode]} />);
    
    // Check for code block
    const codeElement = screen.getByText(/<script/);
    expect(codeElement).toBeInTheDocument();
  });

  test('should order recommendations by priority', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    const titles = screen.getAllByRole('heading', { level: 4 });
    const titleTexts = titles.map(t => t.textContent);
    
    // Critical should come before High, High before Medium
    const criticalIndex = titleTexts.findIndex(t => t?.includes('Enable HTTPS'));
    const highIndex = titleTexts.findIndex(t => t?.includes('Add FAQ Section'));
    const mediumIndex = titleTexts.findIndex(t => t?.includes('Add Meta Description'));
    
    expect(criticalIndex).toBeLessThan(highIndex);
    expect(highIndex).toBeLessThan(mediumIndex);
  });
});