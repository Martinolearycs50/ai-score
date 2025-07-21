#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need specific fixes
const filesToFix = [
  'src/__mocks__/cheerio.ts',
  'src/components/DynamicWeightIndicator.tsx',
  'src/components/EmailCaptureForm.tsx',
  'src/lib/businessPersonas.ts',
  'src/lib/narrativeEngine.ts',
  'src/lib/progressiveEnhancement.ts',
  'src/lib/types.ts',
  'src/utils/contentVerification.ts',
];

function fixFile(filePath) {
  console.log(`\nFixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const fileName = path.basename(filePath);

  // File-specific fixes
  switch (fileName) {
    case 'cheerio.ts':
      // Fix the else; if pattern
      console.log('  - Fixing else; if patterns');
      content = content.replace(/else;\s*if/g, 'else if');
      break;

    case 'DynamicWeightIndicator.tsx':
      // Fix the malformed Record type
      console.log('  - Fixing Record type definition');
      content = content.replace(/Record<PageType,\s*;/g, 'Record<PageType,');
      content = content.replace(/number>;\s*=\s*{/g, 'number> = {');
      break;

    case 'EmailCaptureForm.tsx':
      // Add missing catch block after try
      console.log('  - Adding missing catch block');
      if (content.includes('try {') && !content.includes('} catch')) {
        // Find the try block and add a catch
        content = content.replace(
          /try\s*{([^}]+)}\s*finally/g,
          'try {$1} catch (error) {\n    console.error(error);\n  } finally'
        );
      }
      break;

    case 'businessPersonas.ts':
      // Fix unterminated template literals
      console.log('  - Fixing template literal syntax');
      // Fix patterns like "};" within strings
      content = content.replace(
        /"\s*While you focused on features,\s*{\s*competitor\s*};\s*is getting/g,
        '"While you focused on features, {competitor} is getting'
      );
      content = content.replace(/'\s*{\s*searchQuery\s*}\s*'/g, "'{searchQuery}'");
      content = content.replace(/{\s*missingElement\s*};\s*see/g, '{missingElement} see');
      break;

    case 'narrativeEngine.ts':
      // Fix comment that's merged with code
      console.log('  - Fixing comment/code merge');
      content = content.replace(
        /duration: number;\s*\/\/ milliseconds to display\s*data\?:/g,
        'duration: number; // milliseconds to display\n  data?:'
      );
      break;

    case 'progressiveEnhancement.ts':
      // Fix interface formatting
      console.log('  - Fixing interface declarations');
      content = content.replace(
        /fromCache\?:\s*boolean;\s*};\s*interface/g,
        'fromCache?: boolean;\n}\n\ninterface'
      );
      break;

    case 'types.ts':
      // Fix export statement issues
      console.log('  - Fixing export statements');
      content = content.replace(/export;\s*interface/g, 'export interface');
      content = content.replace(
        /\/\/ New pillar-based scoring for AI Search export;\s*interface/g,
        '// New pillar-based scoring for AI Search\nexport interface'
      );
      content = content.replace(
        /\/\/ Dynamic scoring configuration export;\s*interface/g,
        '// Dynamic scoring configuration\nexport interface'
      );
      break;

    case 'contentVerification.ts':
      // This file has many issues, let's fix the most critical ones
      console.log('  - Fixing multiple syntax issues');
      // Fix the interface declaration
      content = content.replace(
        /interface\s*{\s*component:\s*string;/g,
        'interface VerificationIssue {\n  component: string;'
      );
      // Fix semicolons in object literals
      content = content.replace(/component:\s*string;\s*field:/g, 'component: string;\n  field:');
      content = content.replace(/}\s*;\s*\n\s*from/g, '} from');
      break;
  }

  // Common fixes for all files
  console.log('  - Applying common fixes');

  // Fix closing braces followed by semicolons in wrong places
  content = content.replace(/}\s*;\s*else/g, '} else');
  content = content.replace(/}\s*;\s*catch/g, '} catch');
  content = content.replace(/}\s*;\s*finally/g, '} finally');

  // Fix export statements
  content = content.replace(/^\s*export\s*;\s*$/gm, '');

  // Fix trailing semicolons after interface/type definitions
  content = content.replace(
    /^(\s*(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*=?\s*{[^}]*})\s*;(\s*)$/gm,
    '$1$2'
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✓ Fixed');
  } else {
    console.log('  - No changes needed');
  }
}

// Main execution
console.log('Starting targeted syntax fixes...\n');

filesToFix.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Targeted syntax fixes complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run format:check');
console.log('2. If prettier still fails, check the specific error messages');
console.log('3. Run: npm test');
