# Testing Documentation for AI Search Analyzer

## Overview

This document describes the testing infrastructure for the AI Search Analyzer project, including unit tests, integration tests, and E2E tests for the new AI Search scoring system.

## Testing Setup

### Dependencies
- Jest with TypeScript support (ts-jest)
- React Testing Library
- Babel for ESM module support
- Mocked dependencies (axios, cheerio)

### Configuration Files
- `jest.config.js` - Main Jest configuration
- `babel.config.js` - Babel configuration for ESM modules
- `.github/workflows/test.yml` - CI/CD pipeline configuration

## Test Structure

### 1. Unit Tests

#### Audit Modules (`src/lib/audit/__tests__/`)
- `factDensity.test.ts` - Tests for fact extraction, data markup, citations
- `structure.test.ts` - Tests for heading structure, schema markup, RSS feeds
- `trust.test.ts` - Tests for author info, NAP consistency, licenses
- `recency.test.ts` - Tests for content freshness, URL stability

#### Scoring System (`src/lib/__tests__/`)
- `scorer-new.test.ts` - Tests for pillar-based scoring calculations
- `scorer-new-simple.test.ts` - Basic scoring validation
- `analyzer-new.test.ts` - Integration tests for the analyzer
- `performanceRatings.test.ts` - Tests for free tier rating conversions

#### Freemium Model (`src/lib/__tests__/`)
- `performanceRatings.test.ts` - Tests for rating conversion logic
  - Validates percentage thresholds (80%+, 60%+, etc.)
  - Tests edge cases (0 max points)
  - Verifies color and emoji mappings

### 2. Integration Tests

The `analyzer-new.test.ts` file tests the complete analysis workflow:
- URL normalization
- Metadata extraction
- All audit modules working together
- Error handling (network errors, timeouts, invalid URLs)
- Scoring accuracy

### 3. E2E Tests

The `src/__tests__/e2e/ai-search-flow.test.ts` file tests:
- Complete user journey from URL input to results
- Well-optimized vs poorly-optimized websites
- Recommendation quality and actionability
- Edge cases and error scenarios

## Running Tests

### All Tests
```bash
npm test
```

### With Coverage
```bash
npm test -- --coverage
```

### Specific Test File
```bash
npm test -- src/lib/__tests__/scorer-new.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

## Test Coverage Goals

- **Audit Modules**: 90%+ coverage
- **Scoring Logic**: 100% coverage for critical calculations
- **Error Handling**: Comprehensive edge case coverage
- **Recommendations**: Validation of all recommendation templates

## CI/CD Integration

The GitHub Actions workflow (`test.yml`) runs:
1. Tests on Node.js 18.x and 20.x
2. Linting checks
3. Coverage reporting to Codecov
4. Build verification
5. Dedicated AI Search scoring tests

## Mocking Strategy

### Axios Mock
Located in `src/__mocks__/axios.ts`, provides:
- Configurable HTTP responses
- Error simulation
- Header customization

### Cheerio Mock
Located in `src/__mocks__/cheerio.ts`, provides:
- jQuery-like selector interface
- Basic DOM traversal methods
- Configurable element responses

## Known Issues and Limitations

1. **ESM Modules**: Some dependencies require special handling in Jest
2. **Mock Complexity**: The cheerio mock is simplified and may not cover all edge cases
3. **Performance Tests**: Currently no dedicated performance benchmarks

## Testing Freemium Tiers

### Manual Testing Checklist

#### Free Tier (`/?tier=free` or default)
- [ ] Only shows AI Search Score (large number)
- [ ] Shows simple ratings (Excellent/Good/Fair/Poor/Critical)
- [ ] Hides WebsiteProfileCard
- [ ] Hides all recommendations
- [ ] Shows prominent upgrade CTA
- [ ] No comparison mode available

#### Pro Tier (`/?tier=pro`)
- [ ] Shows everything from free tier
- [ ] Shows detailed pillar breakdowns with scores
- [ ] Shows WebsiteProfileCard
- [ ] Shows all recommendations with examples
- [ ] Comparison mode is accessible
- [ ] Time estimates are visible

### Component Testing

```typescript
// Example test for tier-based rendering
describe('PillarScoreDisplay - Tier Testing', () => {
  it('should show minimal info for free tier', () => {
    render(<PillarScoreDisplay result={mockResult} tier="free" />);
    
    expect(screen.getByText('Your AI Search Score')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Pro - $39/month')).toBeInTheDocument();
    expect(screen.queryByText(/points/)).not.toBeInTheDocument();
  });

  it('should show full details for pro tier', () => {
    render(<PillarScoreDisplay result={mockResult} tier="pro" />);
    
    expect(screen.getByText('AI Search Readiness Score')).toBeInTheDocument();
    expect(screen.getByText(/25 points/)).toBeInTheDocument();
  });
});
```

## Future Improvements

1. **Visual Regression Tests**: Add tests for UI components
2. **Performance Benchmarks**: Add tests for scoring calculation speed
3. **API Integration Tests**: Test the actual API endpoints
4. **Browser E2E Tests**: Add Playwright/Cypress for full browser testing
5. **Tier Switching Tests**: Test dynamic tier changes
6. **Upgrade Flow Tests**: Test the conversion funnel

## Validation Script

A simple validation script is available:
```bash
npx tsx test-ai-search.ts
```

This verifies the core scoring logic works correctly with perfect scores calculating to 100 points.