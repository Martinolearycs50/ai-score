#!/bin/bash

# Backup script for compressed files
# Creates .backup copies of files before fixing

echo "Creating backups of compressed files..."

# List of files to backup
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

# Create backups
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$file.backup"
    echo "✓ Backed up: $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo "Backup complete!"