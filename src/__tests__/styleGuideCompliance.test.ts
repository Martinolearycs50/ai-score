import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Define the color values from STYLE_GUIDE.md
const STYLE_GUIDE_COLORS = {
  // Primary colors
  primary: '#2D2A7F',
  accent: '#3F8CFF',
  background: '#F4F6FA',
  foreground: '#1F2937',
  text: '#4B5563',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#3DDC97',
  warning: '#F59E0B',
  error: '#EF4444',
  card: '#FFFFFF',

  // Additional theme colors
  documentation: '#8B5CF6',
  winner: '#059669',
  outstanding: '#10B981',
  journey: '#EC4899',

  // Gray scale
  'gray-50': '#F9FAFB',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',

  // Blue scale
  'blue-50': '#EFF6FF',
  'blue-100': '#DBEAFE',
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',

  // Additional colors found in codebase
  'green-600': '#059669',
  'green-700': '#047857',
  'purple-500': '#8B5CF6',
  'purple-600': '#7C3AED',
  'pink-500': '#EC4899',
  'pink-600': '#DB2777',
  'teal-500': '#14B8A6',
  'orange-500': '#F97316',
};

// Comprehensive patterns to detect hardcoded colors
const HARDCODED_COLOR_PATTERNS = [
  // Hex colors (more strict - must be in quotes or after : or =)
  /(?:[:,=]\s*["'`]?)#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?(?![\w-])/g,
  // RGB/RGBA colors
  /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)/g,
  // HSL/HSLA colors
  /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(,\s*[\d.]+\s*)?\)/g,
];

// Color words that should use CSS variables
const COLOR_WORD_PATTERNS = [
  /(?:color|backgroundColor|background|borderColor|fill|stroke):\s*["']?(purple|pink|blue|green|red|yellow|orange|teal|indigo|gray|grey)["']?/g,
];

// Patterns for Tailwind color classes that should use CSS variables
const TAILWIND_COLOR_PATTERNS = [
  // Standard color utilities
  /\b(?:bg|text|border|ring|divide|placeholder)-(gray|grey|blue|green|red|yellow|amber|purple|pink|indigo|teal|orange)-(?:50|100|200|300|400|500|600|700|800|900)\b/g,
  // Gradient utilities
  /\b(?:from|via|to)-(gray|grey|blue|green|red|yellow|amber|purple|pink|indigo|teal|orange)-(?:50|100|200|300|400|500|600|700|800|900)\b/g,
  // White/black utilities
  /\b(?:bg|text|border)-(?:white|black)\b/g,
  // Opacity modifiers
  /\b(?:bg|text|border|ring)-(gray|grey|blue|green|red|yellow|amber|purple|pink|indigo|teal|orange)-(?:50|100|200|300|400|500|600|700|800|900)\/\d+\b/g,
];

// Patterns for colors in JavaScript/TypeScript code
const JS_COLOR_PATTERNS = [
  // Color properties in objects
  /(?:color|backgroundColor|background|borderColor|fill|stroke|boxShadow|textColor|bgColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|outlineColor):\s*["'`](#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)["'`]/g,
  // Framer Motion animate props
  /animate:\s*{[^}]*(?:color|backgroundColor|background|borderColor):\s*["'`](#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\))["'`][^}]*}/g,
  // Initial/exit props in Framer Motion
  /(?:initial|exit|whileHover|whileTap):\s*{[^}]*(?:color|backgroundColor|background|borderColor):\s*["'`](#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\))["'`][^}]*}/g,
];

// Shadow patterns that might contain colors
const SHADOW_PATTERNS = [
  /boxShadow:\s*["'`][^"'`]*(?:rgba?\([^)]+\)|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})[^"'`]*["'`]/g,
  /shadow:\s*["'`][^"'`]*(?:rgba?\([^)]+\)|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})[^"'`]*["'`]/g,
];

// CSS variable patterns
const CSS_VAR_PATTERN = /var\s*\(\s*--[\w-]+\s*\)/g;
const CSS_VARS_OBJECT_PATTERN = /cssVars\.\w+/g;

// More restrictive allowed exceptions
const ALLOWED_EXCEPTIONS = [
  'stroke="none"',
  'fill="none"',
  'fill="currentColor"',
  'stroke="currentColor"',
  'stopColor', // For gradients
  'offset=', // For gradients
  'd="', // SVG paths
  'viewBox=',
  'xmlns=',
  'clipRule=',
  'fillRule=',
];

// Common test patterns to exclude
const TEST_PATTERNS = ['describe(', 'test(', 'expect(', 'it(', 'mock', 'Mock', 'spy', 'Spy'];

function isAllowedException(line: string, match: string, filePath: string): boolean {
  // Skip test files for color word patterns
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return true;
  }

  // Skip if it's a test assertion
  for (const pattern of TEST_PATTERNS) {
    if (line.includes(pattern)) {
      return true;
    }
  }

  // Check allowed exceptions
  for (const exception of ALLOWED_EXCEPTIONS) {
    if (line.includes(exception)) {
      return true;
    }
  }

  // Allow pure black/white with opacity in shadows ONLY if using CSS variable
  if (match.includes('rgba')) {
    const isBlackWhite = match.match(/rgba\s*\(\s*(0|255)\s*,\s*(0|255)\s*,\s*(0|255)\s*,/);
    if (isBlackWhite) {
      // Check if line also contains CSS variable usage
      if (line.includes('var(--') || line.includes('${') || line.includes('cssVars.')) {
        return true;
      }
    }
  }

  // Allow if it's a CSS variable reference
  if (match.includes('var(--')) {
    return true;
  }

  // Disallow everything else
  return false;
}

function getFilesToTest(): string[] {
  const files: string[] = [];
  const srcDir = path.join(__dirname, '..');

  function walkDir(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip test directories and node_modules
        if (
          !item.includes('test') &&
          item !== 'node_modules' &&
          item !== '.next' &&
          item !== '__snapshots__'
        ) {
          walkDir(fullPath);
        }
      } else if (
        item.endsWith('.tsx') ||
        item.endsWith('.ts') ||
        item.endsWith('.jsx') ||
        item.endsWith('.js')
      ) {
        files.push(fullPath);
      }
    }
  }

  walkDir(srcDir);
  return files;
}

describe('Style Guide Compliance Tests', () => {
  const filesToTest = getFilesToTest();
  const allViolations: { file: string; violations: string[] }[] = [];

  test.each(filesToTest)('File %s should not contain hardcoded colors', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: string[] = [];

    lines.forEach((line, lineNumber) => {
      // Skip commented lines
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith('/*')
      ) {
        return;
      }

      // Check for hardcoded hex/rgb/hsl colors
      for (const pattern of HARDCODED_COLOR_PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          for (const match of matches) {
            const colorValue = match[0];

            // Skip if it's an allowed exception
            if (isAllowedException(line, colorValue, filePath)) {
              continue;
            }

            // Check if this is a style guide color being hardcoded
            const normalizedColor = colorValue.replace(/['"` ]/g, '').toUpperCase();
            const isStyleGuideColor = Object.values(STYLE_GUIDE_COLORS).some(
              (color) => color.toUpperCase() === normalizedColor.replace(/^[:,=]\s*/, '')
            );

            violations.push(
              `Line ${lineNumber + 1}: Hardcoded color "${colorValue}"${isStyleGuideColor ? ' (style guide color - use CSS variable)' : ''}`
            );
          }
        }
      }

      // Check for color words
      for (const pattern of COLOR_WORD_PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        for (const match of matches) {
          if (!isAllowedException(line, match[0], filePath)) {
            violations.push(
              `Line ${lineNumber + 1}: Color word "${match[1]}" should use CSS variable`
            );
          }
        }
      }

      // Check for JS color patterns
      for (const pattern of JS_COLOR_PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        for (const match of matches) {
          if (!isAllowedException(line, match[0], filePath)) {
            violations.push(
              `Line ${lineNumber + 1}: JS color property "${match[0]}" should use CSS variable`
            );
          }
        }
      }

      // Check for shadow patterns
      for (const pattern of SHADOW_PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        for (const match of matches) {
          if (!isAllowedException(line, match[0], filePath)) {
            violations.push(
              `Line ${lineNumber + 1}: Shadow with hardcoded color "${match[0]}" should use CSS shadow variable`
            );
          }
        }
      }
    });

    if (violations.length > 0) {
      allViolations.push({ file: filePath, violations });
      console.log(`\nViolations in ${path.relative(process.cwd(), filePath)}:`);
      violations.forEach((v) => console.log(`  ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  test.each(filesToTest)('File %s should not use Tailwind color classes', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: string[] = [];

    lines.forEach((line, lineNumber) => {
      // Skip commented lines
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith('/*')
      ) {
        return;
      }

      // Check for Tailwind color classes
      for (const pattern of TAILWIND_COLOR_PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          for (const match of matches) {
            // Skip if line contains CSS variable usage nearby
            if (line.includes('var(--') || line.includes('cssVars.') || line.includes('${')) {
              continue;
            }

            violations.push(
              `Line ${lineNumber + 1}: Tailwind class "${match[0]}" should use CSS variable`
            );
          }
        }
      }
    });

    if (violations.length > 0) {
      console.log(`\nTailwind violations in ${path.relative(process.cwd(), filePath)}:`);
      violations.forEach((v) => console.log(`  ${v}`));
    }

    expect(violations).toHaveLength(0);
  });

  test('All CSS variables in code should match STYLE_GUIDE.md', () => {
    const cssVarsInCode = new Set<string>();

    // Collect all CSS variables used in code
    filesToTest.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const varMatches = content.match(CSS_VAR_PATTERN);
      const cssVarsMatches = content.match(CSS_VARS_OBJECT_PATTERN);

      if (varMatches) {
        varMatches.forEach((match) => {
          const varName = match.match(/--[\w-]+/)?.[0];
          if (varName) {
            cssVarsInCode.add(varName);
          }
        });
      }
    });

    // Define expected CSS variables from style guide
    const expectedVars = new Set([
      '--primary',
      '--accent',
      '--background',
      '--foreground',
      '--text',
      '--muted',
      '--border',
      '--success',
      '--warning',
      '--error',
      '--card',
      '--documentation',
      '--winner',
      '--outstanding',
      '--journey',
      '--gray-50',
      '--gray-100',
      '--gray-200',
      '--gray-300',
      '--gray-400',
      '--gray-500',
      '--gray-600',
      '--gray-700',
      '--gray-800',
      '--gray-900',
      '--blue-50',
      '--blue-100',
      '--blue-500',
      '--blue-600',
      '--shadow-sm',
      '--shadow-md',
      '--shadow-hover',
      '--space-xs',
      '--space-sm',
      '--space-md',
      '--space-lg',
      '--space-xl',
      '--space-2xl',
      '--space-3xl',
      '--transition',
      '--foreground-muted',
    ]);

    // Check for undefined CSS variables
    const undefinedVars: string[] = [];
    cssVarsInCode.forEach((varName) => {
      if (!expectedVars.has(varName)) {
        undefinedVars.push(varName);
      }
    });

    if (undefinedVars.length > 0) {
      console.log('\nUndefined CSS variables found:');
      undefinedVars.forEach((v) => console.log(`  ${v}`));
    }

    expect(undefinedVars).toHaveLength(0);
  });

  test('Summary of all violations', () => {
    const totalViolations = allViolations.reduce((sum, item) => sum + item.violations.length, 0);
    console.log('\n\n========== STYLE GUIDE COMPLIANCE SUMMARY ==========');
    console.log(`Total files with violations: ${allViolations.length}`);
    console.log(`Total violations found: ${totalViolations}`);

    if (allViolations.length > 0) {
      console.log('\nViolations by file:');
      allViolations
        .sort((a, b) => b.violations.length - a.violations.length)
        .forEach(({ file, violations }) => {
          console.log(`  ${path.relative(process.cwd(), file)}: ${violations.length} violations`);
        });
    }

    console.log('====================================================\n');

    // This test always passes - it's just for reporting
    expect(true).toBe(true);
  });
});
