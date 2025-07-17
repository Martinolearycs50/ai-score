# Tier Architecture Migration Guide

## Overview

This guide explains how to migrate from the old tier system (prop-based) to the new feature flag architecture.

## Architecture Comparison

### Old Architecture (Prop-based)
```typescript
// Tier passed as prop
<PillarScoreDisplay result={result} tier={tier} />

// Component checks tier directly
if (tier === 'free') { /* ... */ }
if (tier === 'pro') { /* ... */ }
```

### New Architecture (Feature Flags)
```typescript
// No tier prop needed
<PillarScoreDisplayV2 result={result} />

// Component checks features
const { features } = useTier();
if (!features.showDetailedScores) { /* ... */ }
if (features.showRecommendations) { /* ... */ }
```

## Migration Steps

### Step 1: Use TierProvider (Already Done)
The app is already wrapped with `TierProvider` in page.tsx.

### Step 2: Replace Components Gradually

#### For PillarScoreDisplay:
```typescript
// Old (still works)
import PillarScoreDisplay from '@/components/PillarScoreDisplay';
<PillarScoreDisplay result={result} tier={tier} />

// New (feature-based)
import PillarScoreDisplayV2 from '@/components/PillarScoreDisplayV2';
<PillarScoreDisplayV2 result={result} />
```

### Step 3: Update Conditional Rendering

#### Old Pattern:
```typescript
{tier === 'pro' && (
  <WebsiteProfileCard profile={profile} score={score} />
)}
```

#### New Pattern:
```typescript
const { features } = useTier();

{features.showWebsiteProfile && (
  <WebsiteProfileCard profile={profile} score={score} />
)}
```

### Step 4: Remove Tier State Management

Once all components are migrated, remove from HomeContent:
- `const [tier, setTier] = useState<'free' | 'pro'>('free');`
- `useEffect` for reading tier from URL (handled by TierProvider)
- `tier` prop passing to components

## Component Migration Checklist

- [ ] PillarScoreDisplay → PillarScoreDisplayV2 ✅
- [ ] Update WebsiteProfileCard visibility check
- [ ] Update recommendations section visibility
- [ ] Update comparison mode check
- [ ] Remove tier prop from all components
- [ ] Clean up HomeContent component

## Adding New Features

With the new architecture, adding features is simple:

1. Add to `TierFeatures` interface in tierConfig.ts:
```typescript
export interface TierFeatures {
  // ... existing features
  showNewFeature: boolean;
}
```

2. Configure for each tier:
```typescript
export const TIER_CONFIG = {
  free: {
    // ... existing features
    showNewFeature: false,
  },
  pro: {
    // ... existing features
    showNewFeature: true,
  }
};
```

3. Use in components:
```typescript
const { features } = useTier();
if (features.showNewFeature) {
  // Show the feature
}
```

## Testing

### Test Different Tiers:
```typescript
// In tests
<TierProvider defaultTier="pro">
  <ComponentUnderTest />
</TierProvider>
```

### Override Features:
```typescript
// For A/B testing or gradual rollout
<TierProvider overrideFeatures={{ showNewFeature: true }}>
  <App />
</TierProvider>
```

## Benefits of Migration

1. **Single Source of Truth**: All tier features in one file
2. **Type Safety**: TypeScript ensures all features are defined
3. **Easier Testing**: Mock features, not tiers
4. **Cleaner Components**: No tier logic in components
5. **Extensibility**: Easy to add new tiers or features
6. **A/B Testing**: Override individual features
7. **Better Maintainability**: Changes in one place

## Rollback Plan

If issues arise:
1. Keep both components (old and V2) during migration
2. Can switch back by changing imports
3. TierProvider doesn't break existing prop-based components
4. Gradual migration allows testing each component