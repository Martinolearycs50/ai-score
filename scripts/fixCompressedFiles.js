#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need fixing based on prettier errors
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
  'src/utils/simple-validator.ts',
  'src/utils/TooltipContent.ts',
  'src/utils/validators.test.ts',
];

function expandCompressedCode(content) {
  // First, preserve strings and regexes
  const stringMap = new Map();
  let stringIndex = 0;

  // Preserve all strings and regex patterns
  content = content.replace(
    /(['"`])(?:(?=(\\?))\2[\s\S])*?\1|\/(?:(?=(\\?))\2[\s\S])*?\//g,
    (match) => {
      const placeholder = `__STRING_${stringIndex}__`;
      stringMap.set(placeholder, match);
      stringIndex++;
      return placeholder;
    }
  );

  // Fix common compression patterns
  content = content
    // Add newlines after imports
    .replace(/;(\s*)import\s+/g, ';\n\nimport ')
    .replace(/\}(\s*)import\s+/g, '}\n\nimport ')
    // Add newlines after export statements
    .replace(/;(\s*)export\s+/g, ';\n\nexport ')
    // Add newlines after closing braces
    .replace(/\}\s*const\s+/g, '}\n\nconst ')
    .replace(/\}\s*let\s+/g, '}\n\nlet ')
    .replace(/\}\s*var\s+/g, '}\n\nvar ')
    .replace(/\}\s*function\s+/g, '}\n\nfunction ')
    .replace(/\}\s*class\s+/g, '}\n\nclass ')
    .replace(/\}\s*interface\s+/g, '}\n\ninterface ')
    .replace(/\}\s*type\s+/g, '}\n\ntype ')
    .replace(/\}\s*enum\s+/g, '}\n\nenum ')
    // Add newlines before comments
    .replace(/([^/])\s*\/\//g, '$1\n  //')
    .replace(/\}\s*\/\*/g, '}\n\n/*')
    // Fix inline object/array definitions
    .replace(/,\s*\{/g, ', {\n  ')
    .replace(/\{\s*([a-zA-Z_$][\w$]*)\s*:/g, '{\n  $1: ')
    .replace(/:\s*\{/g, ': {\n    ')
    .replace(/,\s*([a-zA-Z_$][\w$]*)\s*:/g, ',\n  $1: ')
    // Fix function definitions
    .replace(/\)\s*=>\s*\{/g, ') => {\n  ')
    .replace(/\)\s*\{/g, ') {\n  ')
    // Fix semicolons
    .replace(/;([a-zA-Z_$])/g, ';\n$1')
    .replace(/;(\s*\/\/)/g, ';\n$1')
    // Fix if/else statements
    .replace(/\}\s*else\s*if/g, '} else if')
    .replace(/\}\s*else\s*\{/g, '} else {')
    .replace(/if\s*\(/g, 'if (')
    .replace(/\)\s*\{/g, ') {\n  ')
    // Fix return statements
    .replace(/return\s*\{/g, 'return {\n  ')
    .replace(/\};\s*\}/g, '};\n}')
    // Fix closing braces
    .replace(/\}\s*\)/g, '}\n)')
    .replace(/\)\s*;/g, ');\n')
    // Fix array definitions
    .replace(/\[\s*\{/g, '[{\n  ')
    .replace(/\}\s*,\s*\{/g, '},\n  {')
    .replace(/\}\s*\]/g, '}\n]');

  // Restore strings
  for (const [placeholder, original] of stringMap) {
    content = content.replace(new RegExp(placeholder, 'g'), original);
  }

  // Fix indentation
  const lines = content.split('\n');
  let indentLevel = 0;
  const fixedLines = lines.map((line) => {
    const trimmed = line.trim();

    // Decrease indent for closing braces
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indented = '  '.repeat(indentLevel) + trimmed;

    // Increase indent for opening braces
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indentLevel++;
    }

    return indented;
  });

  return fixedLines.join('\n');
}

console.log('🔧 Fixing compressed TypeScript/TSX files...\n');

let successCount = 0;
let failCount = 0;

filesToFix.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      failCount++;
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // Check if file appears compressed (very long lines or too few lines)
    const hasLongLines = lines.some((line) => line.length > 500);
    const lineCount = lines.length;
    const fileSize = content.length;
    const avgLineLength = fileSize / Math.max(1, lineCount);

    if (hasLongLines || avgLineLength > 200 || lineCount < 10) {
      console.log(`🔧 Expanding ${filePath}...`);

      const expanded = expandCompressedCode(content);
      fs.writeFileSync(fullPath, expanded, 'utf8');

      const newLineCount = expanded.split('\n').length;
      console.log(`✅ Expanded from ${lineCount} to ${newLineCount} lines`);
      successCount++;
    } else {
      console.log(`✅ ${filePath} appears to be already formatted`);
      successCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    failCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('✨ Formatting complete!');
console.log(`✅ Success: ${successCount} files`);
console.log(`❌ Failed: ${failCount} files`);

if (failCount === 0) {
  console.log('\n✅ All files have been expanded successfully!');
  console.log('Next step: Run "npm run format" to apply prettier formatting');
} else {
  console.log('\n⚠️  Some files failed to process. Check the errors above.');
  process.exit(1);
}
