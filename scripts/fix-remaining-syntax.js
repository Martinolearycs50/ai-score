#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need specific syntax fixes
const filesToFix = [
  'src/__mocks__/cheerio.ts',
  'src/lib/progressiveEnhancement.ts',
  'src/lib/types.ts',
];

function fixCheerioMock(content) {
  console.log('Fixing cheerio mock syntax issues...');

  // Fix the comment on line 1 - it should be on its own line
  content = content.replace(
    /\/\/ Simplified mock for cheerio that properly handles all test cases const cheerio = {/,
    '// Simplified mock for cheerio that properly handles all test cases\nconst cheerio = {'
  );

  // Fix missing semicolon at line 7 (after etc)
  content = content.replace(
    /\/\/ Handle when selector is an element \(from filter callback,\s*etc\)/,
    '// Handle when selector is an element (from filter callback, etc.)'
  );

  // Fix the else; if patterns (lines 242-244, 252-254, etc.)
  content = content.replace(/else;\s*if\s*\(/g, 'else if (');

  // Fix standalone semicolons after else
  content = content.replace(/\}\s*;\s*else/g, '} else');

  // Fix the final export statement
  content = content.replace(/export = cheerio;/, 'export = cheerio;');

  return content;
}

function fixProgressiveEnhancement(content) {
  console.log('Fixing progressiveEnhancement syntax issues...');

  // The main issue is a comment with semicolon inside on line 2
  // Fix: "// Provides tiered functionality based on user's subscription level;"
  content = content.replace(
    /\/\/ Provides tiered functionality based on user's subscription level;/,
    "// Provides tiered functionality based on user's subscription level"
  );

  return content;
}

function fixTypes(content) {
  console.log('Fixing types.ts syntax issues...');

  // Fix any stray export; statements
  content = content.replace(/^\s*export\s*;\s*$/gm, '');

  // Ensure proper formatting of export statements
  content = content.replace(/export\s*{\s*}/g, '');

  return content;
}

// Process each file
filesToFix.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  console.log(`\nProcessing ${file}...`);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Apply specific fixes based on file
  if (file.includes('cheerio.ts')) {
    content = fixCheerioMock(content);
  } else if (file.includes('progressiveEnhancement.ts')) {
    content = fixProgressiveEnhancement(content);
  } else if (file.includes('types.ts')) {
    content = fixTypes(content);
  }

  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Fixed ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});

console.log('\n✅ Remaining syntax fixes complete');
