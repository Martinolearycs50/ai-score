# Chrome UX API Integration Tests

This directory contains comprehensive tests to verify that the Chrome UX Report
API integration is working correctly and actually affecting scores.

## Test Structure

### Unit Tests

- `chromeUxReport.test.ts` - Mock-based unit tests for Chrome UX Report module
- `chromeUxReport.real-integration.test.ts` - Real API integration tests
  (requires API key)
- `scoring-impact.test.ts` - Verifies that Chrome UX data affects RETRIEVAL
  scores
- `cloudflare-worker.test.ts` - Placeholder tests for future Cloudflare Worker
- `data-source-ui.test.tsx` - UI component tests for data source indicators

### End-to-End Tests

- `e2e-integration.test.ts` - Full flow tests using Playwright

## Running Tests

### Setup

```bash
# Install dependencies (including Playwright)
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run all unit and integration tests
npm run test:all

# Run only API-related tests
npm run test:api

# Run only E2E tests
npm run test:e2e
```

### Run Specific Test Categories

```bash
# Unit tests only (with mocks)
npm test chromeUxReport.test.ts

# Real API integration tests (requires API key)
npm test chromeUxReport.real-integration.test.ts

# Score impact verification
npm test scoring-impact.test.ts

# E2E tests with UI
npm run test:e2e:ui

# E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Environment Variables

The tests require the Chrome UX API key to be set:

```bash
# In .env.local or environment
CHROME_UX_API_KEY=AIzaSyDcKAHt4Cr8RIUDx1yIFM1Cz-2IQePM2lQ
```

## What the Tests Verify

### 1. API Authentication Works

- Chrome UX Report API is called with proper authentication
- API returns real data (not mocked/dummy data)

### 2. Data Affects Scores

- RETRIEVAL scores change based on real TTFB data from Chrome UX
- Granular scoring (0-5 points) based on performance ranges:
  - < 200ms = 5 points (Excellent)
  - < 500ms = 4 points (Good)
  - < 1000ms = 2 points (Needs improvement)
  - < 2000ms = 1 point (Poor)
  - ≥ 2000ms = 0 points (Very poor)

### 3. Progressive Enhancement

- Initial results show quickly with synthetic data
- Chrome UX data enhances scores after initial display
- UI updates smoothly without blocking

### 4. Data Source Tracking

- Results include `dataSources` array showing what data was used
- Each data source has:
  - `type`: 'synthetic' or 'chrome-ux'
  - `metric`: What was measured (e.g., 'ttfb')
  - `timestamp`: When measured
  - `success`: Whether measurement succeeded
  - `details`: Specific values

### 5. Error Handling

- Graceful fallback when Chrome UX data unavailable
- Synthetic measurements used as backup
- Errors logged but don't break the app

## Viewing Test Results

### Unit Test Coverage

```bash
npm run test:coverage
```

### E2E Test Report

```bash
# After running E2E tests
npm run test:e2e:report
```

## Debugging Tests

### Enable Verbose Logging

```bash
# For unit tests
DEBUG=* npm test

# For E2E tests
PWDEBUG=1 npm run test:e2e
```

### Run Single Test

```bash
# Unit test
npm test -- -t "should fetch real Chrome UX data"

# E2E test
npx playwright test -g "Complete flow"
```

## Current Test Status

✅ **Working:**

- Chrome UX API authentication
- Real data fetching for popular domains
- Score calculation based on real TTFB
- Data source tracking in results
- Progressive enhancement flow

⚠️ **Pending Implementation:**

- Visual indicators in UI for data sources
- Cloudflare Worker deployment and tests
- More granular UI feedback during enhancement

## Adding New Tests

When adding features that use external APIs:

1. Create mock-based unit tests first
2. Add real integration tests (with skip conditions)
3. Verify score impact with comparison tests
4. Add E2E tests for complete user flow
5. Document expected behavior in test comments
