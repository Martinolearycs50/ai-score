#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with prettier errors
const filesWithErrors = [
  'src/__mocks__/cheerio.ts',
  'src/components/DynamicWeightIndicator.tsx',
  'src/components/EmailCaptureForm.tsx',
  'src/components/UrlForm.test.tsx',
  'src/lib/businessPersonas.ts',
  'src/lib/narrativeEngine.ts',
  'src/lib/progressiveEnhancement.ts',
  'src/lib/types.ts',
  'src/utils/contentVerification.ts',
  'src/utils/validators.test.ts'
];

console.log('🔧 Fixing compressed files by rewriting them...\n');

filesWithErrors.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    console.log(`📝 Processing ${filePath}...`);
    
    // Read the file
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Create a temporary file with .tmp extension
    const tmpPath = fullPath + '.tmp';
    
    // Write content to temp file
    fs.writeFileSync(tmpPath, content, 'utf8');
    
    // Try to format with prettier, ignoring errors
    try {
      execSync(`npx prettier --write "${tmpPath}" --no-error-on-unmatched-pattern`, { 
        stdio: 'pipe' 
      });
      
      // If prettier succeeded, use the formatted content
      const formattedContent = fs.readFileSync(tmpPath, 'utf8');
      fs.writeFileSync(fullPath, formattedContent, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    } catch (prettierError) {
      // If prettier failed, try to fix common issues
      console.log(`⚠️  Prettier failed for ${filePath}, attempting manual fixes...`);
      
      let fixed = content;
      
      // Fix common syntax errors
      fixed = fixed
        // Fix missing semicolons after closing braces
        .replace(/\}(\s*)([a-zA-Z])/g, '};$1$2')
        // Fix missing semicolons after statements
        .replace(/([a-zA-Z0-9\)\]])(\s*\n\s*)([a-zA-Z])/g, '$1;$2$3')
        // Fix compressed single-line files
        .replace(/;(?!\s*\n)/g, ';\n')
        .replace(/\{(?!\s*\n)/g, '{\n')
        .replace(/\}(?!\s*[;,\)])/g, '}\n')
        // Fix return statements
        .replace(/return\s+{/g, 'return {\n')
        // Fix compressed exports
        .replace(/export\s+(const|let|var|function|class|interface|type|enum)/g, '\nexport $1');
      
      // Write the manually fixed content
      fs.writeFileSync(fullPath, fixed, 'utf8');
      
      // Try prettier again
      try {
        execSync(`npx prettier --write "${fullPath}" --no-error-on-unmatched-pattern`, { 
          stdio: 'pipe' 
        });
        console.log(`✅ Fixed ${filePath} with manual corrections`);
      } catch (secondError) {
        console.log(`❌ Could not fix ${filePath} - manual intervention needed`);
      }
    }
    
    // Clean up temp file
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log('\n✅ Processing complete!');
console.log('Next step: Run "npm run format" to verify all files are fixed');