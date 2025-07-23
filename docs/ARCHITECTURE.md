# AI Search Score - System Architecture

> Technical architecture, design decisions, and implementation patterns

## Table of Contents

- [System Overview](#system-overview)
- [API Flow](#api-flow)
- [Core Architecture Patterns](#core-architecture-patterns)
- [Scoring System](#scoring-system)
- [Performance & Scaling](#performance--scaling)
- [Security Considerations](#security-considerations)
- [Testing Architecture](#testing-architecture)

## System Overview

### Tech Stack

- **Frontend**: Next.js 15.3.5 with React 19 and TypeScript
- **Styling**: Tailwind CSS v4 with semantic design tokens
- **State Management**: React Context API (no external libraries)
- **Content Analysis**: Cheerio for HTML parsing
- **HTTP Client**: Axios with custom error handling
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (automatic via GitHub push)

### External Services

- **Cloudflare Worker**: Progressive enhancement for CORS handling
- **Chrome UX Report API**: Real-world performance data
- **Both are optional**: Core functionality works without them

## API Flow

### Request Lifecycle

```
1. User submits URL
   ↓
2. /api/analyze endpoint
   ├── URL validation (Zod schemas)
   ├── Rate limiting check (50/hour per IP)
   └── Security validation
   ↓
3. Content Fetching
   ├── Try Cloudflare Worker (if available)
   └── Fallback to direct fetch
   ↓
4. Content Extraction (Cheerio)
   ├── Remove noise (nav, footer, ads)
   ├── Extract text content
   └── Parse metadata
   ↓
5. Parallel Analysis
   ├── RETRIEVAL scoring
   ├── FACT_DENSITY scoring
   ├── STRUCTURE scoring
   ├── TRUST scoring
   └── RECENCY scoring
   ↓
6. Page Type Detection
   ├── URL pattern analysis
   ├── Schema.org detection
   └── Content pattern matching
   ↓
7. Dynamic Score Calculation
   └── Apply page-type weights
   ↓
8. Generate Recommendations
   └── Personalized by page type
   ↓
9. Return Results
```

### Key API Endpoints

- `POST /api/analyze` - Main analysis endpoint
- `POST /api/enhance-score` - Progressive enhancement with Chrome UX data
- Both return standardized response formats with error handling

## Core Architecture Patterns

### 1. Feature Flag Architecture

```typescript
// Single source of truth
tierConfig.ts → TierContext → useTier() hook → Components

// Component usage
const { features } = useTier();
if (features.showRecommendations) {
  // Render recommendations
}
```

**Benefits**:

- No prop drilling
- Easy A/B testing
- Clean component separation
- Type-safe feature checks

### 2. Modular Analysis System

```
lib/audit/
├── retrieval.ts    # Speed & accessibility
├── factDensity.ts  # Content quality
├── structure.ts    # Semantic markup
├── trust.ts        # Credibility signals
└── recency.ts      # Content freshness
```

Each module:

- Returns standardized `AuditResult` type
- Handles its own scoring logic
- Can be tested independently
- Easy to add new pillars

### 3. Progressive Enhancement Pattern

```typescript
// Core functionality first
const basicScore = calculateBasicScore(content);

// Enhance if services available
if (workerUrl) {
  const enhancedContent = await fetchViaWorker(url);
}
if (chromeUxApiKey) {
  const performanceData = await getChromeUxData(url);
}
```

### 4. Error Boundary Strategy

- Component-level error boundaries
- Graceful degradation for failed services
- User-friendly error messages
- Comprehensive logging for debugging

## Scoring System

### 5-Pillar Architecture

| Pillar       | Weight Range | Focus                                 |
| ------------ | ------------ | ------------------------------------- |
| RETRIEVAL    | 25-35%       | Page speed, robots.txt, mobile-ready  |
| FACT_DENSITY | 20-35%       | Statistics, entities, citations       |
| STRUCTURE    | 20-30%       | Headings, schema markup, FAQ sections |
| TRUST        | 10-20%       | HTTPS, author info, dates             |
| RECENCY      | 5-10%        | Updates, current references           |

### Dynamic Weight System

```typescript
// Page type determines weight distribution
const weights = {
  homepage: { retrieval: 0.35, structure: 0.25, ... },
  blog: { factDensity: 0.35, retrieval: 0.25, ... },
  product: { factDensity: 0.30, structure: 0.25, ... }
};
```

### Page Type Detection (3-Layer Approach)

1. **URL Pattern Analysis**: `/blog/`, `/products/`, etc.
2. **Schema.org Detection**: Article, Product, WebPage
3. **Content Pattern Recognition**: Blog signatures, product specs
4. **Default**: Blog type (most common)

## Performance & Scaling

### Rate Limiting

```typescript
// Current: In-memory store
const rateLimiter = new Map<string, RateLimitData>();

// Future: Redis for production
// const rateLimiter = new Redis(...);
```

### Caching Strategy

| Data Type        | TTL        | Storage |
| ---------------- | ---------- | ------- |
| Chrome UX data   | 1 hour     | Memory  |
| Robots.txt       | 24 hours   | Memory  |
| Analysis results | Not cached | -       |

### Content Limits

- **Max page size**: 2MB
- **Max word count**: 10,000
- **Fetch timeout**: 10 seconds
- **API timeout**: 30 seconds

### Optimization Techniques

- Parallel pillar analysis
- Efficient DOM traversal with Cheerio
- Minimal API payload size
- Client-side result caching

## Security Considerations

### Input Validation

- Zod schemas for all user input
- URL validation and sanitization
- Content size limits
- Request rate limiting

### Error Handling

```typescript
// Never expose internal details
catch (error) {
  console.error(error); // Log for debugging
  return { error: "Unable to analyze website" }; // Generic message
}
```

### Environment Variables

```bash
# Required
CHROME_UX_API_KEY=xxx

# Optional
NEXT_PUBLIC_WORKER_URL=xxx
RATE_LIMIT_PER_HOUR=50
```

### Security Headers

- CORS configuration in middleware
- Content Security Policy
- X-Frame-Options: DENY
- No authentication for free tier

## Testing Architecture

### Test Strategy

```
Unit Tests (70%)
├── Business logic (lib/)
├── Scoring algorithms
└── Utility functions

Integration Tests (20%)
├── API endpoints
├── External service mocks
└── Error scenarios

E2E Tests (10%)
├── Critical user flows
├── Form submissions
└── Results display
```

### Test Configuration

- **Jest**: Unit and integration tests
- **React Testing Library**: Component tests
- **Playwright**: E2E browser tests
- **Coverage target**: 80%+

### Mock Strategy

```typescript
// Consistent mocks for external services
__mocks__/
├── axios.ts       // Network requests
├── cheerio.ts     // HTML parsing
└── worker.ts      // Cloudflare Worker
```

## Future Architecture Considerations

### Planned Enhancements

1. **Redis** for production rate limiting
2. **Cloudflare Worker** deployment for enhanced CORS
3. **ML-based** page type detection
4. **Industry-specific** weight profiles
5. **Multi-page** site analysis

### Scalability Path

- Horizontal scaling via Vercel
- Database for user accounts (Pro tier)
- Queue system for batch analysis
- CDN for static assets
- Monitoring with OpenTelemetry

### Maintenance Strategy

- Automated dependency updates
- Performance monitoring
- Error tracking with Sentry
- Regular security audits
- Documentation updates with each feature
