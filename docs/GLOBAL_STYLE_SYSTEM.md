# AI Search Score Global Style System

> **This is the single source of truth for all styling in the AI Search Score
> application.**  
> Last Updated: 2025-07-23

## Quick Reference

### Primary Colors

| Purpose           | Token Name           | Hex Value | Usage                                        |
| ----------------- | -------------------- | --------- | -------------------------------------------- |
| **Primary Brand** | `brand-primary`      | #2D2A7F   | Logo, premium CTAs, brand elements           |
| **Accent/CTA**    | `brand-accent`       | #3F8CFF   | Primary buttons, links, interactive elements |
| **Background**    | `surface-background` | #F4F6FA   | Page background                              |
| **Card**          | `surface-card`       | #FFFFFF   | Cards, modals, elevated surfaces             |

### Text Colors

| Purpose      | Token Name        | Hex Value | Usage                         |
| ------------ | ----------------- | --------- | ----------------------------- |
| **Headings** | `content-heading` | #1F2937   | Page titles, section headings |
| **Body**     | `content-body`    | #4B5563   | Paragraph text, descriptions  |
| **Border**   | `content-border`  | #E5E7EB   | Dividers, input borders       |

### Status Colors

| Purpose     | Token Name       | Hex Value | Usage                             |
| ----------- | ---------------- | --------- | --------------------------------- |
| **Success** | `status-success` | #3DDC97   | Success states, high scores (80+) |
| **Warning** | `status-warning` | #F59E0B   | Warnings, medium scores (40-79)   |
| **Error**   | `status-error`   | #EF4444   | Errors, low scores (0-39)         |

## Design Principles

1. **Semantic Naming**: Always use semantic color tokens, never hex values
2. **Consistency**: Maximum 2-3 colors per component
3. **Accessibility**: Maintain WCAG AA contrast ratios
4. **Simplicity**: No dark mode, no runtime theme switching
5. **Performance**: Use Tailwind utilities, avoid runtime calculations

## Implementation Guide

### 1. Using Colors in Components

#### ✅ CORRECT Usage

```tsx
// Using Tailwind utilities with our tokens
<button className="bg-brand-accent text-white hover:bg-brand-accent/90">
  Analyze URL
</button>

// Using design system constants
import { styles } from '@/styles/constants'
<button className={cn(styles.buttons.primary, styles.buttons.base)}>
  Analyze URL
</button>

// Using CSS variables for dynamic styles
<div className="text-content-heading border-content-border">
  Content
</div>
```

#### ❌ INCORRECT Usage

```tsx
// Never use hex colors directly
<button className="bg-[#3F8CFF]">  // ❌ WRONG

// Never use inline styles
<div style={{ color: '#1F2937' }}>  // ❌ WRONG

// Never use arbitrary values
<div className="mt-[23px]">  // ❌ WRONG - use mt-6

// Never use non-semantic Tailwind colors
<div className="bg-gray-100">  // ❌ WRONG - use bg-surface-background
```

### 2. Button Hierarchy

```tsx
// Primary CTA (Analyze URL, main actions)
<button className="bg-brand-accent text-white hover:bg-brand-accent/90 px-6 py-3 rounded-lg font-semibold">

// Premium/Upgrade CTAs
<button className="bg-brand-primary text-white hover:bg-brand-primary/90 px-6 py-3 rounded-lg font-bold">

// Secondary Actions
<button className="bg-surface-card text-brand-primary border border-brand-primary hover:bg-surface-background px-6 py-3 rounded-lg">

// Success Actions (Apply Fixes)
<button className="bg-status-success text-white hover:bg-status-success/90 px-6 py-3 rounded-lg">

// Text/Tertiary Buttons
<button className="text-brand-accent hover:text-brand-accent/80 underline">
```

### 3. Card Patterns

```tsx
// Standard Card
<div className="bg-surface-card rounded-lg border border-content-border shadow-sm p-6">

// Hoverable Card
<div className="bg-surface-card rounded-lg border border-content-border shadow-sm hover:shadow-md transition-shadow p-6">

// Status Cards
<div className="bg-surface-card rounded-lg border-l-4 border-l-status-success p-6">
```

### 4. Form Elements

```tsx
// Input Fields
<input className="w-full px-3 py-2 bg-surface-card border border-content-border rounded-md
                 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent" />

// Labels
<label className="text-content-body font-medium mb-2 block">

// Help Text
<p className="text-sm text-content-body/80 mt-1">
```

## Style Constants

All reusable style patterns are defined in `/src/styles/constants.ts`:

```typescript
import { styles } from '@/styles/constants';

// Available patterns:
styles.buttons.primary; // Primary CTA styles
styles.buttons.secondary; // Secondary button styles
styles.buttons.success; // Success action styles
styles.cards.base; // Standard card styles
styles.inputs.base; // Form input styles
styles.text.heading; // Heading text styles
styles.text.body; // Body text styles
```

## Working with shadcn/ui

When using shadcn/ui components, they automatically inherit our design tokens
through CSS variables:

```tsx
import { Button } from '@/components/ui/button'

// Variants map to our design system
<Button variant="default">   // Uses brand-accent
<Button variant="secondary"> // Uses surface-card with border
<Button variant="destructive"> // Uses status-error
```

## Adding New Styles

### Decision Flow:

1. **Does a semantic token exist?** → Use it
2. **Is it a one-off style?** → Use closest Tailwind utility
3. **Is it a reusable pattern?** → Add to `/src/styles/constants.ts`
4. **Is it a new design element?** → Consult team, then add token

### Process for New Tokens:

1. Add to `tailwind.config.ts`
2. Add to this documentation
3. Add to style constants if reusable
4. Update relevant components

## Enforcement Rules

### ESLint Rules (Warnings → Errors after 2 weeks)

- `react/forbid-dom-props`: Bans `style` attribute
- `tailwindcss/no-arbitrary-value`: Prevents `[23px]` values
- Custom rule: Catches hex colors in className

### Pre-commit Hooks

- Checks for hex colors in className
- Checks for style attributes
- Runs style linting

### Editor Configuration

- Configure your editor to support Tailwind CSS autocomplete
- Enable ESLint for real-time style warnings
- Consider installing Tailwind CSS language support

## Common Patterns

### Score-based Colors

```tsx
function getScoreColor(score: number): string {
  if (score >= 80) return 'status-success';
  if (score >= 60) return 'brand-accent';
  if (score >= 40) return 'status-warning';
  return 'status-error';
}
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="p-4 md:p-6 lg:p-8">
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

### State Management

```tsx
// Loading states
<div className="animate-pulse bg-content-border rounded">

// Disabled states
<button className="opacity-50 cursor-not-allowed">

// Focus states
<input className="focus:ring-2 focus:ring-brand-accent">
```

## Migration Guide

### Phase 1: Update Imports

```tsx
// Before
style={{ color: '#1F2937' }}

// After
className="text-content-heading"
```

### Phase 2: Replace Hex Colors

```tsx
// Before
className = 'bg-[#3F8CFF]';

// After
className = 'bg-brand-accent';
```

### Phase 3: Use Style Constants

```tsx
// Before
className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"

// After
import { styles } from '@/styles/constants'
className={cn(styles.buttons.primary, styles.buttons.base)}
```

## Exceptions

In rare cases where custom styling is absolutely necessary:

1. Document the reason in a comment
2. Use CSS variables, not hex values
3. Consider if it should become a design token
4. Get team approval for new patterns

```tsx
// Exception: Animation requiring specific timing
// TODO: Consider adding to design system
<div
  className="transition-all"
  style={{ transitionDuration: '350ms' }} // Specific animation requirement
>
```

## Resources

- **Tailwind Config**: `/tailwind.config.ts`
- **Style Constants**: `/src/styles/constants.ts`
- **CSS Variables**: `/src/app/globals.css`
- **Design System Module**: `/src/lib/design-system/colors.ts`

## Questions?

- For new patterns: Create a GitHub issue
- For clarifications: Check this document first
- For exceptions: Get team approval

Remember: **Consistency > Perfection**. When in doubt, follow existing patterns.
