# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2025-07-16

### Added
- **EmotionalResultsReveal** component for engaging score presentation
  - 4-stage animation flow: suspense → reveal → details → complete
  - Dynamic emotional themes based on score ranges
  - Particle effects for all scores to celebrate progress
  - Potential score preview showing improvement possibilities
  - Encouraging messages for all score levels
- **FriendlyRecommendationCard** replacing technical recommendation cards
  - Emoji categories: 🚀 Quick Win (5-10 min), 💎 Big Impact (15-30 min), ⭐ Nice Boost (30-60 min)
  - Time estimates for each optimization
  - Interactive hover states with score gain previews
  - "Mark Complete" buttons for gamified progress tracking
  - Friendly metaphors for each pillar
- **EmotionalComparisonReveal** for website comparison battles
  - Dual score counting animations side-by-side
  - VS battle theme with competitive messaging
  - Crown emoji (👑) celebration for winner
  - Encouraging messages based on score differences
- Enhanced **ComparisonView** with friendly messaging
  - "The AI Battle Results ⚔️" theme
  - "The Battlefield Breakdown 📊" for pillar comparison
  - Quick Wins section showing top improvements for losing site
  - Animated elements throughout

### Changed
- Extended animation timing for better readability
  - Reveal stage: 4s → 6s (more time to read messages)
  - Details stage: 3s → 5s (adequate time for encouragement)
  - Total reveal time: 9s → 13s before showing results
  - Auto-scroll delay: 10s → 14s to match new timing
- Transformed all technical language to encouraging, friendly tone
- Made low scores feel like opportunities rather than failures
- Added emojis and visual elements throughout for engagement

### Fixed
- TypeScript build error: missing `index` parameter in ComparisonView map function
- Vercel deployment now succeeds with all new components

## [2.2.0] - 2025-07-16

### Changed
- **MAJOR**: Updated scoring weights for 2025 AI search behavior
  - STRUCTURE: 20 → 30 points (now most important!)
  - FACT_DENSITY: 25 → 20 points
  - RETRIEVAL: 30 → 25 points
- Individual scoring adjustments:
  - uniqueStats: 10 → 5 points
  - ttfb: 10 → 5 points
  - htmlSize: 10 → 5 points

### Added
- 2025 AI optimization checks:
  - `listicleFormat` (10 pts) - Detects numbered titles and list content
  - `comparisonTables` (5 pts) - Checks for comparison tables
  - `semanticUrl` (5 pts) - Evaluates URL readability
  - `directAnswers` (5 pts) - Checks for immediate answers after headings
  - `llmsTxtFile` (5 pts) - Looks for AI crawler instructions
- Dynamic recommendations using actual content from analyzed pages
- Personalized before/after examples in recommendations
- UI updates highlighting STRUCTURE importance for 2025

### Research-Based
- Listicles get 32.5% of all AI citations
- Structured content dominates AI search results
- Direct answers improve AI comprehension

## [2.1.0] - 2025-07-16

### Added
- Website comparison feature for side-by-side analysis
  - Compare two websites simultaneously
  - Visual score difference indicators (green/red arrows)
  - Detailed pillar-by-pillar comparison
  - Winner/loser announcement with total score difference
  - Responsive design (side-by-side on desktop, stacked on mobile)
- New components:
  - `ComparisonView`: Handles comparison display logic
  - `ScoreDifference`: Visual indicators for score differences
- Compact mode for `PillarScoreDisplay` component
- Toggle between single analysis and comparison modes

### Fixed
- Comparison view pillar display showing array indices instead of names
- NaN values in score calculations for comparison view
- Proper pillar matching between compared websites

## [2.0.0] - 2025-07-15

### Changed
- **BREAKING**: Complete architecture overhaul from 4-category to 5-pillar AI-first scoring system
  - Old categories: Crawler Accessibility, Content Structure, Technical SEO, AI Optimization (25 points each)
  - New pillars: RETRIEVAL (30pts), FACT_DENSITY (25pts), STRUCTURE (20pts), TRUST (15pts), RECENCY (10pts)
- **BREAKING**: API response field renamed from `totalScore` to `aiSearchScore`
- **BREAKING**: Response structure now includes detailed `scoringResult` with pillar breakdowns
- Redesigned UI with cleaner, minimalist aesthetic (white/blue theme)
- Improved recommendation system with specific, actionable examples
- Enhanced error messages and user feedback

### Added
- Comprehensive test suite with 100% coverage for core modules
- AI-first scoring pillars optimized for modern AI search platforms
- Development debugging tools and logging system
- Chrome extension interference documentation
- Test utilities for API integration testing
- Detailed scoring breakdowns for each pillar
- Example-based recommendations with before/after comparisons
- Support for .company domain TLDs

### Fixed
- Local development server CSS import issues
- Chrome extension blocking fetch requests
- URL validation for non-standard TLDs (.company)
- TypeScript strict mode compliance
- SSR hydration issues for Vercel deployment
- Build errors in production environment

### Security
- Enhanced URL validation to prevent SSRF attacks
- Rate limiting implementation (10 req/hour per IP)
- Improved error sanitization

## [1.0.0] - 2025-07-01

### Added
- Initial MVP release
- 4-category scoring system (25 points each):
  - Crawler Accessibility
  - Content Structure  
  - Technical SEO
  - AI Optimization
- Basic website analysis functionality
- Simple recommendation system
- Dark theme UI with glassmorphism effects
- Vercel deployment integration

## [0.1.0] - 2025-07-01

### Added
- Initial project setup with Next.js 15
- Basic project structure
- TypeScript configuration
- Tailwind CSS integration

[Unreleased]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/Martinolearycs50/a-search-v2/releases/tag/v0.1.0