# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Search Readiness Analyzer - a Next.js 15 application that analyzes websites for optimization across AI search platforms (ChatGPT, Claude, Perplexity, Gemini). The app features a premium dark theme design with advanced animations and interactive elements.

## Core Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checking

# Testing the API endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "example.com"}'
```

## Architecture

### Analysis Engine (`src/lib/`)
- **`analyzer.ts`**: Core `WebsiteAnalyzer` class that orchestrates URL fetching, HTML parsing with Cheerio, and comprehensive analysis across 4 categories
- **`scorer.ts`**: `AnalysisScorer` class that calculates weighted scores (0-100) for each category and overall rating
- **`types.ts`**: Complete TypeScript definitions for analysis results, including 25+ interfaces covering all analysis aspects

### API Layer (`src/app/api/analyze/route.ts`)
- Single POST endpoint with rate limiting (10 requests/hour per IP)
- Comprehensive error handling with specific HTTP status codes
- Zod validation for request payloads
- Built-in caching headers (5-minute cache)

### UI Components (`src/components/`)
**Core Analysis UI:**
- `UrlForm.tsx`: Premium search input with validation and cycling placeholders
- `LoadingState.tsx`: Multi-step analysis progress with DNA helix animation
- `ScoreDisplay.tsx`: Animated score visualization with category breakdowns
- `RecommendationsList.tsx`: Actionable recommendations with priority/difficulty indicators

**Premium Design System:**
- `Icon3D.tsx`: 3D animated icons with mouse tracking and glow effects
- `DNALoader.tsx`: Canvas-based DNA helix animation for loading states
- `MagneticButton.tsx`: Buttons with magnetic cursor attraction effects
- `InteractiveBackground.tsx`: Particle system that responds to mouse movement
- `FloatingNav.tsx`: Blur-effect navigation with scroll-based active states
- `KeyboardShortcuts.tsx`: Global shortcuts (⌘+K, ⌘+H, ⌘+/) with visual indicators

### Custom Hooks (`src/hooks/`)
- `useMagneticEffect.ts`: Mouse-following magnetic attraction for UI elements
- `useParallaxScroll.ts`: Parallax scrolling effects with viewport detection
- `useScrollAnimation.ts`: Intersection Observer-based scroll-triggered animations

### Utilities (`src/utils/`)
- `validators.ts`: URL validation, robots.txt parsing, schema detection, readability scoring
- `constants.ts`: AI crawler definitions, timeouts, headers, scoring weights

## Analysis Categories

The app analyzes websites across 4 weighted categories (25 points each):

1. **Crawler Accessibility**: HTTPS, robots.txt, AI bot permissions, mobile-friendliness
2. **Content Structure**: Heading hierarchy, content metrics, FAQ detection, readability
3. **Technical SEO**: Meta tags, schema markup, Open Graph, performance metrics
4. **AI Optimization**: Content freshness, multimedia integration, credibility signals

## Design System

### Theme Architecture
- CSS custom properties in `globals.css` for consistent theming
- Premium dark theme with glassmorphism effects
- Accent colors: Cyan (#00D9FF) and Purple (#8B5CF6)
- Typography: Inter (body) and Space Grotesk (display)

### Animation System
- GPU-accelerated animations with `will-change` and `translateZ(0)`
- Magnetic cursor effects throughout the interface
- Parallax scrolling and scroll-triggered reveal animations
- Custom keyframe animations for particles, gradients, and DNA helix

### Component Patterns
- All interactive components use the magnetic effect hook
- Glass morphism styling with `backdrop-filter` blur
- Consistent animation timing with `cubic-bezier(0.23, 1, 0.32, 1)`
- Responsive design with mobile-first approach

## Development Notes

### Rate Limiting
The API implements simple in-memory rate limiting (10 requests/hour per IP). For production, consider Redis-based rate limiting.

### Error Handling
Comprehensive error mapping in the API route provides specific feedback for different failure scenarios (timeouts, 404s, network issues, etc.).

### Performance Optimizations
- Turbopack enabled for faster development builds
- Canvas-based animations for smooth 60fps performance
- Strategic use of CSS `will-change` for GPU acceleration
- 5-minute caching on API responses

### TypeScript Configuration
Strict TypeScript with comprehensive type definitions. The `types.ts` file serves as the single source of truth for all analysis-related interfaces.

### Styling Approach
Custom CSS with Tailwind 4.x, focusing on CSS custom properties for theme consistency. Animation classes are defined globally for reuse across components.