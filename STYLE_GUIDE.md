# <� AI Search Score  Style Guide

## Color Palette

Our design system uses a carefully selected color palette that provides clarity,
accessibility, and visual hierarchy.

| **Color Use**           | **Color Name** | **Hex Code** | **CSS Variable** | **Usage Guidelines**                                                     |
| ----------------------- | -------------- | ------------ | ---------------- | ------------------------------------------------------------------------ |
| Primary Brand Color     | Deep Indigo    | `#2D2A7F`    | `--primary`      |  Use for top nav, logos, and **key CTAs** like "Upgrade to Pro"          |
| CTA Accent Color        | Electric Blue  | `#3F8CFF`    | `--accent`       |  Use for **"Analyze URL" buttons** and all **primary user actions**      |
| Background              | Cool Gray      | `#F4F6FA`    | `--background`   | Use as main page background                                              |
| Text  Headings          | Slate          | `#1F2937`    | `--foreground`   | Use for strong headings and feature labels                               |
| Text  Body              | Gray           | `#4B5563`    | `--text`         | Use for paragraph content and secondary text                             |
| Text  Muted             | Lighter Gray   | `#6B7280`    | `--muted`        | Use for secondary/muted text                                             |
| Borders / Dividers      | Light Gray     | `#E5E7EB`    | `--border`       | Use for input borders, table dividers, card outlines                     |
| Success State           | Mint Green     | `#3DDC97`    | `--success`      | Use for **passed scores**, confirmation badges, or green indicator chips |
| Warning State           | Amber          | `#F59E0B`    | `--warning`      | Use for partial score warnings or attention banners                      |
| Error State             | Red            | `#EF4444`    | `--error`        | Use for **failed scores**, critical issues, or form errors               |
| Card & Modal Background | White          | `#FFFFFF`    | `--card`         | Use for components like cards, modals, input backgrounds                 |

## CTA Button Patterns

### Primary Actions

- **Upgrade to Pro Button** � `var(--primary)` (Deep Indigo) with white text
- **Analyze URL Button** � `var(--accent)` (Electric Blue) with white text

### Secondary Actions

- **Secondary Buttons** (e.g. "Back", "Cancel") � Border-only with `var(--text)`
  on white background
- **Success Actions** (e.g. "Apply Fixes") � `var(--success)` (Mint Green) if
  reinforcing successful action

## Typography

### Headings

- **Font**: Inter (system font stack fallback)
- **Color**: `var(--foreground)` (#1F2937 - Slate)
- **Weight**: 500 (medium)
- **Line Height**: 1.2

### Body Text

- **Font**: Inter (system font stack fallback)
- **Color**: `var(--text)` (#4B5563 - Gray)
- **Weight**: 400 (regular)
- **Line Height**: 1.6

### Muted Text

- **Color**: `var(--muted)` (#6B7280 - Lighter Gray)
- **Use cases**: Captions, helper text, timestamps

## Component Patterns

### Cards

```css
.card {
  background: var(--card); /* White */
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
}
```

### Input Fields

```css
.search-input {
  background: var(--card); /* White */
  border: none;
  box-shadow: var(--shadow-sm);
  /* Focus state uses accent color */
}
```

### Buttons

```css
.btn-primary {
  background: var(--accent); /* Electric Blue */
  color: white;
}

.btn-upgrade {
  background: var(--primary); /* Deep Indigo */
  color: white;
}
```

## State Colors

### Success States

- **Color**: `var(--success)` (#3DDC97 - Mint Green)
- **Use**: Passed scores, successful actions, positive feedback
- **Class**: `.success-text`

### Warning States

- **Color**: `var(--warning)` (#F59E0B - Amber)
- **Use**: Partial scores, attention needed, caution messages
- **Class**: `.warning-text`

### Error States

- **Color**: `var(--error)` (#EF4444 - Red)
- **Use**: Failed scores, errors, critical issues
- **Class**: `.error-text`

## Spacing System

```css
--space-xs: 0.5rem; /* 8px */
--space-sm: 1rem; /* 16px */
--space-md: 2rem; /* 32px */
--space-lg: 3rem; /* 48px */
--space-xl: 4rem; /* 64px */
--space-2xl: 6rem; /* 96px */
--space-3xl: 8rem; /* 128px */
```

## Shadow System

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
```

## Animation & Transitions

```css
--transition: 200ms ease-out;
```

### Common Animations

- `animate-fade-in`: Fade in with slight upward motion
- `animate-pulse-glow`: Pulsing glow effect
- `animate-gradient`: Gradient shift animation
- `animate-slide-up`: Slide up from bottom

## Voice & Tone

### Encouraging

-  "Room to grow! <1"
- L "Poor performance"

### Simple & Clear

-  "Your site loads quickly"
- L "TTFB metrics suboptimal"

### Action-Oriented

-  "Boost your score with these quick wins"
- L "Score could be improved"

## Accessibility Guidelines

1. **Color Contrast**: Ensure all text meets WCAG AA standards
   - Normal text: 4.5:1 contrast ratio
   - Large text: 3:1 contrast ratio

2. **Focus States**: Always provide visible focus indicators

3. **Color Independence**: Never rely solely on color to convey information

4. **Interactive Elements**: Minimum 44x44px touch target

## Implementation Notes

### Using CSS Variables

Always use CSS variables instead of hardcoded colors:

```css
/* Good */
color: var(--primary);

/* Avoid */
color: #2d2a7f;
```

### Consistent Patterns

Follow established patterns for components:

- Cards always use white background on the Cool Gray page background
- Primary actions use Electric Blue
- Brand/upgrade CTAs use Deep Indigo
- State colors (success/warning/error) are consistent throughout

### Responsive Design

- Mobile-first approach
- Minimum 375px width support
- Touch-friendly interactive elements

---

Last updated: 2025-01-20
