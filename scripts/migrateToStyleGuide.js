#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color mappings from Tailwind to CSS variables
const TAILWIND_TO_CSS_VAR_MAP = {
  // Backgrounds
  'bg-white': 'bg-card',
  'bg-black': 'bg-foreground',
  'bg-gray-50': 'bg-gray-50',
  'bg-gray-100': 'bg-gray-100',
  'bg-gray-200': "style={{ backgroundColor: 'var(--gray-200)' }}",
  'bg-gray-900': "style={{ backgroundColor: 'var(--gray-900)' }}",
  'bg-blue-50': "style={{ backgroundColor: 'var(--blue-50)' }}",
  'bg-blue-100': "style={{ backgroundColor: 'var(--blue-100)' }}",
  'bg-blue-600': "style={{ backgroundColor: 'var(--accent)' }}",
  'bg-green-50': "style={{ backgroundColor: 'var(--success)10' }}",
  'bg-green-100': "style={{ backgroundColor: 'var(--success)20' }}",
  'bg-purple-50': "style={{ backgroundColor: 'var(--primary)10' }}",
  'bg-purple-100': "style={{ backgroundColor: 'var(--primary)20' }}",

  // Text colors
  'text-white': "style={{ color: 'white' }}",
  'text-gray-400': 'text-muted',
  'text-gray-500': 'text-muted',
  'text-gray-600': 'text-body',
  'text-gray-700': 'text-body',
  'text-gray-900': 'text-foreground',
  'text-blue-600': 'text-accent',
  'text-blue-700': "style={{ color: 'var(--accent)' }}",
  'text-blue-900': "style={{ color: 'var(--accent)' }}",
  'text-green-600': "style={{ color: 'var(--success)' }}",
  'text-green-700': "style={{ color: 'var(--winner)' }}",
  'text-purple-600': 'text-primary',

  // Borders
  'border-gray-200': 'border-default',
  'border-gray-300': "style={{ borderColor: 'var(--gray-300)' }}",
  'border-gray-900': "style={{ borderColor: 'var(--gray-900)' }}",
  'border-blue-200': "style={{ borderColor: 'var(--accent)40' }}",
  'border-purple-200': "style={{ borderColor: 'var(--primary)40' }}",

  // Gradients
  'from-blue-500': "style={{ background: 'linear-gradient(to right, var(--accent),' }}",
  'to-purple-600': "'var(--documentation))' }}",
  'from-purple-600': "style={{ background: 'linear-gradient(to right, var(--documentation),' }}",
  'to-pink-500': "'var(--journey))' }}",
  'from-green-50': "style={{ background: 'linear-gradient(to right, var(--success)10,' }}",
  'to-blue-50': "'var(--accent)10)' }}",
};

// Hex color to CSS variable mappings
const HEX_TO_CSS_VAR_MAP = {
  '#2D2A7F': 'var(--primary)',
  '#3F8CFF': 'var(--accent)',
  '#F4F6FA': 'var(--background)',
  '#1F2937': 'var(--foreground)',
  '#4B5563': 'var(--text)',
  '#6B7280': 'var(--muted)',
  '#E5E7EB': 'var(--border)',
  '#3DDC97': 'var(--success)',
  '#F59E0B': 'var(--warning)',
  '#EF4444': 'var(--error)',
  '#FFFFFF': 'var(--card)',
  '#8B5CF6': 'var(--documentation)',
  '#059669': 'var(--winner)',
  '#10B981': 'var(--outstanding)',
  '#EC4899': 'var(--journey)',
  '#14B8A6': 'var(--outstanding)', // Teal to outstanding
  '#F97316': 'var(--warning)', // Orange to warning
  '#7C3AED': 'var(--documentation)', // Purple-600
  '#DB2777': 'var(--journey)', // Pink-600
  '#111827': 'var(--gray-900)',
  '#3B82F6': 'var(--blue-500)',
  '#2563EB': 'var(--blue-600)',
};

// Shadow replacements
const SHADOW_REPLACEMENTS = [
  {
    pattern: /boxShadow:\s*['"`]0 10px 30px rgba\(0, 0, 0, 0\.15\)['"`]/g,
    replacement: "boxShadow: 'var(--shadow-default)'",
  },
  {
    pattern: /boxShadow:\s*['"`]0 20px 50px rgba\(0, 0, 0, 0\.2\)['"`]/g,
    replacement: "boxShadow: 'var(--shadow-lg)'",
  },
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return { changed: false };
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let changes = [];

  // Replace Tailwind classes
  Object.entries(TAILWIND_TO_CSS_VAR_MAP).forEach(([tailwind, cssVar]) => {
    const regex = new RegExp(`\\b${tailwind}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, cssVar);
      changes.push(`Replaced ${matches.length} instances of "${tailwind}" with "${cssVar}"`);
    }
  });

  // Replace hex colors
  Object.entries(HEX_TO_CSS_VAR_MAP).forEach(([hex, cssVar]) => {
    // Match hex in various contexts
    const patterns = [
      new RegExp(`(['"\`])${hex}\\1`, 'gi'), // In quotes
      new RegExp(`:\\s*${hex}(?![0-9A-Fa-f])`, 'gi'), // After colon
      new RegExp(`fill="${hex}"`, 'gi'), // SVG fill
      new RegExp(`stroke="${hex}"`, 'gi'), // SVG stroke
    ];

    patterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match) => {
          if (match.includes('fill=')) return `fill="${cssVar}"`;
          if (match.includes('stroke=')) return `stroke="${cssVar}"`;
          if (match.startsWith(':')) return `: ${cssVar}`;
          return match.replace(hex, cssVar);
        });
        changes.push(`Replaced hex color ${hex}`);
      }
    });
  });

  // Replace shadow patterns
  SHADOW_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes.push(`Replaced shadow pattern`);
    }
  });

  // Replace color words in style props
  const colorWordPattern =
    /(?:color|backgroundColor|background):\s*['"`](purple|pink|blue|green|red|yellow|orange|teal|indigo|gray|grey)['"`]/g;
  const colorWordMatches = content.match(colorWordPattern);
  if (colorWordMatches) {
    content = content.replace(colorWordPattern, (match, color) => {
      const varMap = {
        purple: 'var(--primary)',
        pink: 'var(--journey)',
        blue: 'var(--accent)',
        green: 'var(--success)',
        red: 'var(--error)',
        yellow: 'var(--warning)',
        orange: 'var(--warning)',
        teal: 'var(--outstanding)',
        gray: 'var(--muted)',
        grey: 'var(--muted)',
      };
      return match.replace(color, varMap[color] || color);
    });
    changes.push(`Replaced color word properties`);
  }

  // Replace rgba colors with CSS variables where possible
  const rgbaPattern = /rgba\(255,\s*255,\s*255,\s*(0\.\d+)\)/g;
  content = content.replace(rgbaPattern, (match, opacity) => {
    const opacityMap = {
      0.5: 'var(--white-50)',
      0.7: 'var(--white-70)',
      0.9: 'var(--white-90)',
      0.95: 'var(--white-95)',
    };
    return opacityMap[opacity] || match;
  });

  const blackRgbaPattern = /rgba\(0,\s*0,\s*0,\s*(0\.\d+)\)/g;
  content = content.replace(blackRgbaPattern, (match, opacity) => {
    const opacityMap = {
      0.05: 'var(--black-5)',
      0.1: 'var(--black-10)',
      0.15: 'var(--black-15)',
      0.2: 'var(--black-20)',
    };
    return opacityMap[opacity] || match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return { changed: true, changes };
  }

  return { changed: false };
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('test') && file !== 'node_modules' && file !== '.next') {
        walkDir(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  });
}

// Main execution
console.log('🎨 Starting style guide migration...\n');

const srcDir = path.join(__dirname, '..', 'src');
let totalFiles = 0;
let changedFiles = 0;

walkDir(srcDir, (filePath) => {
  totalFiles++;
  const result = processFile(filePath);

  if (result.changed) {
    changedFiles++;
    console.log(`✅ ${path.relative(srcDir, filePath)}`);
    result.changes.forEach((change) => console.log(`   - ${change}`));
  }
});

console.log(`\n🎉 Migration complete!`);
console.log(`📊 Processed ${totalFiles} files, updated ${changedFiles} files`);
console.log(`\n⚠️  Note: Some replacements may need manual review, especially:`);
console.log(`   - Complex gradient patterns`);
console.log(`   - Inline styles that were converted`);
console.log(`   - Color opacity combinations`);
console.log(`\n🧪 Run 'npm test styleGuideCompliance' to check remaining violations`);
