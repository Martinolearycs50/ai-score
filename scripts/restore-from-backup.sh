#!/bin/bash

# Restore files from backup
echo "Restoring files from backup..."

files=(
  "src/__mocks__/cheerio.ts"
  "src/components/DynamicWeightIndicator.tsx"
  "src/components/EmailCaptureForm.tsx"
  "src/components/UrlForm.test.tsx"
  "src/lib/businessPersonas.ts"
  "src/lib/narrativeEngine.ts"
  "src/lib/progressiveEnhancement.ts"
  "src/lib/types.ts"
  "src/utils/contentVerification.ts"
  "src/utils/validators.test.ts"
)

restored=0
for file in "${files[@]}"; do
  if [ -f "$file.backup" ]; then
    cp "$file.backup" "$file"
    echo "✓ Restored $file"
    ((restored++))
  else
    echo "✗ No backup found for $file"
  fi
done

echo ""
echo "Restored $restored files from backup"