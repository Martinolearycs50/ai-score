# AI Search Analyzer - Claude Code Instructions

## CRITICAL: Read These First
1. Check CLAUDE_CONTEXT.md for current project state
2. Review STYLE_GUIDE.md before any UI changes

## Design Constants (NEVER CHANGE)
- Background: ALWAYS white (#FFFFFF) - no dark themes
- Primary: Blue (#3B82F6) 
- Text: Dark gray (#111827)
- Style: Clean, minimalist, encouraging

## Voice & Tone Rules
- Encouraging, not critical ("Room to grow! 🌱" not "Poor performance")
- Simple, not technical (avoid jargon)
- Personal, not corporate
- Celebrate improvements

## Development Workflow

### Before Starting ANY Feature
1. Create a commit: `git add . && git commit -m "chore: checkpoint before [feature name]"`
2. Start dev server: `npm run dev` (keep running in another terminal)
3. Open browser to http://localhost:3000
4. Read current state in CLAUDE_CONTEXT.md

### While Building Features
1. Test changes in browser as you go
2. Check both ?tier=free and ?tier=pro views
3. Verify mobile responsiveness at 375px width
4. Use React DevTools to debug if needed

### Before Completing a Feature
1. Write/update tests in __tests__ directory
2. Run tests: `npm test`
3. Verify no TypeScript errors: `npm run build`
4. Check console for any errors/warnings
5. Test the full user flow

### Documentation Updates (REQUIRED)
1. **CLAUDE_CONTEXT.md** - Add entry under "Recent Changes" with:
   - Date (YYYY-MM-DD format)
   - Version bump (e.g., v2.7.0)
   - Clear description of what changed
   - Any new limitations or known issues

2. **CHANGELOG.md** - Add entry with:
   - Version number
   - Date
   - Added/Changed/Fixed sections
   - Breaking changes (if any)

3. **README.md** - Update if:
   - New features added
   - Setup process changed
   - Dependencies changed
   - New environment variables added

4. **Code Documentation**:
   - Add JSDoc comments for new functions
   - Update type definitions in types.ts
   - Comment complex logic

### Commit Standards
- Make atomic commits (one feature/fix per commit)
- Use conventional commits: feat:, fix:, chore:, docs:
- Include all documentation updates in the commit
- Commit before switching context with /compact
- Never push directly to main without testing

### Pre-Push Checklist
- [ ] Dev server runs without errors
- [ ] Feature works in browser (free & pro modes)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] CLAUDE_CONTEXT.md updated
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)
- [ ] No console errors
- [ ] Mobile responsive

### Version Numbering
- Major (X.0.0): Breaking changes
- Minor (x.X.0): New features
- Patch (x.x.X): Bug fixes

## Component Patterns
```tsx
// Card - always use this pattern
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">

// Primary button - consistent styling
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">

// Muted text
<span className="text-gray-600">

