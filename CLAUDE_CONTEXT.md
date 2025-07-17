
# CLAUDE_CONTEXT.md

AI assistant context for AI Search Optimizer. This file contains stable architectural information + current state tracking.

## 🎯 Project Overview

**Product**: Web app that analyzes websites for AI search optimization (ChatGPT, Claude, Perplexity, Gemini)
**Development**: 100% AI-driven using Claude Code Terminal in Cursor
**Deployment**: Push to GitHub → Vercel auto-deploys

## ⚠️ Critical Design Truth

**ACTUAL DESIGN**: Clean, minimalist white/blue theme
- Background: White (#FFFFFF)  
- Primary: Blue (#3B82F6)
- Text: Dark gray (#111827)


## 🏗️ Stable Architecture (Rarely Changes)

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: React hooks
- **Deployment**: Vercel via GitHub

### Directory Structure
```
src/
├── app/
│   ├── page.tsx              # Homepage with comparison mode
│   ├── layout.tsx            # Root layout
│   └── api/analyze/route.ts  # Analysis endpoint
│
├── components/               # UI components
│   ├── UrlForm.tsx          # URL input (single/comparison modes)
│   ├── ComparisonView.tsx   # Side-by-side comparison display (enhanced)
│   ├── ScoreDifference.tsx  # Visual score difference indicators
│   ├── PillarScoreDisplay.tsx # Score display (normal/compact)
│   ├── EmotionalResultsReveal.tsx # Animated score reveal
│   ├── EmotionalComparisonReveal.tsx # VS battle animation
│   ├── FriendlyRecommendationCard.tsx # Gamified recommendations
│   ├── ScorePotentialPreview.tsx # Score improvement preview
│   └── WebsiteProfileCard.tsx   # Displays website metadata
│
├── lib/
│   ├── analyzer-new.ts      # Core AiSearchAnalyzer class
│   ├── scorer-new.ts        # 5-pillar scoring logic
│   ├── contentExtractor.ts  # Extracts and analyzes page content
│   ├── dynamicRecommendations.ts # Generates content-aware recommendations
│   ├── recommendations.ts   # Recommendation templates and logic
│   └── types.ts             # TypeScript definitions
│
└── utils/                   # Helpers
```

### Scoring System (100 points total)
```
1. RETRIEVAL (30 pts)
   - Page speed, robots.txt, sitemaps, paywall detection
   
2. FACT_DENSITY (25 pts)
   - Statistics, entities, citations, data quality
   
3. STRUCTURE (20 pts)
   - Headings, semantic HTML, structured data
   
4. TRUST (15 pts)
   - Author info, dates, credibility signals
   
5. RECENCY (10 pts)
   - Last modified, content freshness
```

### API Contract
```typescript
// POST /api/analyze
Request: { url: string }
Response: {
  success: boolean
  data?: {
    aiSearchScore: number
    scoringResult: {
      pillars: PillarResults
      recommendations: Recommendation[]
    }
    websiteProfile?: WebsiteProfile
    extractedContent?: ExtractedContent
  }
  error?: string
}
```

## 📋 Current State (v2.5.0 - MVP Complete)

### MVP Features Completed
- ✅ 5-Pillar AI Scoring System (RETRIEVAL, FACT_DENSITY, STRUCTURE, TRUST, RECENCY)
- ✅ Dynamic content-aware recommendations
- ✅ Page type detection (8 types supported)
- ✅ Website comparison mode
- ✅ Emotional UI with animations
- ✅ Comprehensive error handling
- ✅ Full test coverage
- ✅ Production deployment on Vercel

### Known Limitations
| Issue | Impact | Workaround |
|-------|--------|------------|
| CORS errors | Some sites block analysis | Server-side fetching |
| No persistence | Results lost on refresh | MVP scope limitation |
| Rate limit | 10 req/hour per IP | In-memory only |
| Single page | Analyzes one page at a time | By design for accuracy |

## 🔧 Code Standards (Stable Patterns)

### TypeScript
```typescript
// Always use strict types
interface Props {
  value: string;  // Required
  optional?: number;  // Optional
}

// Explicit return types
function calculate(x: number): number {
  return x * 2;
}
```

### Error Handling
```typescript
try {
  // Attempt operation
} catch (error) {
  // User-friendly message
  return { 
    success: false, 
    error: "Human readable explanation" 
  };
}
```

### Git Commits
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Restructure code
```

## 📝 Current State Tracking

### Recent Changes (Claude Code: Update This!)
<!-- Add new entries at top with date -->
- 2025-07-17: MVP Release v2.5.0 - Complete AI Search Analyzer
  - Fixed content extraction with proper text spacing and UI element filtering
  - Fixed CSS styling issues (PostCSS configuration for Tailwind v4)
  - Improved title extraction to remove embedded navigation text
  - Added comprehensive MVP_DOCUMENTATION.md
  - Updated all documentation to reflect completed features
  - Cleaned up debug files and prepared for production release
- 2025-07-17: Enhanced recommendations with page-type awareness - v2.6.0
  - Added page-type context to DynamicRecommendationGenerator (prefix/suffix messages)
  - Created pageTypeRecommendations.ts with priority scores and custom messages per page type
  - Modified recommendation generation to filter irrelevant metrics by page type
  - Added page-type priority multipliers for better recommendation sorting
  - Added visual page type indicators (icons) to recommendation cards
  - Recommendations now provide contextual advice based on whether it's a homepage, article, product page, etc.
- 2025-07-17: Implemented page type detection - v2.5.0
  - Added PageType type definition (homepage, article, product, category, about, contact, documentation, search, general)
  - Created detectPageType() method in ContentExtractor with URL pattern and DOM analysis
  - Integrated page type detection through analyzer-new.ts pipeline
  - Updated WebsiteProfileCard to display page type with icons and clear messaging
  - Updated homepage text: "AI Search Score" with subtitle "Want AI tools like ChatGPT to mention your site? This shows you how."
  - Added clarification about single-page analysis throughout UI
  - Fixed CSS button positioning issue (right-4, height 40px, font-size 0.875rem)
- 2025-07-16 (evening): Implemented content-aware recommendations - v2.4.0
  - Created ContentExtractor module to analyze page content and detect business type
  - Built DynamicRecommendationGenerator for personalized recommendations
  - Recommendations now use actual content from analyzed pages (before/after examples)
  - Added comprehensive error handling for universal URL support
  - Fixed TypeScript compatibility issues with Set operations
  - Added extractedContent to API response structure
  - Successfully tested with various websites (TAP Company, Stripe, GitHub, etc.)
- 2025-07-16 (evening): Enhanced user experience with emotional results - v2.3.0
  - Added EmotionalResultsReveal component with 4-stage animation flow
  - Created FriendlyRecommendationCard with gamified experience
  - Extended timing: reveal 6s, details 5s (was too fast to read)
  - All scores now show encouraging messages and particle effects
  - Fixed TypeScript build error preventing Vercel deployment
- 2025-07-16 (evening): Enhanced comparison mode
  - Added EmotionalComparisonReveal with VS battle theme
  - Transformed ComparisonView with friendly messaging and emojis
  - Added "Quick Wins" section for improvement tips
  - Crown emoji celebration for winning site
- 2025-07-16: Implemented 2025 AI search optimization enhancements
  - Updated scoring weights: STRUCTURE now 30pts (most important!)
  - Added listicleFormat check (listicles get 32.5% of AI citations)
  - Added directAnswers, llmsTxtFile, semanticUrl checks
  - Dynamic recommendations with actual page content examples
  - Version 2.2.0 release
- 2025-07-16: Added website comparison feature
  - Compare two websites side-by-side with visual indicators
  - New ComparisonView component for detailed comparison display
  - ScoreDifference component shows score differences with arrows
  - Responsive design: side-by-side on desktop, stacked on mobile
  - Fixed pillar display issues in comparison view
- 2025-07-15: Fixed local development server setup
  - Resolved CSS import issues by switching to Next.js font optimization for Inter font
  - Added development-only debug logging to frontend and API
  - Created test tools and documentation for debugging
  - Fixed Chrome extension interference issues
- 2025-07-15: Updated scoring system to 5-pillar AI-first approach
  - New pillars: RETRIEVAL, FACT_DENSITY, STRUCTURE, TRUST, RECENCY
  - Changed from totalScore to aiSearchScore in API response
- 2024-01-XX: Initial MVP launched
- [Claude Code adds entries here when making significant changes]

### Next Phase: Freemium/Paid Version
<!-- This MVP is complete. Future development will focus on commercial features -->
- The MVP is feature-complete and production-ready
- All core functionality has been implemented and tested
- Documentation is comprehensive
- Ready for transition to freemium/paid model development

## 🚀 Working Instructions

### Starting a Session
```
"Read CLAUDE_CONTEXT.md first.
Check recent commits for latest changes.
Then let's work on [task]"
```

### When Adding Features
1. Follow existing patterns
2. Keep changes small
3. Test thoroughly
4. Update "Recent Changes" if significant
5. Update "Active TODOs" if relevant

### Important Reminders
- Design is clean/white (NOT dark)
- All development through Claude Code
- Push to main = production deploy
- Keep user language non-technical

## 🔍 Quick Exploration Commands

```bash
# See what changed recently
git log --oneline -10

# Find existing patterns
grep -r "pattern" .

# Check current dependencies
cat package.json

# Run dev server
npm run dev
```

---
**Maintenance**: Claude Code should update the "Current State Tracking" section when making significant changes. Stable architecture sections rarely need updates.

🔒 Security Requirements

Critical Security Rules

Never expose API keys or secrets in frontend code
Validate all URLs before fetching (prevent SSRF attacks)
Sanitize error messages shown to users (no stack traces)
Rate limit all API endpoints (currently 10 req/hour)
Never trust user input - always validate and sanitize
Use HTTPS only for external requests

Current Security Measures

✅ URL validation before analysis
✅ Rate limiting on /api/analyze
✅ No database = no SQL injection risk
✅ No user accounts = no auth vulnerabilities
✅ TypeScript = type safety

Security Checklist for New Features

 Input validation on all user data
 Error messages don't leak system info
 No sensitive data in client-side code
 Dependencies are up-to-date
 CORS configured properly
 XSS prevention (React handles most)

Specific Vulnerabilities to Avoid
SSRF (Server-Side Request Forgery)
typescript// BAD - allows internal network scanning
const response = await fetch(userProvidedUrl);

// GOOD - validate URL first
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Block localhost, private IPs, etc
    if (isPrivateIP(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
Information Disclosure
typescript// BAD - exposes internal errors
catch (error) {
  return { error: error.stack };  // Never do this!
}

// GOOD - generic user message
catch (error) {
  console.error(error);  // Log for debugging
  return { error: "Unable to analyze this website" };
}

CopyPublish🔒 Security Requirements
Critical Rules

Never expose API keys in frontend
Validate URLs before fetching (prevent SSRF)
Sanitize error messages (no stack traces)
Rate limit endpoints (10 req/hour)
Validate all user input
HTTPS only for external requests

Current Measures
✅ URL validation 
✅ Rate limiting 
✅ TypeScript safety
✅ No database (no SQL injection) 
✅ No auth (no auth vulnerabilities)

For New Features

Validate inputs
Generic error messages
No sensitive client-side data
Keep dependencies updated

Key Patterns
typescript// URL validation
if (!['http:', 'https:'].includes(parsed.protocol)) return false;

// Error handling
catch (error) {
  console.error(error);  // Log privately
  return { error: "Unable to analyze" };  // Generic message
}