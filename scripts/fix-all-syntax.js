#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// All files that need syntax fixing
const filesToFix = [
  'src/__mocks__/cheerio.ts',
  'src/components/DynamicWeightIndicator.tsx',
  'src/components/EmailCaptureForm.tsx',
  'src/components/UrlForm.test.tsx',
  'src/lib/businessPersonas.ts',
  'src/lib/narrativeEngine.ts',
  'src/lib/progressiveEnhancement.ts',
  'src/lib/types.ts',
  'src/utils/contentVerification.ts',
];

function fixCommonIssues(content, fileName) {
  console.log(`Fixing common issues in ${fileName}...`);

  // Fix imports with closing brace on wrong line
  content = content.replace(/\}\s*;\s*\n\s*from/g, '} from');

  // Remove stray export; statements
  content = content.replace(/^\s*export\s*;\s*$/gm, '');

  // Fix comments that are merged with code
  content = content.replace(/\/\/(.*)const\s+/g, '// $1\nconst ');
  content = content.replace(/\/\/(.*)export\s+/g, '// $1\nexport ');
  content = content.replace(/\/\/(.*)import\s+/g, '// $1\nimport ');
  content = content.replace(/\/\/(.*)interface\s+/g, '// $1\ninterface ');

  // Fix multi-line comments on single line
  content = content.replace(/\/\*\s*([^*]+)\s*\*\/\s*(\w)/g, '/* $1 */\n$2');

  return content;
}

function expandCompressedCode(content, fileName) {
  console.log(`Expanding compressed code in ${fileName}...`);

  // Fix object/array definitions that are compressed
  // { key: value } => {\n  key: value\n}
  content = content.replace(/({[^{}]*})/g, (match) => {
    if (match.length < 100 && !match.includes('\n')) {
      return match; // Keep short objects on one line
    }
    // Expand longer objects
    return match.replace(/{/g, '{\n  ').replace(/,\s*/g, ',\n  ').replace(/}/g, '\n}');
  });

  // Fix compressed if/else statements
  content = content.replace(/}\s*else\s*if\s*\(/g, '} else if (');
  content = content.replace(/}\s*else\s*{/g, '} else {');

  // Fix compressed function definitions
  content = content.replace(/\)\s*:\s*(\w+)\s*{/g, '): $1 {');

  // Fix lines with multiple statements
  content = content.replace(/;\s*(\w+\s*[=:(])/g, ';\n$1');

  return content;
}

function fixSpecificFileIssues(content, fileName) {
  if (fileName.includes('cheerio.ts')) {
    // Fix the specific cheerio mock issues
    content = content.replace(/length: 0\s*};/, 'length: 0\n};');
    content = content.replace(/}\s*;\s*else/g, '} else');

    // Fix nested ternary operators to be more readable
    content = content.replace(
      /results\.length = html\.includes\('<table'\)\s*\?\s*1\s*:\s*0;/g,
      "results.length = html.includes('<table') ? 1 : 0;"
    );
  }

  if (fileName.includes('businessPersonas.ts')) {
    // Fix unterminated strings - check for strings that span lines incorrectly
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Fix lines that have unterminated strings
      if (lines[i].includes('competitor}') && !lines[i].includes('{competitor}')) {
        lines[i] = lines[i].replace(/competitor}/, '{competitor}');
      }
      if (lines[i].includes('searchQuery}') && !lines[i].includes('{searchQuery}')) {
        lines[i] = lines[i].replace(/searchQuery}/, '{searchQuery}');
      }
    }
    content = lines.join('\n');
  }

  if (fileName.includes('narrativeEngine.ts')) {
    // Fix comment issues
    content = content.replace(
      /\/\/ milliseconds to display data\?: Record<string,\s*any>;/,
      '// milliseconds to display\n  data?: Record<string, any>;'
    );
    content = content.replace(
      /\/\/ Stage-specific data }\s*\*\*\*/,
      '// Stage-specific data\n}\n\n/**'
    );
    content = content.replace(/export;\s*class/, 'export class');
  }

  if (fileName.includes('types.ts')) {
    // Fix export statements
    content = content.replace(/export\s*{\s*};/g, '');
    content = content.replace(/;\s*export type/g, ';\n\nexport type');
    content = content.replace(/;\s*export interface/g, ';\n\nexport interface');
  }

  if (fileName.includes('contentVerification.ts')) {
    // Fix inline comments and formatting
    content = content.replace(/}\s*;\s*\n\s*import/g, '} from');
    content = content.replace(/;\s*interface/g, ';\n\ninterface');
    content = content.replace(/;\s*class/g, ';\n\nclass');
  }

  if (fileName.includes('progressiveEnhancement.ts')) {
    // Fix interface formatting
    content = content.replace(/interface\s+(\w+)\s*{\s*\n\s*(\w+):/g, 'interface $1 {\n  $2:');
    content = content.replace(/;\s*(\w+):/g, ';\n  $1:');
  }

  return content;
}

// Process each file
filesToFix.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  console.log(`\n📝 Processing ${file}...`);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Apply fixes in order
  content = fixCommonIssues(content, file);
  content = expandCompressedCode(content, file);
  content = fixSpecificFileIssues(content, file);

  // Ensure file ends with newline
  if (!content.endsWith('\n')) {
    content += '\n';
  }

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

console.log('\n✨ All syntax fixes complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run dev:simple');
console.log('2. If successful, run: npx prettier --write .');
console.log('3. Then run: npm test');
