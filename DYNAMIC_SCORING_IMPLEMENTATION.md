# Dynamic Scoring System Implementation

## Overview
The AI Search Analyzer now features a dynamic scoring system that adjusts scoring weights based on the type of page being analyzed. This ensures more accurate and relevant scoring for different content types.

## Page Type Detection

### Three Main Page Types
1. **Homepage** - Main landing pages, root URLs, company overviews
2. **Blog/Article** - Blog posts, news articles, editorial content
3. **Product** - Product pages, e-commerce listings, item details

### Detection Methods (in order)
1. **URL Pattern Analysis**
   - Homepage: `/`, `/index.html`, `/home`, language variants (`/en/`)
   - Blog: `/blog/`, `/article/`, `/news/`, date patterns
   - Product: `/product/`, `/shop/`, `/p/`, platform-specific patterns

2. **Schema.org Markup**
   - Homepage: Organization schema
   - Blog: Article, BlogPosting, NewsArticle schema
   - Product: Product schema

3. **Content Patterns**
   - Homepage: Navigation-heavy, hero sections
   - Blog: Author info + publish date
   - Product: Price + add to cart elements

4. **Default**: Blog (when uncertain)

## Dynamic Scoring Weights

### Base Weights (Original)
- RETRIEVAL: 25 points
- FACT_DENSITY: 20 points
- STRUCTURE: 30 points
- TRUST: 15 points
- RECENCY: 10 points
- **Total**: 100 points

### Homepage Weights
- RETRIEVAL: 35 (+10) - Speed crucial for first impressions
- FACT_DENSITY: 15 (-5) - Navigation more important than deep content
- STRUCTURE: 25 (-5) - Site architecture crucial
- TRUST: 20 (+5) - Brand signals vital
- RECENCY: 5 (-5) - Less critical for homepages
- **Total**: 100 points

### Blog/Article Weights
- RETRIEVAL: 25 (0) - Standard importance
- FACT_DENSITY: 35 (+15) - Citations and data crucial
- STRUCTURE: 20 (-10) - Content quality over structure
- TRUST: 10 (-5) - Content matters more than brand
- RECENCY: 10 (0) - Freshness matters for articles
- **Total**: 100 points

### Product Page Weights
- RETRIEVAL: 25 (0) - Standard importance
- FACT_DENSITY: 30 (+10) - Specifications and features
- STRUCTURE: 25 (-5) - Product schema critical
- TRUST: 15 (0) - Trust signals important
- RECENCY: 5 (-5) - Products don't need frequent updates
- **Total**: 100 points

## Implementation Details

### Scoring Process
1. Calculate raw scores using original pillar maximums
2. Determine page type from extracted content
3. Calculate percentage achieved for each pillar
4. Apply new weights based on page type
5. Display both raw and weighted scores

### UI Components

#### PageTypeIndicator
- Shows detected page type with icon
- Supports manual override (UI only, not functional yet)
- Compact and full display modes

#### DynamicWeightIndicator
- Shows applied weights for transparency
- Visual bars for weight distribution
- Expandable details view

#### Updated Components
- EmotionalResultsReveal: Shows page type during analysis
- PillarScoreDisplayV2: Displays dynamic scoring badge
- ComparisonView: Shows page types and warns about comparing different types
- WebsiteProfileCard: Includes page type information

## Testing

### Test Coverage
- Dynamic scoring calculations
- Weight application accuracy
- Page type detection scenarios
- Configuration integrity
- Backward compatibility

### Key Test Files
- `/src/__tests__/dynamicScoring.test.ts`
- `/src/__tests__/pageTypeDetection.test.ts`

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic page type detection
- ✅ Dynamic weight application
- ✅ Visual indicators

### Phase 2 (Planned)
- Chrome UX Report API integration
- Manual page type override functionality
- More granular page types
- Industry-specific weights

### Phase 3 (Future)
- Machine learning for page type detection
- Custom weight profiles
- A/B testing different weight configurations

## Configuration

### Constants
- `/src/utils/constants.ts` - Weight configurations
- `/src/lib/types.ts` - Type definitions
- `/src/lib/pageTypeRecommendations.ts` - Page-specific recommendations

### Feature Flag
The system includes a feature flag for easy rollback:
```typescript
export function score(
  pillarResults: PillarResults, 
  extractedContent?: ExtractedContent, 
  enableDynamicScoring: boolean = true
): ScoringResult
```

## Impact on Scores

### Example: Blog Post
- Raw scores: RETRIEVAL: 20/25, FACT_DENSITY: 15/20, etc.
- With blog weights: Higher emphasis on content means FACT_DENSITY becomes more important
- Result: Sites with rich content get higher scores on blog pages

### Example: Homepage
- Raw scores: Same as above
- With homepage weights: Speed and trust become more important
- Result: Fast, trustworthy homepages score higher

## Best Practices

1. **Content Creators**: Optimize based on your page type
   - Homepages: Focus on speed and trust signals
   - Blog posts: Rich content with citations
   - Product pages: Detailed specifications and schema

2. **Developers**: Ensure proper page structure
   - Use appropriate URL patterns
   - Implement correct schema markup
   - Include page type indicators in content

3. **SEO Professionals**: Consider page type in optimization
   - Different strategies for different page types
   - Monitor how scoring changes affect rankings