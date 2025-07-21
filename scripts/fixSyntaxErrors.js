#!/usr/bin/env node

/**
 * Fix syntax errors by reformatting compressed TypeScript files
 * This script identifies files with syntax errors and attempts to fix them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function formatTypeScriptFile(filePath) {
  console.log(`\n🔧 Formatting ${filePath}...`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if file is already properly formatted (has multiple lines)
    const lineCount = content.split('\n').length;
    if (lineCount > 10 && content.length / lineCount < 200) {
      console.log(`✅ File appears to be already formatted (${lineCount} lines)`);
      return true;
    }

    // Enhanced formatting for compressed code
    let formatted = content
      // Preserve strings and regex patterns
      .replace(/(['"`])((?:\\.|(?!\1).)*?)\1/g, (match) => {
        // Temporarily replace string content to avoid breaking it
        return match.replace(/;/g, '<<<SEMICOLON>>>').replace(/,/g, '<<<COMMA>>>');
      })

      // Add line breaks after imports
      .replace(/^import\s+/gm, '\nimport ')
      .replace(/from\s+(['"`][^'"`]+['"`]);/g, 'from $1;\n')

      // Add line breaks for interface/type definitions
      .replace(/\binterface\s+(\w+)\s*\{/g, '\n\ninterface $1 {\n  ')
      .replace(/\btype\s+(\w+)\s*=\s*\{/g, '\n\ntype $1 = {\n  ')

      // Add line breaks for function declarations
      .replace(/export\s+(async\s+)?function\s+/g, '\n\nexport $1function ')
      .replace(/function\s+(\w+)\s*\(/g, 'function $1(')

      // Add line breaks for const/let/var declarations
      .replace(/^(export\s+)?(const|let|var)\s+/gm, '\n$1$2 ')

      // Format object literals and arrays
      .replace(/\{(?=[^}]*[,;])/g, '{\n  ')
      .replace(/\}(?=\s*[,;])/g, '\n}')
      .replace(/,\s*(?=[a-zA-Z_$'"`])/g, ',\n  ')

      // Add line breaks after semicolons (except in for loops)
      .replace(/;\s*(?![;\s]*\))/g, ';\n')

      // Format JSX/TSX elements
      .replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
        if (attrs.length > 40) {
          return `<${tag}${attrs.replace(/\s+/g, '\n  ')}>`;
        }
        return match;
      })

      // Format class definitions
      .replace(/class\s+(\w+)/g, '\n\nclass $1')

      // Add proper spacing for braces
      .replace(/\)\s*\{/g, ') {')
      .replace(/\}\s*else\s*\{/g, '} else {')
      .replace(/\}\s*catch/g, '} catch')
      .replace(/\}\s*finally/g, '} finally')

      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')

      // Restore preserved strings
      .replace(/<<<SEMICOLON>>>/g, ';')
      .replace(/<<<COMMA>>>/g, ',')

      // Clean up indentation (basic)
      .split('\n')
      .map((line) => {
        // Remove leading spaces and add basic indentation
        const trimmed = line.trim();
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          return trimmed;
        }
        if (line.includes('{') && !line.includes('}')) {
          return '  ' + trimmed;
        }
        return trimmed;
      })
      .join('\n')
      .trim();

    // Write the formatted content back
    fs.writeFileSync(filePath, formatted, 'utf8');
    console.log(`✅ Successfully formatted ${filePath}`);

    // Try to run prettier on the file
    try {
      execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
      console.log(`✨ Prettier formatting applied`);
    } catch (e) {
      console.log(`⚠️  Prettier couldn't format the file yet, may need manual fixes`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error formatting ${filePath}:`, error.message);
    return false;
  }
}

// List of compressed files to fix
const compressedFiles = [
  'src/components/DynamicWeightIndicator.tsx',
  'src/components/EmailCaptureForm.tsx',
  'src/components/LoadingState.test.tsx',
  'src/components/UrlForm.test.tsx',
  'src/lib/businessPersonas.ts',
  'src/lib/narrativeEngine.ts',
  'src/lib/progressiveEnhancement.ts',
  'src/lib/types.ts',
  'src/utils/TooltipContent.ts',
  'src/utils/contentVerification.ts',
  'src/utils/simple-validator.ts',
  'src/utils/validators.test.ts',
  'src/__mocks__/cheerio.ts',
];

// Main execution
console.log('🔧 Fixing compressed TypeScript/TSX files...\n');
console.log(`Found ${compressedFiles.length} files to process\n`);

let successCount = 0;
let failCount = 0;

compressedFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    if (formatTypeScriptFile(filePath)) {
      successCount++;
    } else {
      failCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✨ Formatting complete!`);
console.log(`✅ Success: ${successCount} files`);
console.log(`❌ Failed: ${failCount} files`);
console.log('\nNext steps:');
console.log('1. Run "npm run format:check" to see remaining issues');
console.log('2. Run "npm run dev:simple" to start dev server without format check');
console.log('3. Run "npm test" after all files are fixed');
