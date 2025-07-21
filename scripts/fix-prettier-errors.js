#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific fixes for each file based on prettier errors
const fixes = {
  'src/__mocks__/cheerio.ts': (content) => {
    // Fix line 23:9 - missing comma after closing brace
    content = content.replace(/}\s*;\s*\n\s*};/g, '};\n};');
    return content;
  },

  'src/components/DynamicWeightIndicator.tsx': (content) => {
    // Fix line 18:32 - malformed type definition
    content = content.replace(
      /const PILLAR_INFO: Record<keyof;\s*PillarScores,/g,
      'const PILLAR_INFO: Record<keyof PillarScores,'
    );
    return content;
  },

  'src/components/EmailCaptureForm.tsx': (content) => {
    // Fix line 54:2 - missing catch/finally after try
    // Look for try blocks without proper catch/finally
    content = content.replace(/try\s*{\s*([^}]+)}\s*;\s*catch/g, 'try {\n$1\n} catch');
    return content;
  },

  'src/components/UrlForm.test.tsx': (content) => {
    // Fix line 25:16 - JSX syntax issue
    content = content.replace(/<UrlForm;\s*onSubmit=/g, '<UrlForm\n      onSubmit=');
    return content;
  },

  'src/lib/businessPersonas.ts': (content) => {
    // Fix line 67:16 - unterminated string with braces
    content = content.replace(
      /concernTrigger: "While you focused on features, \{\s*competitor\s*};/g,
      'concernTrigger: "While you focused on features, {competitor}'
    );
    content = content.replace(
      /is getting recommended by AI for '\{\s*searchQuery\s*}'/g,
      "is getting recommended by AI for '{searchQuery}'"
    );
    return content;
  },

  'src/lib/narrativeEngine.ts': (content) => {
    // Fix line 124:1 - likely missing semicolon
    content = content.replace(/}\s*;\s*else if/g, '} else if');
    return content;
  },

  'src/lib/progressiveEnhancement.ts': (content) => {
    // Fix line 27:2 - missing semicolon after closing brace
    content = content.replace(/}\s*fromCache\?:/g, '};\n  fromCache?:');
    return content;
  },

  'src/lib/types.ts': (content) => {
    // Fix line 21:12 - export statement issue
    content = content.replace(/export;\s*interface/g, 'export interface');
    content = content.replace(
      /\/\/ API Request export;\s*interface/g,
      '// API Request\nexport interface'
    );
    content = content.replace(
      /\/\/ New pillar-based scoring for AI Search export;\s*interface/g,
      '// New pillar-based scoring for AI Search\nexport interface'
    );
    return content;
  },

  'src/utils/contentVerification.ts': (content) => {
    // Fix line 82:16 - likely conditional formatting issue
    content = content.replace(
      /if \(result\.breakdown\.RETRIEVAL\.paywall !== expectedPaywallScore\) \{\s*this\.addIssue\({\s*component:\s*'RETRIEVAL',/g,
      "if (result.breakdown.RETRIEVAL.paywall !== expectedPaywallScore) {\n            this.addIssue({\n              component: 'RETRIEVAL',"
    );
    return content;
  },

  'src/utils/validators.test.ts': (content) => {
    // Fix line 351:13 - missing semicolon
    const lines = content.split('\n');
    if (lines[350] && !lines[350].trim().endsWith(';') && !lines[350].trim().endsWith('{')) {
      lines[350] = lines[350] + ';';
    }
    return lines.join('\n');
  },
};

// Process each file
Object.entries(fixes).forEach(([file, fixFn]) => {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  console.log(`Fixing ${file}...`);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  try {
    content = fixFn(content);

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('\nDone! Now try running prettier again.');
