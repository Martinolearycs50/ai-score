#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with import statement issues
const filesToFix = [
  'src/components/DynamicWeightIndicator.tsx',
  'src/components/EmailCaptureForm.tsx',
  'src/components/UrlForm.test.tsx',
  'src/lib/businessPersonas.ts',
  'src/lib/narrativeEngine.ts',
  'src/utils/contentVerification.ts',
  'src/utils/validators.test.ts',
];

console.log('Fixing import statement errors...\n');

filesToFix.forEach((filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix pattern: closing brace on wrong line
    // Replace "}\n from" with "} from"
    content = content.replace(/\}\s*;\s*\n\s*from/g, '} from');

    // Fix pattern where import items are split incorrectly
    // This handles cases like:
    // import {
    //  useState };
    //  from 'react';
    content = content.replace(/import\s*\{\s*\n([^}]+)\}\s*;\s*\n\s*from/g, 'import {\n$1} from');

    // Fix import type statements
    content = content.replace(
      /import\s+type\s*\{\s*\n([^}]+)\}\s*;\s*\n\s*from/g,
      'import type {\n$1} from'
    );

    // Remove stray "export;" statements (just the word export followed by semicolon on its own line)
    content = content.replace(/^\s*export\s*;\s*$/gm, '');

    // Write the fixed content back
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed import statements in: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}: ${error.message}`);
  }
});

console.log('\nImport statement fixes complete!');
