# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.9.4] - 2025-07-18 - UI/UX Improvements with Professional Design

### Added
- **Visual Score Meter for Free Tier**
  - SVG-based circular progress indicator
  - Dynamic color coding (green/orange/red) based on score
  - Smooth animation on load
- **Professional SVG Icons**
  - Replaced emoji icons with sophisticated SVG alternatives
  - Added trophy icon for comparison winner
  - Star icon for winner announcements
  - Consistent icon design throughout
- **Enhanced Visual Design**
  - Subtle background colors (bg-gray-50/50) for better content grouping
  - Gradient backgrounds for winning sites in comparison mode
  - Improved shadow and border styling
- **Production Configuration**
  - Created vercel.json for API timeout settings

### Changed
- **Improved Content Spacing**
  - Reduced top padding from pt-24 to pt-12/pt-16 for better above-fold visibility
  - Expanded container width from max-w-4xl to max-w-6xl for desktop optimization
  - Consistent spacing system throughout (48px major, 24px minor sections)
- **Optimized Animation Timing**
  - Reduced total reveal time from 13s to 8.5s
  - Suspense: 1.5s (was 2s)
  - Reveal: 2.5s (was 4s)
  - Details: 4.5s (was 7s)
- **Refined Comparison Mode**
  - Sophisticated winner highlighting with gradient backgrounds
  - Professional trophy icons instead of crown emojis
  - Card-based layout with elegant borders
  - Better visual hierarchy for score differences

### Fixed
- Removed emoji property references that were causing TypeScript errors
- Updated all components to use consistent padding and spacing

## [2.9.3] - 2025-07-18 - Phase 1 Pro Tier Enhancements with Business Recognition

### Added
- **Business Type Detection** in ContentExtractor
  - Detects 8 business types: payment, ecommerce, blog, news, documentation, corporate, educational, other
  - Extracts competitor mentions from page content
  - Enhanced business attribute extraction (industry, target audience, products/services)
- **Business Personas System** (`businessPersonas.ts`)
  - Comprehensive profiles for each business type
  - Industry-specific narratives and characteristics
  - Tailored recommendations per business type
  - Competitor awareness for each persona
- **Narrative Engine** (`narrativeEngine.ts`)
  - 7-stage emotional journey: recognition → curiosity → revelation → concern → hope → action → celebration
  - Personalized story arcs based on business type and score
  - Dynamic messaging that adapts to user context
- **Development Server Stability**
  - Implemented nodemon for auto-restart on crashes
  - Added development server scripts and configurations
  - Created stable-dev.sh for reliable development experience
- **Error Handling Improvements**
  - Created ClientWrapper component for proper client/server separation
  - Enhanced error boundaries with better recovery options
  - Improved error.tsx with development-mode error details

### Fixed
- **Root Layout Architecture Issue**
  - Removed 'use client' from root layout (was causing hydration mismatches)
  - Created ClientWrapper component to handle client-side providers
  - Restored proper metadata export in layout.tsx
- **Pro Tier Activation**
  - Fixed "Start Free Trial" button to properly redirect to dashboard
  - Changed from alert to `router.push('/dashboard?tier=pro')`
  - Pro tier now correctly activates when navigating from pricing page
- **Navigation Crashes**
  - Fixed app crashes when clicking navigation links
  - Resolved issues with "Free Web Page Analyzer" link
  - Fixed crashes during website analysis

### Changed
- Updated package.json dev script to use nodemon by default
- Enhanced project documentation to reflect Phase 1 completion
- Improved error messages and user feedback throughout

### Developer Experience
- Much more stable development environment
- Auto-restart prevents manual server restarts
- Better error visibility for debugging
- Clear separation of client and server components

## [2.9.2] - 2025-07-18 - Pricing Page Layout Optimization

### Changed
- Compressed hero section padding for above-fold pricing visibility
- Moved trust signals below pricing cards for better flow
- Reduced overall vertical spacing throughout pricing page
- Title and text sizes optimized for professional hierarchy
- Added subtle background gradient for visual flow

### Added
- Trust badges integrated directly on Pro pricing card
- SSL encryption and money-back guarantee badges

### Fixed
- Pricing cards now visible without scrolling on standard laptop screens
- Professional Silicon Valley SaaS design aesthetic applied

## [2.9.1] - 2025-07-17 - Pro Tier Access Fixes and Diagnostics

### Fixed
- Pro tier navigation from pricing page now properly applies tier parameter
- TierContext now correctly reads URL parameters on client-side navigation
- Navigation component now hides "Upgrade to Pro" button when in Pro tier

### Added
- TierDebug component for development diagnostics
- Comprehensive tier system test suite
- Debug logging in TierContext and useTier hooks
- TierProvider moved to root layout for app-wide tier access

### Changed
- Pricing page now uses window.location.href for tier navigation
- Updated pricing content (SEO → AI search, removed false claims)

### Identified for Next Release
- Pro tier needs AI integrations (OpenAI/Anthropic) for "wow factor"
- Comparison mode should be Pro-only
- Need better visual differentiation between tiers
- Monthly usage limits need enforcement

## [2.9.0] - 2025-01-17 - Sophisticated SaaS Pricing Page

### Added
- **3-Tier Pricing Structure**
  - Free tier: $0/month, 5 analyses, basic score only
  - Pro tier: $39/month, unlimited analyses, full features
  - Consultation tier: Custom pricing, 1-on-1 expert consultancy
- **Dedicated Pricing Page** at `/pricing` route
  - PricingCard component with hover animations and "Most Popular" badge
  - FeatureComparisonTable with responsive mobile/desktop views
  - TrustSignals section (14-day money back, security badges, etc.)
  - ValuePropositions replacing testimonials (new product)
  - FAQAccordion with 10 comprehensive questions
  - Final CTA section with dual action buttons
- **Global Navigation Header**
  - Added to all pages via layout.tsx
  - Links to home and pricing pages
  - "Upgrade to Pro" CTA button
- **Consultation Tier Configuration**
  - Added to tierConfig.ts with full feature access
  - Custom pricing display in TIER_METADATA

### Changed
- Updated site metadata in layout.tsx for better SEO
- Fixed TypeScript build errors in narrativeEngine.ts
  - Changed `pillars` to `pillarScores` property
  - Updated recommendation filtering logic

### Technical Improvements
- Implemented behavioral economics principles:
  - Anchoring effect with consultation tier
  - Social proof with "Most Popular" and user count
  - Loss aversion with annual savings message
  - Risk reversal with money-back guarantee
- Smooth framer-motion animations throughout
- Fully responsive design optimized for conversions
- Clean, minimalist styling matching brand guidelines

## [2.8.0] - 2025-07-17 - AI Battle Comparison for Free Tier

### Added
- **AI Battle Comparison Mode** for free tier users
  - Fun, engaging "AI battle" theme with VS animations
  - Crown emoji (👑) for the winning website
  - Battle-themed language throughout the experience
  - 13-second emotional reveal animation sequence
  - Upgrade CTA encouraging pro tier for detailed analysis

### Changed
- Enabled `showComparisonMode: true` for free tier in tierConfig
- Modified ComparisonView to respect tier limitations:
  - Free tier: Shows only total scores and winner announcement
  - Pro tier: Includes detailed pillar breakdowns and quick wins
- Added conditional rendering based on feature flags

### Benefits
- Increases engagement for free tier users
- Creates viral sharing potential ("My site beat yours!")
- Clear upgrade path to see detailed battle analysis
- Reuses existing battle-themed components and animations

## [2.7.1] - 2025-07-17 - Tier Architecture Refactoring

### Changed
- **BREAKING**: Replaced prop-based tier system with centralized feature flag architecture
  - Components no longer accept `tier` prop
  - All tier logic centralized in `tierConfig.ts`
  - React Context (TierContext) manages tier state across application
  - URL parameter reading handled automatically by TierProvider

### Added
- **Feature Flag System**
  - `tierConfig.ts` - Single source of truth for all tier features
  - `TierContext.tsx` - React Context for tier state management
  - `useTier()` hook - Type-safe access to features throughout components
  - Comprehensive TypeScript types for all features
- **PillarScoreDisplayV2** - New component using feature flags instead of tier prop
- **TIER_MIGRATION_GUIDE.md** - Documentation for gradual component migration
- **Tier configuration tests** - 100% coverage for tier system integrity

### Refactored
- Migrated all components from `tier === 'pro'` checks to `features.showX` patterns
- Updated page.tsx to use feature flags for:
  - WebsiteProfile visibility (`features.showWebsiteProfile`)
  - Recommendations section (`features.showRecommendations`)
  - Comparison mode (`features.showComparisonMode`)
- Removed tier state management from HomeContent component
- Eliminated prop drilling of tier throughout component tree

### Fixed
- Removed unused `useEffect` import from page.tsx
- Development server CSS loading issues (missing .next directory)

### Developer Experience
- Adding new features now requires only updating `tierConfig.ts`
- Type safety ensures all tiers have consistent feature definitions
- Easier testing - mock features instead of entire tier states
- Follows Open/Closed Principle for better extensibility

## [2.7.0] - 2025-07-17 - Freemium Model Implementation

### Added
- **Freemium Model with Proper Tier Separation**
  - Created `performanceRatings.ts` with type definitions and rating converter functions
  - Added tier parameter support (`?tier=free` or `?tier=pro`) to the application
  - Free tier shows ONLY: overall score (big number), simple ratings grid, and prominent upgrade CTA
  - Free tier HIDES: WebsiteProfileCard, all recommendations, detailed pillar breakdowns, actionable insights
  - Added comprehensive tests for the rating converter

### Fixed
- Background color now correctly set to pure white (#FFFFFF) matching brand guidelines
- Fixed button styling to use correct blue primary color (#3B82F6)
- Updated card styling in free tier to match the established brand pattern
- Fixed CSS variable issues affecting the overall design consistency

### Changed
- Default tier is now 'free' (was 'pro') - users must explicitly use ?tier=pro for full analysis
- Completely redesigned free tier display to be minimal and focused on upgrade conversion
- Updated PillarScoreDisplay component to support tier-based display
- No changes to the analysis engine - purely display layer changes

## [2.5.0] - 2025-07-17 - MVP Release

### Added
- **Page Type Detection System** - Automatic identification of page types for better recommendations
  - Detects: homepage, article, product, category, documentation, about, contact, search results
  - Page-specific optimization suggestions
  - Improved recommendation relevance
- **MVP_DOCUMENTATION.md** - Comprehensive technical documentation
  - System architecture overview
  - Detailed feature descriptions
  - Technical implementation details
  - Performance metrics and testing info

### Changed
- **Content Extraction Improvements**
  - Added proper text spacing between HTML elements
  - Filters out navigation and UI element text
  - Improved title extraction to remove embedded UI text
  - Better handling of dynamically generated content
- **Scoring Algorithm Enhancements**
  - Page type awareness in scoring calculations
  - More accurate content analysis
  - Better handling of edge cases

### Fixed
- **CSS Styling Issues** - Fixed PostCSS configuration
  - Changed plugins from array to object format in postcss.config.mjs
  - Resolved Tailwind CSS v4 compatibility issues
  - Fixed styling not being applied in production
- **Content Display Bug** - Fixed concatenated text appearing during analysis
  - Removed UI element text from page titles
  - Improved text extraction with proper spacing
  - Filtered out common navigation patterns
- **Development Server Issues**
  - Fixed server startup and connection problems
  - Resolved dependency conflicts
  - Improved error handling

### Developer Experience
- Cleaned up project structure
- Updated all documentation to reflect current features
- Removed debug and test files from production
- Comprehensive commit for MVP checkpoint

## [2.4.0] - 2025-07-16

### Added
- **Content-Aware Recommendation System** - Personalized recommendations based on actual website content
  - `ContentExtractor` module for comprehensive content analysis
    - Extracts headings, paragraphs, lists, statistics, and comparisons
    - Detects business type (payment, ecommerce, blog, documentation, corporate, educational)
    - Identifies key terms, product names, and technical terminology
    - Analyzes content structure and patterns
  - `DynamicRecommendationGenerator` for personalized advice
    - Generates examples using actual content from analyzed pages
    - Tailors recommendations to detected business type
    - Creates specific before/after examples for each website
    - Personalizes recommendation language based on content
  - Business type detection for targeted optimization strategies
  - `extractedContent` field added to API response
    - Includes business type, primary topic, and content samples
    - Provides detected features and key terms
    - Shows word count and language detection
- Comprehensive error handling for universal URL support
  - Safe fallbacks for content extraction failures
  - Content size limits (100KB) to prevent memory issues
  - Null safety checks throughout the pipeline
  - Graceful degradation to static recommendations on failure

### Changed
- Recommendations now use dynamic content-aware examples instead of generic templates
- API response includes extracted content analysis for transparency
- Enhanced error messages for better debugging

### Fixed
- TypeScript compatibility issues with Set operations
  - Replaced spread operator with `Array.from()` for Set iterations
  - Fixed import paths for Next.js module resolution
  - Added default exports for all new modules
- Server stability with problematic URLs
  - Added try-catch blocks to all extraction methods
  - Limited content processing to prevent regex catastrophic backtracking
  - Added safe defaults for all extracted fields

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

[Unreleased]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Martinolearycs50/a-search-v2/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/Martinolearycs50/a-search-v2/releases/tag/v0.1.0