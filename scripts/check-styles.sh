#!/bin/bash

# Style enforcement script
# Checks for violations of our global style system

echo "🎨 Checking style compliance..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if we found any violations
VIOLATIONS=0

# Check for hex colors in className attributes
echo "Checking for hex colors in className..."
if grep -r 'className=.*#[0-9a-fA-F]\{3,8\}' src/ --include="*.tsx" --include="*.jsx" 2>/dev/null; then
  echo -e "${RED}❌ Found hex colors in className attributes!${NC}"
  echo -e "${YELLOW}Use semantic tokens like 'brand-primary' instead of hex values.${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for inline style attributes
echo "Checking for inline styles..."
INLINE_STYLES=$(grep -r 'style=' src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
if [ $INLINE_STYLES -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $INLINE_STYLES inline style attributes${NC}"
  echo -e "${YELLOW}Consider migrating to Tailwind classes. See docs/GLOBAL_STYLE_SYSTEM.md${NC}"
  # Don't fail for now, just warn
fi

# Check for non-semantic Tailwind colors
echo "Checking for non-semantic Tailwind colors..."
if grep -r 'className=.*\(gray\|blue\|red\|green\|yellow\|purple\|pink\|indigo\)-[0-9]\+' src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "// style-exception"; then
  echo -e "${YELLOW}⚠️  Found non-semantic Tailwind colors${NC}"
  echo -e "${YELLOW}Use semantic tokens like 'content-body' instead of 'gray-600'${NC}"
  # Don't fail for now, just warn
fi

# Check for arbitrary Tailwind values
echo "Checking for arbitrary Tailwind values..."
if grep -r 'className=.*\[\([0-9]\+px\|[0-9]\+rem\|#[0-9a-fA-F]\+\)\]' src/ --include="*.tsx" --include="*.jsx" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Found arbitrary Tailwind values${NC}"
  echo -e "${YELLOW}Use standard Tailwind utilities or add to design system${NC}"
  # Don't fail for now, just warn
fi

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ Style checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Style violations found!${NC}"
  echo "See docs/GLOBAL_STYLE_SYSTEM.md for guidelines"
  exit 1
fi