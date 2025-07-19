# CHANGELOG.md

All notable changes to AI Search Score will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- CLAUDE CODE: Add new entries under [Unreleased] section -->
<!-- Version format: [MAJOR.MINOR.PATCH] -->
<!-- MAJOR: Breaking changes -->
<!-- MINOR: New features -->
<!-- PATCH: Bug fixes -->

## [Unreleased]

<!-- CLAUDE CODE: Add changes here as you work. When ready to release, move to a new version section -->

### Added
- Cloudflare Worker for progressive enhancement (instant results)
- Exit intent popup to capture emails before users leave
- Share buttons for social proof (Twitter/X, LinkedIn, Facebook)
- Email capture form component with multiple variants
- Pro upgrade CTAs throughout the user journey
- Progressive enhancement flow (quick analysis → full analysis)

### Changed
- Enhanced conversion optimization with multiple touchpoints
- Improved user experience with instant preliminary results

### Fixed
- TypeScript build configuration to exclude worker files
- Website comparison feature now available for free tier (was incorrectly Pro-only)
- Upgrade CTAs now properly link to pricing page using Next.js Link
- Simplified free tier display to show only high-level results
- Removed duplicate score displays in comparison view
- Fixed tier configuration to properly hide detailed recommendations for free tier
- Restored visual pillar breakdown for free tier (progress bars with scores)

### Removed
<!-- CLAUDE CODE: Removed features -->

---

<!-- CLAUDE CODE: When releasing, create new version section above this line -->
<!-- Example format:
## [1.0.0] - 2025-01-20 - Brief Description

### Added
- Feature description
- Another feature

### Changed
- What changed

### Fixed
- Bug that was fixed
-->

## [0.1.0] - 2025-01-20 - Initial Free Tier Setup

### Added
- Basic project structure with Next.js 15
- TypeScript configuration (strict mode)
- Tailwind CSS setup
- Initial scoring system (5 pillars)
- Landing page with URL input
- API route for analysis

### Technical Setup
- Vercel deployment configuration
- GitHub repository initialization
- Development environment setup

---

<!-- CLAUDE CODE INSTRUCTIONS:

1. WHILE DEVELOPING:
   - Add all changes under [Unreleased] section
   - Use appropriate category (Added/Changed/Fixed/Removed)
   - Be specific but concise

2. WHEN RELEASING:
   - Move [Unreleased] content to new version section
   - Add version number, date, and brief description
   - Clear [Unreleased] for next development cycle

3. VERSION NUMBERING:
   - MAJOR (1.0.0): Breaking changes, major rewrites
   - MINOR (0.1.0): New features, non-breaking changes
   - PATCH (0.0.1): Bug fixes, small improvements

4. ENTRY FORMAT:
   - Start with verb (Added, Fixed, Updated, etc.)
   - One line per change
   - Group related changes
   - Technical details in sub-bullets if needed

5. EXAMPLES:
   ### Added
   - Chrome UX Report API integration for real performance data
   - Page type detection system (homepage/blog/product)
   
   ### Fixed
   - API timeout errors on slow websites
   - TypeScript build errors in production

6. DON'T:
   - Don't edit released version entries
   - Don't skip the [Unreleased] section
   - Don't use vague descriptions
-->

## Previous Releases Archive

<details>
<summary>Click to see all previous releases</summary>

<!-- CLAUDE CODE: Don't modify entries below - historical record only -->

### Legacy MVP (Before Current Rewrite)
- Previous version included Pro tier features
- Had comparison mode, emotional UI, pricing page
- Being rewritten for cleaner Free tier focus

</details>

---

**Note**: This changelog tracks the current AI Search Score project starting from the Free tier implementation. Previous MVP work is archived above for reference.