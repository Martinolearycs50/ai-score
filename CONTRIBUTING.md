# Contributing to AI Search Analyzer

## 🚨 CRITICAL: Preventing Code Compression

This project has strict formatting requirements to prevent code compression
issues that can break the application.

### What is Code Compression?

Code compression occurs when code formatters or editors incorrectly format
TypeScript/TSX files, resulting in:

- Multiple statements on a single line
- Broken syntax (e.g., `else; if` instead of `else if`)
- Malformed type definitions
- Broken import/export statements

### Prevention Guidelines

1. **Always Use Project Formatter**

   ```bash
   npm run format      # Format all files
   npm run format:check # Check formatting
   ```

2. **Never Use External Formatters**
   - Don't use VS Code's format-on-save with non-project formatters
   - Don't use online code formatters
   - Don't use AI tools to "clean up" code

3. **Pre-commit Hooks**
   - We use husky to run prettier before commits
   - If a commit is rejected, fix the formatting first

4. **Editor Configuration**
   - Use the provided `.editorconfig` file
   - Install EditorConfig plugin for your editor
   - Respect the project's line ending settings (LF)

### If You Encounter Compressed Files

1. **Do NOT manually fix syntax errors** - this often makes things worse

2. **Report immediately** with:
   - List of affected files
   - What action triggered the compression
   - Your editor and version

3. **Recovery process**:

   ```bash
   # Check git status
   git status

   # Revert if needed
   git checkout -- path/to/file

   # Or restore from backup
   cp path/to/file.backup path/to/file
   ```

### Required Checks Before PR

- [ ] Run `npm run format:check` - must pass
- [ ] Run `npm test` - must pass
- [ ] Run `npm run build` - must succeed
- [ ] No files with 0-2 line counts
- [ ] No syntax errors in TypeScript files

## Development Workflow

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Build: `npm run build`
6. Commit with descriptive message

### Code Style

- Follow the existing patterns in the codebase
- Use TypeScript for all new code
- Write tests for new features
- Keep components small and focused
- Use meaningful variable names

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all checks pass
4. Request review from maintainers
5. Address review feedback

## Questions?

Open an issue on GitHub if you need clarification on any guidelines.
