# Style Guide Compliance Report

Generated: 2025-01-20

## Summary

The unit tests for style guide compliance have been created and reveal
significant violations across the codebase. This report summarizes the findings
and provides recommendations for remediation.

## Test Coverage

The test suite checks for:

1. ✅ Hardcoded hex colors (e.g., `#3F8CFF`)
2. ✅ Hardcoded RGB/RGBA colors (e.g., `rgba(255, 255, 255, 0.5)`)
3. ✅ Tailwind color utility classes (e.g., `bg-gray-50`, `text-blue-600`)
4. ✅ Undefined CSS variables
5. ✅ Button component patterns
6. ✅ Color string concatenation patterns

## Key Findings

### 1. Hardcoded Colors (3 files with violations)

- **AIInsightCard.tsx**: Multiple hardcoded hex colors in SVG icons
- **ImpactPredictor.tsx**: Hardcoded colors in chart configurations
- **ComparisonView.tsx**: Some remaining RGBA values for opacity effects

### 2. Tailwind Color Classes (27 files with violations)

Most common violations:

- `bg-white` → Should use `bg-card` or CSS variable
- `text-gray-*` → Should use semantic CSS variables
- `bg-gray-*` → Should use CSS variable utilities
- `text-blue-*` → Should use accent color variables

### 3. Missing CSS Variables

- `--foreground-muted` was referenced but not defined (now added)

### 4. Color Concatenation Issues

Several files use string concatenation for opacity:

```javascript
// Bad
backgroundColor: getContentTypeColor() + '20';

// Good
backgroundColor: `${getContentTypeColor()}20`;
```

## Files Requiring Updates

### High Priority (Core Components)

1. **Dashboard Components** (6 files)
   - AIInsightCard.tsx
   - ImpactPredictor.tsx
   - ScoreBreakdownChart.tsx
   - CompetitorQuickView.tsx
   - MetricCard.tsx
   - RoadmapTimeline.tsx

2. **Pricing Components** (7 files)
   - ComparisonTable.tsx
   - CTASection.tsx
   - FAQSection.tsx
   - FeatureComparison.tsx
   - PricingHero.tsx
   - TierCard.tsx
   - TrustSignals.tsx

3. **Main Components** (5 files)
   - PageTypeIndicator.tsx
   - ProUpgradeCTA.tsx
   - ScoreDifference.tsx
   - ComparisonView.tsx (partial fix needed)

### Medium Priority (Page Files)

- app/dashboard/ai-insights/page.tsx
- app/pricing/page.tsx

### Low Priority (Utility Files)

- lib/design-system/colors.ts (button style definitions)

## Recommended Actions

### 1. Immediate Actions

- ✅ Created comprehensive test suite for style guide compliance
- ✅ Added missing CSS variables to globals.css
- ✅ Updated utility classes in globals.css
- ✅ Fixed ComparisonView.tsx, EmailCaptureForm.tsx, and WebsiteProfileCard.tsx

### 2. Next Steps

1. **Update Dashboard Components**
   - Replace all hardcoded colors with CSS variables
   - Update Tailwind classes to use semantic CSS utilities

2. **Update Pricing Components**
   - Convert all `bg-white` to `bg-card`
   - Replace `text-gray-*` with appropriate CSS variables

3. **Create Migration Script**
   - Automate common replacements
   - Generate report of manual fixes needed

### 3. Long-term Improvements

1. **Pre-commit Hook**
   - Add style guide compliance check
   - Prevent new violations from being committed

2. **Developer Guidelines**
   - Document CSS variable usage patterns
   - Provide examples for common scenarios

3. **Design System Components**
   - Create reusable styled components
   - Reduce direct className usage

## CSS Variable Quick Reference

```css
/* Text Colors */
.text-foreground  /* Headings */
.text-body        /* Body text */
.text-muted       /* Secondary text */
.text-primary     /* Brand color text */
.text-accent      /* CTA text */

/* Backgrounds */
.bg-card          /* White cards */
.bg-background    /* Page background */
.bg-primary       /* Brand backgrounds */
.bg-accent        /* CTA backgrounds */

/* Borders */
.border-default   /* Standard borders */
.border-primary   /* Brand borders */
.border-accent    /* CTA borders */

/* Buttons */
.btn-primary      /* Main CTAs (Electric Blue) */
.btn-upgrade      /* Upgrade CTAs (Deep Indigo) */
.btn-secondary    /* Secondary actions */

/* States */
.success-text, .success-bg, .success-border
.warning-text, .warning-bg, .warning-border
.error-text, .error-bg, .error-border
```

## Testing

Run the compliance tests with:

```bash
npm test styleGuideCompliance
```

This will show all violations with file paths and line numbers for easy fixing.

## Conclusion

While there are many violations to fix, the foundation is now in place:

1. Global CSS variables are defined
2. Utility classes are available
3. Test suite ensures compliance
4. Clear migration path forward

The next phase should focus on systematically updating each component group,
starting with the dashboard components as they represent the premium features of
the application.
