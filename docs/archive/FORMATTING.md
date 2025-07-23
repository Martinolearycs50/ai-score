# Code Formatting Protection

This project uses automated formatting protection to prevent code compression
and maintain readability across all development environments.

## 🛠️ Tools Used

- **Prettier**: Primary code formatter with anti-compression rules
- **EditorConfig**: Cross-editor consistency
- **Husky**: Git hooks for automation
- **lint-staged**: Stage-specific formatting
- **ESLint**: Code quality and style enforcement

## 🚀 Quick Setup Verification

```bash
# Check if formatting protection is working
npm run format:verify

# Test formatting on a single file
npm run format:check src/components/example.tsx
```

## 📋 Configuration Overview

### Anti-Compression Rules (.prettierrc)

- **printWidth: 100** - Prevents extreme line compression
- **bracketSameLine: false** - JSX brackets on new lines for readability
- **singleQuote: true** - Consistent quote style
- **Import sorting** - Organized imports (React → Next → External → Internal)
- **Tailwind sorting** - Consistent CSS class ordering

### Cross-Editor Consistency (.editorconfig)

- **LF line endings** - Unix-style line endings everywhere
- **2-space indentation** - Consistent across all file types
- **UTF-8 encoding** - Universal character support
- **Trim trailing whitespace** - Clean formatting

### Git Protection (.gitattributes)

- **text=auto eol=lf** - Forces consistent line endings in git
- **Binary file detection** - Prevents corruption of images/fonts
- **Lock file handling** - Preserves package-lock.json integrity

## 🔒 Automated Protection

### Pre-commit Hooks

Every commit automatically:

1. ✅ Formats staged files with Prettier
2. ✅ Fixes ESLint issues automatically
3. ✅ Runs quick tests to ensure quality
4. ❌ **Blocks commit if formatting fails**

### Development Scripts

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Format only staged files (used by git hook)
npm run format:staged

# Format and fix all linting issues
npm run format:fix

# Verify setup is working correctly
npm run format:verify
```

### Build Protection

- `npm run dev` - Checks formatting before starting
- `npm run build` - Verifies formatting before building
- `npm run dev:simple` - Bypass for quick development

## 🎯 What This Prevents

### ❌ Single-Line Compression

**Before:**

```typescript
import { useState } from 'react'; import { motion } from 'framer-motion'; export default function Component() { const [state, setState] = useState(false); return <div>{state ? 'true' : 'false'}</div>; }
```

**After:**

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Component() {
  const [state, setState] = useState(false);

  return <div>{state ? 'true' : 'false'}</div>;
}
```

### ❌ Inconsistent Import Order

**Before:**

```typescript
import { useState } from 'react';

import { NextPage } from 'next';

import axios from 'axios';

import { MyComponent } from './MyComponent';
```

**After:**

```typescript
import { useState } from 'react';

import { NextPage } from 'next';

import axios from 'axios';

import { MyComponent } from './MyComponent';
```

### ❌ Messy Tailwind Classes

**Before:**

```jsx
<div className="text-white bg-blue-500 p-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
```

**After:**

```jsx
<div className="rounded-lg bg-blue-500 p-4 text-white shadow-md transition-colors hover:bg-blue-600">
```

## 🚨 Troubleshooting

### Formatting Check Fails

```bash
# See which files have formatting issues
npm run format:check

# Fix all formatting issues
npm run format

# Verify the fix worked
npm run format:verify
```

### Pre-commit Hook Not Running

```bash
# Check git hooks configuration
git config core.hooksPath

# Should output: .husky

# If not set:
git config core.hooksPath .husky

# Make hook executable
chmod +x .husky/pre-commit
```

### Import Sorting Issues

The import sorter organizes imports in this order:

1. React imports
2. Next.js imports
3. External packages (npm modules)
4. Internal imports (`@/` paths)
5. Relative imports (`./` and `../`)

### Editor Integration

**Claude Code / Command Line:**

- Formatting happens automatically via git hooks
- Use `npm run format` before major commits

**VS Code (if used):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.requireConfig": true
}
```

## 📁 Protected Files

### Automatically Formatted

- `*.{js,jsx,ts,tsx}` - All JavaScript/TypeScript
- `*.{json,css,scss}` - Config and styles
- `*.md` - Documentation (with special rules)

### Ignored Files (.prettierignore)

- `node_modules/` - Dependencies
- `.next/` - Build outputs
- `coverage/` - Test reports
- `*.min.*` - Minified files
- `package-lock.json` - Lock files

## 🔧 Advanced Configuration

### Disable Formatting for Specific Code

```javascript
// prettier-ignore
const uglyCode = { a:1,b:2,c:3 };

/* prettier-ignore */
const matrix = [
  1,0,0,
  0,1,0,
  0,0,1
];
```

### Bypass Git Hooks (Emergency)

```bash
# Skip pre-commit hooks (use sparingly!)
git commit --no-verify -m "emergency commit"

# Better: Fix formatting first
npm run format
git add .
git commit -m "fix: restore proper formatting"
```

### Custom Prettier Config

The `.prettierrc` file can be modified for project-specific needs:

```json
{
  "printWidth": 120, // Longer lines for wide monitors
  "semi": false, // No semicolons
  "singleQuote": false // Double quotes
}
```

## 🏗️ CI/CD Integration

### GitHub Actions Example

```yaml
- name: Check code formatting
  run: npm run format:check

- name: Lint code
  run: npm run lint
```

### Vercel Build

The build automatically checks formatting via `npm run build`, which includes
`npm run format:check`.

## 📈 Benefits

1. **Prevents Critical Bugs** - No more single-line compression causing runtime
   errors
2. **Team Consistency** - Everyone's code looks the same
3. **Faster Code Reviews** - No style discussions needed
4. **Better Git Diffs** - Clean, readable change history
5. **Cross-Editor Support** - Works with any development environment
6. **Automated Enforcement** - No manual formatting needed

## 🆘 Emergency Recovery

If files get corrupted again:

```bash
# Format everything
npm run format

# Verify it worked
npm run format:verify

# Commit the fixes
git add .
git commit -m "fix: restore proper code formatting

- Fixed single-line compression issues
- Restored proper import organization
- Applied consistent code style

🤖 Generated with Claude Code"
```

This formatting protection system ensures the code quality issues you
experienced won't happen again!
