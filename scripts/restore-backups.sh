#!/bin/bash

# Restore script for compressed files
# Restores files from .backup copies if needed

echo "Restoring files from backups..."

# List of files to restore
files=(
  "src/__mocks__/cheerio.ts"
  "src/components/DynamicWeightIndicator.tsx"
  "src/components/EmailCaptureForm.tsx"
  "src/components/LoadingState.test.tsx"
  "src/components/UrlForm.test.tsx"
  "src/lib/businessPersonas.ts"
  "src/lib/narrativeEngine.ts"
  "src/lib/progressiveEnhancement.ts"
  "src/lib/types.ts"
  "src/utils/TooltipContent.ts"
  "src/utils/contentVerification.ts"
  "src/utils/simple-validator.ts"
  "src/utils/validators.test.ts"
)

# Restore from backups
for file in "${files[@]}"; do
  if [ -f "$file.backup" ]; then
    cp "$file.backup" "$file"
    echo "✓ Restored: $file"
  else
    echo "✗ No backup found: $file.backup"
  fi
done

echo "Restore complete!"