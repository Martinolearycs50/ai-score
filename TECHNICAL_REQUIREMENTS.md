# Technical Requirements Document - AI Search Analyzer

## Executive Summary

The AI Search Analyzer is a production-ready web application that evaluates websites for their discoverability by AI search engines (ChatGPT, Claude, Perplexity, Gemini). It provides actionable insights through a 100-point scoring system and personalized recommendations.

**Current Version**: 2.7.1  
**Status**: Production-ready freemium MVP  
**Primary Function**: Analyze any website URL and provide an AI Search Score with optimization recommendations

## Core Functionality

### What the Application Does

1. **Accepts a website URL** from the user
2. **Fetches and analyzes** the website's content and technical properties
3. **Calculates an AI Search Score** (0-100) based on 5 key pillars
4. **Provides performance ratings** and detailed breakdowns
5. **Generates personalized recommendations** based on actual content
6. **Offers website comparison** for competitive analysis

### User Value Proposition

- **For Free Users**: Get your AI Search Score and see which areas need improvement
- **For Pro Users**: Receive detailed analysis, specific fixes, and implementation guidance
- **Time to Results**: 2-5 seconds per analysis
- **No Installation Required**: Web-based application accessible from any browser

## Current Feature Set

### 1. AI Search Score Calculation
- **Overall Score**: 0-100 point system
- **5-Pillar Analysis**:
  - RETRIEVAL (30 points) - How easily AI can access content
  - FACT_DENSITY (25 points) - Information richness
  - STRUCTURE (20 points) - Content organization
  - TRUST (15 points) - Credibility signals
  - RECENCY (10 points) - Content freshness

### 2. Freemium Model Implementation

#### Free Tier (Default)
- 5 analyses per month (not currently enforced)
- AI Search Score display
- Simple performance ratings (Excellent/Good/Fair/Poor/Critical)
- Prominent upgrade call-to-action
- Access via default URL or `?tier=free`

#### Pro Tier
- 30 analyses per month (not currently enforced)
- All free features plus:
  - Detailed score breakdowns
  - Personalized recommendations with examples
  - Time estimates for implementations
  - Website profile analysis
  - Comparison mode
  - Access via `?tier=pro`

### 3. Content Intelligence
- **Page Type Detection**: Automatically identifies homepage, article, product, documentation, etc.
- **Business Type Recognition**: Detects payment, ecommerce, blog, educational, corporate sites
- **Dynamic Recommendations**: Uses actual content from analyzed pages in examples
- **Content Extraction**: Smart parsing that filters navigation and focuses on main content

### 4. User Experience Features
- **Emotional Score Reveal**: 13-second animated experience with encouraging messages
- **Gamified Recommendations**: Quick wins (5-10 min), Big impacts (15-30 min), Nice boosts (30-60 min)
- **Website VS Mode**: Side-by-side comparison with battle animations
- **Progress Tracking**: Visual indicators and completion buttons
- **Responsive Design**: Works on all devices

## Technical Architecture

### Technology Stack

```
Frontend:
├── Next.js 15.3.5 (App Router)
├── React 19
├── TypeScript (strict mode)
├── Tailwind CSS v4
└── Framer Motion (animations)

State Management:
├── React Context (TierContext)
├── Custom Hooks (useTier)
└── Feature Flags (tierConfig.ts)

Content Analysis:
├── Cheerio (HTML parsing)
├── Custom extraction algorithms
└── Business logic in TypeScript

Testing:
├── Jest
├── React Testing Library
└── 100% coverage on core modules

Deployment:
├── Vercel (auto-deploy from GitHub)
├── Serverless functions
└── Edge middleware for rate limiting
```

### Application Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js App │────▶│ API Route       │
│             │     │  (React)     │     │ (/api/analyze)  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              ▼                              │
            ┌───────▼────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
            │ URL Validator  │  │ Content Fetcher  │  │ Content Extractor      │ │
            │                │  │ (Axios + limits) │  │ (Cheerio + parsing)    │ │
            └────────────────┘  └──────────────────┘  └────────────────────────┘ │
                                                                                  │
            ┌────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                        Analysis Pipeline                           │
├─────────────────┬─────────────────┬────────────────┬─────────────┤
│ RETRIEVAL Audit │ FACT_DENSITY    │ STRUCTURE Audit│ TRUST Audit │
│ - Speed tests   │ - Stats counter │ - Heading check│ - Author    │
│ - Access checks │ - Entity detect │ - Schema.org   │ - HTTPS     │
└─────────────────┴─────────────────┴────────────────┴─────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │    Score Calculator            │
                    │ - Weighted scoring             │
                    │ - Recommendation generation    │
                    └────────────────────────────────┘
```

### Tier System Implementation

The application uses a feature flag architecture (v2.7.1+):

#### Core Files
1. **`src/lib/tierConfig.ts`**
   - Central configuration for all tier features
   - Type-safe feature definitions
   - Single source of truth

2. **`src/contexts/TierContext.tsx`**
   - React Context managing tier state
   - Reads tier from URL parameters
   - Provides features to component tree

3. **`src/hooks/useTier.ts`**
   - Custom hook for feature access
   - Type-safe API for components
   - Example: `const { features } = useTier()`

#### Feature Configuration
```typescript
export interface TierFeatures {
  showDetailedScores: boolean;
  showRecommendations: boolean;
  showWebsiteProfile: boolean;
  showComparisonMode: boolean;
  maxAnalysesPerMonth: number;
  // ... other features
}
```

## API Specification

### POST /api/analyze

**Purpose**: Analyze a website and return AI Search Score

**Request**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "aiSearchScore": 75,
    "scoringResult": {
      "breakdown": [
        {
          "pillar": "RETRIEVAL",
          "earned": 22,
          "max": 30,
          "checks": { /* detailed check results */ }
        }
        // ... other pillars
      ],
      "recommendations": [
        {
          "metric": "Page Speed",
          "why": "Your page loads in 2.3s",
          "fix": "Optimize images and enable caching",
          "gain": 5,
          "example": "/* actual content-based example */"
        }
      ]
    },
    "websiteProfile": {
      "domain": "example.com",
      "pageType": "homepage",
      "contentType": "corporate",
      "businessType": "software"
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Unable to analyze this website"
}
```

**Rate Limiting**: 10 requests per hour per IP address

## Security Implementation

### Current Measures

1. **URL Validation**
   - Protocol check (HTTP/HTTPS only)
   - Domain validation
   - Private IP blocking
   - SSRF prevention

2. **Rate Limiting**
   - 10 requests/hour per IP
   - Implemented via middleware
   - In-memory storage (resets on deploy)

3. **Error Handling**
   - Sanitized error messages
   - No stack traces exposed
   - Generic user-facing errors

4. **Content Security**
   - 100KB content size limit
   - Timeout protection (8 seconds)
   - Safe HTML parsing with Cheerio

### Security Considerations
- No user authentication system
- No persistent data storage
- No payment processing
- All analysis is stateless
- No cookies or tracking

## Current Limitations

### Technical Limitations
1. **No User System**: No accounts, login, or personalization
2. **No Payment Processing**: Tier access via URL parameter only
3. **No Usage Tracking**: Monthly limits not enforced
4. **No Data Persistence**: Results not saved
5. **Single Page Analysis**: Cannot analyze entire websites
6. **In-Memory Rate Limiting**: Resets on deployment

### Business Limitations
1. **No Revenue Collection**: Pro tier accessible to anyone with URL
2. **No User Analytics**: Cannot track conversion or usage
3. **No Email Collection**: Cannot build user list
4. **No API Access**: Web interface only
5. **No Bulk Analysis**: One URL at a time

### Content Analysis Limitations
1. **JavaScript-Heavy Sites**: Limited support for SPA content
2. **Login-Protected Content**: Cannot analyze behind authentication
3. **Very Large Pages**: 100KB content limit
4. **Dynamic Content**: Snapshot analysis only

## Deployment Configuration

### Current Setup
- **Platform**: Vercel
- **Region**: Auto (Edge Network)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 20.x
- **Environment**: Production

### Required Environment
- Node.js 20.x or higher
- npm or yarn package manager
- No environment variables required
- No external services or APIs

## Testing Coverage

### Unit Tests
- Core modules: 100% coverage
- Scoring algorithms: Comprehensive test suite
- Content extraction: Edge case handling
- Recommendation engine: Output validation

### Integration Tests
- API endpoint testing
- Full analysis pipeline
- Error handling scenarios
- Rate limiting verification

### Test Command
```bash
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
```

## Development Setup

### Prerequisites
1. Node.js 20.x or higher
2. Git
3. Code editor (VS Code recommended)

### Quick Start
```bash
# Clone repository
git clone [repository-url]
cd ai-search-analyzer-v2

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Development Workflow
1. Make changes in `src/` directory
2. Hot reload updates automatically
3. Test at `http://localhost:3000?tier=pro` for full features
4. Run tests with `npm test`
5. Build for production with `npm run build`

## Codebase Organization

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/analyze/       # Main analysis endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── PillarScoreDisplayV2.tsx    # Tier-aware score display
│   ├── FriendlyRecommendationCard.tsx
│   └── ... (17 components total)
├── contexts/              # React contexts
│   └── TierContext.tsx    # Tier state management
├── hooks/                 # Custom React hooks
│   └── useTier.ts        # Feature access hook
├── lib/                   # Core business logic
│   ├── analyzer-new.ts    # Main analysis engine
│   ├── scorer-new.ts      # Scoring calculations
│   ├── tierConfig.ts      # Tier configuration
│   └── audit/            # Pillar-specific audits
└── utils/                 # Helper functions
```

## Summary

The AI Search Analyzer is a complete, production-ready freemium web application that provides immediate value to users wanting to optimize their websites for AI search engines. The codebase is well-structured, fully tested, and uses modern React patterns including feature flags and context for state management.

The current implementation provides a solid foundation for future enhancements such as user authentication, payment processing, and usage tracking. The modular architecture makes it straightforward to add new features or modify existing ones without disrupting the core functionality.

Key strengths:
- Clean, maintainable codebase
- Comprehensive test coverage  
- Modern tech stack
- User-friendly interface
- Valuable core functionality

Next development priorities could include:
- User authentication system
- Payment integration for pro tier
- Usage tracking and enforcement
- Email capture for marketing
- API access for developers