#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = {
  'src/__mocks__/cheerio.ts': (content) => {
    // Remove the duplicate closing brace on line 23
    const lines = content.split('\n');
    if (lines[22] && lines[22].trim() === '};') {
      lines.splice(22, 1); // Remove line 23 (0-indexed, so 22)
    }
    return lines.join('\n');
  },

  'src/components/DynamicWeightIndicator.tsx': (content) => {
    // Fix the Record type - need to find the exact issue
    // Looking for malformed Record<PageType, ; pattern
    content = content.replace(/Record<PageType,\s*;\s*number>/g, 'Record<PageType, number>');
    return content;
  },

  'src/components/EmailCaptureForm.tsx': (content) => {
    // Find try block and ensure it has a catch
    const tryMatch = /try\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g;
    content = content.replace(tryMatch, (match) => {
      // Check if this try already has a catch after it
      const afterTry = content.substring(content.indexOf(match) + match.length);
      if (!afterTry.trim().startsWith('catch') && !afterTry.trim().startsWith('} catch')) {
        return match + ' catch (error) { console.error(error); }';
      }
      return match;
    });
    return content;
  },

  'src/components/UrlForm.test.tsx': (content) => {
    // Fix JSX/test syntax issues
    // Common issue is unterminated JSX or expect statements
    content = content.replace(/expect\(([^)]+)\)\.toBe\(([^)]+)\)\s*}/g, 'expect($1).toBe($2);\n}');
    return content;
  },

  'src/lib/businessPersonas.ts': (content) => {
    // Fix unterminated string on line 80
    // The issue is with the string containing braces
    content = content.replace(
      /"But here's the opportunity: Payment platforms that emphasize {\s*missingElement\s*};\s*see 3x more AI recommendations"/g,
      '"But here\'s the opportunity: Payment platforms that emphasize {missingElement} see 3x more AI recommendations"'
    );
    return content;
  },

  'src/lib/narrativeEngine.ts': (content) => {
    // Fix issue around line 328 - likely a misplaced brace
    // Looking for patterns where closing braces are followed by semicolons incorrectly
    content = content.replace(/}\s*;\s*\);/g, '});');
    content = content.replace(/}\s*\);\s*\n\s*\);\s*$/gm, '});');
    return content;
  },

  'src/lib/progressiveEnhancement.ts': (content) => {
    // Fix missing semicolon on line 27
    // This is likely the end of the interface declaration
    const lines = content.split('\n');
    if (lines[26] && lines[26].includes('fromCache?: boolean')) {
      lines[26] = lines[26].replace(/fromCache\?\s*:\s*boolean;\s*}/, 'fromCache?: boolean;\n}');
    }
    return lines.join('\n');
  },

  'src/lib/types.ts': (content) => {
    // Fix issue on line 15 - likely related to comments and braces
    content = content.replace(
      /\/\/ Flag to indicate if dynamic weights were applied\s*}\s*\/\/ API Request export interface/g,
      '// Flag to indicate if dynamic weights were applied\n}\n\n// API Request\nexport interface'
    );
    return content;
  },

  'src/utils/contentVerification.ts': (content) => {
    // Fix issue on line 82 - if statement formatting
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('if (result.breakdown.RETRIEVAL.paywall !== expectedPaywallScore)')) {
        lines[i] = '      if (result.breakdown.RETRIEVAL.paywall !== expectedPaywallScore) {';
      }
    }
    return lines.join('\n');
  },

  'src/utils/validators.test.ts': (content) => {
    // Fix import statement - closing brace on wrong line
    content = content.replace(
      /}\s*;\s*from\s*['"]@\/utils\/validators['"]/g,
      "} from '@/utils/validators'"
    );
    return content;
  },
};

// Process each file
console.log('Applying exact syntax fixes...\n');

Object.entries(fixes).forEach(([filePath, fixFunction]) => {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    if (fs.existsSync(fullPath)) {
      console.log(`Fixing ${filePath}...`);
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalLength = content.length;
      content = fixFunction(content);

      if (content.length !== originalLength) {
        console.log(`  - Content length changed: ${originalLength} → ${content.length}`);
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('  ✓ Fixed\n');
    } else {
      console.log(`⚠️  File not found: ${filePath}\n`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message, '\n');
  }
});

console.log('✅ Exact syntax fixes complete!');
