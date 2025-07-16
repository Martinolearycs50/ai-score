
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
│   ├── ComparisonView.tsx   # Side-by-side comparison display
│   ├── ScoreDifference.tsx  # Visual score difference indicators
│   └── PillarScoreDisplay.tsx # Score display (normal/compact)
│
├── lib/
│   ├── analyzer-new.ts      # Core AiSearchAnalyzer class
│   ├── scorer-new.ts        # 5-pillar scoring logic
│   └── types.ts             # TypeScript definitions
│
└── utils/                   # Helpers
```

### Scoring System (100 points total)
```
1. Crawler Accessibility (25 pts)
   - HTTPS, robots.txt, AI bot permissions
   
2. Content Structure (25 pts)
   - Headings, readability, FAQ detection
   
3. Technical SEO (25 pts)
   - Meta tags, schema markup, OpenGraph
   
4. AI Optimization (25 pts)
   - Freshness, credibility, structured data
```

### API Contract
```typescript
// POST /api/analyze
Request: { url: string }
Response: {
  success: boolean
  data?: {
    totalScore: number
    breakdown: { [category]: { score, details } }
    recommendations: Recommendation[]
  }
  error?: string
}
```

## 📋 Known Limitations (Update as Discovered)

| Issue | Impact | Workaround |
|-------|--------|------------|
| CORS errors | Some sites block analysis | Need proxy endpoint |
| No persistence | Results lost on refresh | Add database later |
| Rate limit | 10 req/hour per IP | In-memory only |

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

### Active TODOs
<!-- Claude Code: Update when finding/fixing -->
- [ ] Add timeout handling for slow sites
- [ ] Improve mobile responsive design
- [ ] Handle CORS errors with proxy
- [ ] Add user accounts

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