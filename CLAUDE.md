# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Technical Implementation Guide

<!-- CLAUDE CODE: This file contains HOW to build. For WHAT to build, see CLAUDE_CONTEXT.md -->

### 🚨 CRITICAL: Start Here

1. Read CLAUDE_CONTEXT.md first - it has current project state and what needs
   building
2. Review docs/STYLE_GUIDE.md for all visual design and UI decisions
3. Update CLAUDE_CONTEXT.md regularly as you work (see update instructions
   below)
4. Never modify design constants without team approval 🎨 Design System Note:
   For complete visual design specifications, animations, and voice/tone
   guidelines, see docs/STYLE_GUIDE.md

Quick Reference Colors (Updated 2025-01-20) css --primary: #2D2A7F /_ Deep
Indigo - Brand color _/ --accent: #3F8CFF /_ Electric Blue - CTAs _/
--background: #F4F6FA /_ Cool Gray - Page background _/ --foreground: #1F2937 /_
Slate - Headings _/ --text: #4B5563 /_ Gray - Body text _/ --card: #FFFFFF /_
White - Cards _/ --success: #3DDC97 /_ Mint Green _/ --warning: #F59E0B /_ Amber
_/ --error: #EF4444 /_ Red _/

Voice & Tone (Summary) ✅ Encouraging: "Room to grow! 🌱" ❌ Critical: "Poor
performance" ✅ Simple: "Your site loads quickly" ❌ Technical: "TTFB metrics
suboptimal"

See docs/STYLE_GUIDE.md for complete guidelines including:

- Full color system with CSS variables
- Button patterns and CTA colors
- Typography specifications
- Animation timings and principles
- Component patterns
- State color usage

## 🛠️ Development Workflow

### Essential Commands

```bash
# Development
npm run dev              # Primary dev server (uses nodemon with format check)
npm run dev:stable       # Alternative stable dev server
npm run dev:simple       # Direct Next.js dev without nodemon
npm run dev:pm2          # PM2-managed dev server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm test -- [pattern]    # Run specific test files (e.g., npm test -- scorer)
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:api         # Run API integration tests

# Build & Quality
npm run build           # Build for production (run before deployment)
npm run lint            # Check code quality
npm run format          # Format all files
npm run format:check    # Check formatting
npm run format:fix      # Auto-fix formatting and linting issues
npm start               # Run production server
```

### Starting Work

```bash
# 1. Read current state
cat CLAUDE_CONTEXT.md  # Understand what needs building

# 2. Create checkpoint
git add . && git commit -m "chore: checkpoint before [feature]"

# 3. Start dev server
npm run dev

# 4. Open browser
http://localhost:3000       # Free tier
http://localhost:3000?tier=pro  # Pro tier (future)

# 5. Update CLAUDE_CONTEXT.md
# - Set "Last Updated" to today
# - Update "Now Working On" section
```

### Terminal Notifications

<!-- CLAUDE CODE: Always play chime when requesting approval -->

When working on this project, play a terminal chime to alert the user when
requesting approval:

```bash
# Play chime before asking "Do you want to proceed?"
afplay /System/Library/Sounds/Glass.aiff
```

**When to play the chime:**

- Before presenting a plan in plan mode
- When asking for user approval to proceed
- When requiring user input or decision

This audio notification alerts the user that you're waiting for their response.

### While Coding

<!-- CLAUDE CODE: Follow these patterns -->

#### Component Structure

```tsx
// ✅ Good - Consistent card pattern
export default function FeatureName() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Content */}
    </div>
  );
}

// ❌ Bad - Inconsistent styling
<div className="bg-gray-50 rounded-xl shadow-lg p-4">
```

#### Button Patterns

```tsx
// Primary CTA (Electric Blue)
<button className="btn-primary">

// Upgrade CTA (Deep Indigo)
<button
  style={{ backgroundColor: 'var(--primary)' }}
  className="text-white px-6 py-3 rounded-lg">

// Secondary
<button
  className="bg-white text-gray-700 px-6 py-3 rounded-lg border"
  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>

// Text button
<button
  style={{ color: 'var(--accent)' }}
  className="hover:opacity-80 underline">
```

#### API Patterns

```typescript
// ✅ Always validate URLs
if (!isValidUrl(url)) {
  return { error: "Invalid URL" };
}

// ✅ Generic error messages
catch (error) {
  console.error(error); // Log for debugging
  return { error: "Unable to analyze website" };
}

// ✅ Rate limiting
if (rateLimiter.isLimited(ip)) {
  return { error: "Too many requests. Try again later." };
}
```

### Testing Checklist

<!-- CLAUDE CODE: Check these before marking feature complete -->

- [ ] Works at 375px width (mobile)
- [ ] No console errors
- [ ] No TypeScript errors (npm run build)
- [ ] Loading states show correctly
- [ ] Error states handled gracefully
- [ ] Free tier shows limited features (when applicable)

## 📝 Documentation Updates

<!-- CLAUDE CODE: Update these files when making changes -->

1. **CLAUDE_CONTEXT.md** - Update Throughout Session
   - **At Session Start:**
     - Update "Last Updated" date
     - Review "Current Sprint Focus"
     - Check implementation progress
   - **While Working:**
     - Check off completed features in Implementation Progress
     - Add issues to "Active Issues & Blockers" as found
     - Update "Technical Status" with API integration details
   - **After Completing Features:**
     - Add entry to "Recent Changes Log" (newest at top)
     - Update accuracy metrics if measured
     - Move resolved issues to resolved section
   - **Before Session End:**
     - Update "Current Sprint Focus" with next priorities
     - Note any blockers in "Blocked/Waiting"
     - Final check that all progress is recorded

2. **CHANGELOG.md**
   - Add changes under [Unreleased] while working
   - Follow Added/Changed/Fixed format
   - Move to versioned section when releasing

3. **README.md** - Only Update When:
   - New user-facing features added
   - Setup process changes
   - Dependencies change
   - Public API changes

## 🏗️ Code Patterns

### Architecture Overview

#### API Flow

1. User submits URL → `/api/analyze` endpoint
2. URL validation → Content extraction (via Cloudflare Worker)
3. 5-pillar analysis (RETRIEVAL, FACT_DENSITY, STRUCTURE, TRUST, RECENCY)
4. Dynamic scoring based on page type detection
5. Generate recommendations → Return results

#### Key Modules

- **lib/audit/** - 5-pillar scoring modules (retrieval.ts, factDensity.ts,
  structure.ts, trust.ts, recency.ts)
- **lib/scorer-new.ts** - Dynamic scoring system with page type weights
- **lib/analyzer-new.ts** - Main analysis orchestration (replaces
  pageAnalyzer.ts)
- **lib/contentExtractor.ts** - HTML content extraction
- **lib/chromeUxReport.ts** - Chrome UX Report API integration
- **lib/types.ts** - Core TypeScript types and interfaces
- **lib/tierConfig.ts** - Free/Pro tier configuration and constraints

### File Structure

```typescript
// 1. Imports (React first, then external, then local)
import { useState } from 'react';
import { ExternalLib } from 'external';
import { localFunction } from '@/lib/local';

// 2. Types/Interfaces
interface Props {
  value: string;
  onChange: (value: string) => void;
}

// 3. Component
export default function ComponentName({ value, onChange }: Props) {
  // 4. Hooks
  const [state, setState] = useState('');

  // 5. Handlers
  const handleClick = () => {
    // logic
  };

  // 6. Render
  return <div>{/* JSX */}</div>;
}
```

### Type Safety

```typescript
// ✅ Always use strict types
interface AnalysisResult {
  score: number;
  breakdown: Record<string, number>;
}

// ❌ Avoid any
const result: any = getData();
```

### Key Dependencies Usage

#### Validation with Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
  tier: z.enum(['free', 'pro']).optional(),
});
```

#### Content Extraction with Cheerio

```typescript
import * as cheerio from 'cheerio';

const $ = cheerio.load(html);
const title = $('title').text();
const metaDescription = $('meta[name="description"]').attr('content');
```

#### Animations with Framer Motion

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated

### Deployment Process

```bash
# Automatic via GitHub
git push origin main  # Deploys to Vercel
```

## 🐛 Common Issues & Solutions

<!-- CLAUDE CODE: Add solutions as you encounter issues -->

### Dev Server Issues

```bash
# If styles not loading
rm -rf .next && npm run dev

# If port in use
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors

```typescript
// Missing types? Add to types.ts
export interface NewType {
  // definition
}
```

### Code Formatting Protection

<!-- CLAUDE CODE: The project has comprehensive formatting protection -->

This project has multiple layers of protection against code compression:

- **Prettier**: Configured with printWidth: 80 and anti-compression rules
- **EditorConfig**: Cross-editor consistency
- **Git Hooks**: Pre-commit formatting via Husky
- **Lint-staged**: Automatic formatting on commit

If you encounter compressed code, see `docs/FORMATTING.md` for recovery
procedures.

## 📋 Quick Reference

### File Locations

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/         # API endpoints (analyze, validate-url, etc.)
│   ├── dashboard/   # Dashboard pages (future Pro tier)
│   ├── pricing/     # Pricing page
│   └── page.tsx     # Main landing page
├── components/      # React components
├── contexts/        # React contexts (TierContext)
├── hooks/          # Custom React hooks
├── lib/            # Business logic
│   ├── audit/      # 5-pillar analysis modules
│   └── ...         # Analyzers, scorers, recommendations
├── utils/          # Utility functions
└── __tests__/      # Test files

workers/            # Cloudflare Worker (separate deployment)
```

### API Integration Notes

#### Rate Limiting

- 50 requests/hour per IP (configurable in `src/utils/apiUsageVerification.ts`)
- In-memory store for development (consider Redis for production)
- Generic error messages for security

#### Cloudflare Worker

- Located in `/workers/ai-search-worker/`
- Handles cross-origin requests for content extraction
- Progressive enhancement - app works without it
- Deployment pending (see CLAUDE_CONTEXT.md)

#### Chrome UX Report API

- Progressive enhancement for Core Web Vitals
- Cached in memory for 1 hour
- Falls back gracefully if unavailable

### Environment Variables

```bash
# Required for Chrome UX Report API (optional enhancement)
CHROME_UX_API_KEY=your_api_key_here

# Optional Cloudflare Worker URL for progressive enhancement
NEXT_PUBLIC_WORKER_URL=your_worker_url_here

# Feature flags
NEXT_PUBLIC_ENABLE_DYNAMIC_SCORING=true

# Create .env.local from template
cp .env.example .env.local
```

#### Additional Configuration Options

```bash
# Rate Limiting
RATE_LIMIT_PER_HOUR=50             # Requests per hour per IP
RATE_LIMIT_WINDOW_MS=3600000       # Rate limit window (1 hour)

# Timeouts
TIMEOUT_PAGE_FETCH=10000           # Page fetch timeout (10s)
TIMEOUT_ROBOTS_TXT=3000            # Robots.txt timeout (3s)
TIMEOUT_TTFB_CHECK=5000            # TTFB check timeout (5s)

# Cache Settings
CACHE_CHROME_UX_TTL=3600000        # Chrome UX cache (1 hour)
CACHE_ROBOTS_TXT_TTL=86400000      # Robots.txt cache (24 hours)

# Content Limits
MAX_CONTENT_LENGTH=2000000         # Max content size (2MB)
MAX_WORD_COUNT=10000               # Max words to analyze
```

### Testing Strategy

```bash
# Unit Tests
npm test src/lib/scorer-new.test.ts    # Test specific file
npm test -- --testNamePattern="dynamic" # Test by pattern

# Integration Tests
npm test src/app/api                   # Test API routes
npm run test:api                       # Alternative API test command

# E2E Tests
npm run test:e2e                       # Full user flow tests
npm run test:e2e:ui                    # E2E tests with UI mode

# Coverage
npm run test:coverage                  # Generate coverage report
open coverage/lcov-report/index.html   # View coverage report
```

## Important Constraints

1. **Free Tier First**: All features start in free tier, Pro tier is future
   enhancement
2. **No Authentication**: Free tier requires no login
3. **Generic Error Messages**: Never expose technical details to users
4. **Mobile First**: Test at 375px width minimum
5. **Design System**: Follow docs/STYLE_GUIDE.md strictly for all UI decisions
6. **Rate Limiting**: 50 requests/hour per IP enforced via
   `apiUsageVerification.ts`
7. **Progressive Enhancement**: Features should work without external services
   (Cloudflare Worker, Chrome UX API)

## Recent Important Fixes

<!-- CLAUDE CODE: Learn from these resolved issues -->

1. **Compressed TypeScript Files** (2025-07-21)
   - Issue: AI assistants were compressing code into single lines
   - Solution: Comprehensive formatting protection system implemented
   - Prevention: Always use `npm run dev` which includes format checking

2. **Content Detection Rewrite** (2025-07-20)
   - Issue: Modern websites using React/Vue weren't analyzed correctly
   - Solution: Complete rewrite of content detection algorithm
   - Key Learning: Check for both SSR and CSR content patterns

3. **Wikipedia Timeouts** (2025-07-19)
   - Issue: Large Wikipedia pages caused analysis timeouts
   - Solution: Implemented content limits and optimized extraction
   - Prevention: MAX_CONTENT_LENGTH and MAX_WORD_COUNT limits

<!-- CLAUDE CODE: Add new patterns and learnings as you discover them -->

Remember: This guide is for HOW to build. Check CLAUDE_CONTEXT.md for WHAT to
build.
