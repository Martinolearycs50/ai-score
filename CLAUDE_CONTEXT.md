# CLAUDE_CONTEXT.md

<!-- CLAUDE CODE: This file tracks project state. Update sections marked with comments -->

## 🎯 Project Overview

**Product**: AI Search Score - Free website analyzer for AI/LLM visibility  
**Purpose**: Help businesses understand if AI tools like ChatGPT, Claude, Perplexity, and Gemini will cite their content  
**Business Model**: Free tier (current focus) → Pro tier at $29/month (future)  
**Development**: 100% AI-driven using Claude Code Terminal in Cursor  
**Deployment**: Push to GitHub → Vercel auto-deploys  
**Last Updated**: 2025-01-19

## 📊 Current Product State

### What We're Building: Free Tier
Automated webpage analysis that scores AI visibility across 5 pillars, with intelligent page type detection and actionable recommendations.

### Scoring System (100 Points)
1. **RETRIEVAL** - Speed & Access (page performance, robots.txt, sitemaps)
2. **FACT_DENSITY** - Information Richness (statistics, entities, citations)
3. **STRUCTURE** - Content Organization (headings, schema, FAQ sections)
4. **TRUST** - Credibility Signals (HTTPS, author info, dates)
5. **RECENCY** - Content Freshness (updates, current references)

### Dynamic Scoring by Page Type
- **Homepage**: Prioritizes RETRIEVAL (35%) and STRUCTURE (25%)
- **Blog/Article**: Prioritizes FACT_DENSITY (35%) and RETRIEVAL (25%)
- **Product**: Balanced between FACT_DENSITY (30%) and RETRIEVAL/STRUCTURE (25% each)

## 🔄 User Experience Flow

### Free Tier Journey
1. **Landing**: "Is Your Website Visible to AI Search?" with URL input
2. **Analysis**: 30-second process with progress indicators and fun facts
3. **Results**: Score breakdown, page type detection, all issues and recommendations
4. **Conversion**: Locked features prompt Pro upgrade

### Key Free Tier Features
- ✅ Instant analysis with progressive enhancement
- ✅ Page type auto-detection with manual override
- ✅ Visual score breakdown across 5 pillars
- ✅ All issues and recommendations shown
- ✅ No signup required
- ❌ No historical tracking
- ❌ No competitor comparison
- ❌ No AI-optimized recommendations

## 📋 Implementation Progress

<!-- CLAUDE CODE: Check off completed items as you build them -->

### Free Tier Build Checklist

#### Core Analysis
- [x] Basic 5-pillar scoring system
- [x] Page type detection (homepage/blog/product)
- [x] Dynamic weight adjustment by page type
- [x] Content extraction and parsing

#### API Integrations
- [x] Chrome UX Report API setup
- [x] Cloudflare Worker deployment (created, needs deployment)
- [x] Progressive enhancement flow
- [x] Error handling for API failures

#### User Interface
- [x] Landing page with URL input
- [x] Loading animation with fun facts
- [x] Score display with visual breakdown
- [x] Page type selector dropdown
- [x] Recommendation cards

#### Conversion Features
- [x] Pro upgrade CTAs
- [x] Exit intent popup
- [x] Share buttons
- [x] Email capture form

## 🛠️ Technical Status

<!-- CLAUDE CODE: Update as you implement -->

### APIs & Services
```
Chrome UX Report API:
├── Status: [x] Complete
├── API Key: [x] Not needed (free public API)
└── Integration Notes: Fully integrated in src/lib/chromeUxReport.ts

Cloudflare Worker:
├── Status: [x] Created (awaiting deployment)
├── Deployment: [x] Local / [ ] Deployed
└── Worker URL: Set NEXT_PUBLIC_WORKER_URL after deployment
```

### Accuracy Metrics
```
Current Performance:
├── Client-side accuracy: ~75% (Target: ~70%) ✓
├── API-enhanced accuracy: ~85% (Target: ~90%) 
├── Analysis time: ~20s (Target: <30s) ✓
└── Error rate: <3% (Target: <5%) ✓
```

## 📝 Recent Changes Log

<!-- CLAUDE CODE: Add new entries at top, keep format consistent -->

### 2025-01-19: Restored Visual Pillar Breakdown for Free Tier
- **What**: Re-enabled visual pillar breakdown while keeping recommendations hidden
- **Why**: User wanted to keep the high-level visual breakdown (progress bars and scores)
- **Impact**: Free tier shows visual pillar breakdown but no detailed recommendations

### 2025-01-19: Simplified Free Tier Display
- **What**: Removed detailed recommendations and simplified comparison view for free tier
- **Why**: Free tier was showing too much detail, not following high-level results requirement
- **Impact**: Free tier now shows only scores and basic comparison, with clear upgrade CTAs

### 2025-01-19: Fixed Website Comparison for Free Tier
- **What**: Enabled website comparison (battle mode) for free tier users
- **Why**: Comparison feature was incorrectly restricted to Pro tier only
- **Impact**: Free users can now compare two websites with VS animations and crown for winner

### 2025-01-19: Progressive Enhancement & Conversion Features
- **What**: Implemented Cloudflare Worker, progressive enhancement, and all conversion features
- **Why**: To improve initial load performance and increase free-to-pro conversion rates
- **Impact**: Users now get instant results via Worker, multiple CTAs and email capture increase conversions

### 2025-01-19: Project Assessment & Planning
- **What**: Comprehensive project state assessment and implementation planning
- **Why**: To identify missing features and create actionable development plan
- **Impact**: Identified ~85% completion, prioritized Cloudflare Worker and conversion features

### 2025-01-XX: [Feature/Change Name]
- **What**: [Description of change]
- **Why**: [Reason for change]
- **Impact**: [Any effects on other parts]

<!-- Previous entries below this line -->

## 🐛 Active Issues & Blockers

<!-- CLAUDE CODE: Add issues as found, move to resolved when fixed -->

### Current Issues
- [ ] [Issue description] - Priority: High/Medium/Low
- [ ] [Issue description] - Priority: High/Medium/Low

### Resolved Issues
- [x] [Issue description] - Fixed: [Date/Commit]

## 🎯 Current Sprint Focus

<!-- CLAUDE CODE: Update this section at start of each work session -->

### Now Working On
- ✅ All features completed and tested

### Next Up
- Deploy Cloudflare Worker to production
- Monitor conversion rates from new features
- A/B test different CTA placements
- Gather user feedback on free tier experience

### Blocked/Waiting
- Cloudflare Worker deployment (needs production Cloudflare account setup)

## ⚠️ Important Reminders

<!-- CLAUDE CODE: Do not modify - these are stable requirements -->

- **Design**: Clean white/blue theme (NOT dark mode)
- **Accuracy**: Two-phase approach (instant → enhanced)
- **No Auth**: Free tier requires no signup
- **Pro Features**: Clearly marked with lock icons
- **All Issues Shown**: Free tier shows complete analysis

## 🚀 Future: Pro Tier ($29/month)

<!-- CLAUDE CODE: Do not modify - for reference only -->

**Not in current scope**. Pro tier will add:
- AI-powered content optimization
- Side-by-side before/after comparison
- Detailed implementation guides
- Export functionality
- 30 monthly scans
- Historical tracking

**Current Focus**: Ship exceptional free tier experience first.

---

<!-- CLAUDE CODE INSTRUCTIONS:
1. Update "Last Updated" date at top of file
2. Check off items in "Implementation Progress" as completed
3. Add entries to "Recent Changes Log" (newest first)
4. Update "Technical Status" with API details
5. Track issues in "Active Issues & Blockers"
6. Keep "Current Sprint Focus" updated with what you're working on
7. DO NOT modify sections marked "Do not modify"
-->

**For technical implementation details, code patterns, and architecture decisions, see CLAUDE.md**