CLAUDE.md - Technical Implementation Guide
<!-- CLAUDE CODE: This file contains HOW to build. For WHAT to build, see CLAUDE_CONTEXT.md -->
🚨 CRITICAL: Start Here
Read CLAUDE_CONTEXT.md first - it has current project state and what needs building
Review STYLE_GUIDE.md for all visual design and UI decisions
Update CLAUDE_CONTEXT.md regularly as you work (see update instructions below)
Never modify design constants without team approval
🎨 Design System
Note: For complete visual design specifications, animations, and voice/tone guidelines, see STYLE_GUIDE.md

Quick Reference Colors
css
--background: #FFFFFF  /* Pure white */
--primary: #3B82F6    /* Blue */
--text: #111827       /* Dark gray */
Voice & Tone (Summary)
✅ Encouraging: "Room to grow! 🌱"
❌ Critical: "Poor performance"
✅ Simple: "Your site loads quickly"
❌ Technical: "TTFB metrics suboptimal"
See STYLE_GUIDE.md for complete guidelines including:

Full color system with semantic colors
Score-based color coding
Typography specifications
Animation timings and principles
Component patterns
🛠️ Development Workflow
Starting Work
bash
# 1. Read current state
cat CLAUDE_CONTEXT.md  # Understand what needs building

# 2. Create checkpoint
git add . && git commit -m "chore: checkpoint before [feature]"

# 3. Start dev server
npm run dev

# 4. Open browser
http://localhost:3000       # Free tier
http://localhost:3000?tier=pro  # Pro tier (future)

# 5. Update CLAUDE_CONTEXT.md
# - Set "Last Updated" to today
# - Update "Now Working On" section
While Coding
<!-- CLAUDE CODE: Follow these patterns -->
Component Structure
tsx
// ✅ Good - Consistent card pattern
export default function FeatureName() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Content */}
    </div>
  );
}

// ❌ Bad - Inconsistent styling
<div className="bg-gray-50 rounded-xl shadow-lg p-4">
Button Patterns
tsx
// Primary CTA
<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">

// Secondary
<button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200">

// Text button
<button className="text-blue-600 hover:text-blue-700 underline">
API Patterns
typescript
// ✅ Always validate URLs
if (!isValidUrl(url)) {
  return { error: "Invalid URL" };
}

// ✅ Generic error messages
catch (error) {
  console.error(error); // Log for debugging
  return { error: "Unable to analyze website" };
}

// ✅ Rate limiting
if (rateLimiter.isLimited(ip)) {
  return { error: "Too many requests. Try again later." };
}
Testing Checklist
<!-- CLAUDE CODE: Check these before marking feature complete -->
 Works at 375px width (mobile)
 No console errors
 No TypeScript errors (npm run build)
 Loading states show correctly
 Error states handled gracefully
 Free tier shows limited features (when applicable)
📝 Documentation Updates
<!-- CLAUDE CODE: Update these files when making changes -->
1. CLAUDE_CONTEXT.md - Update Throughout Session
At Session Start:
Update "Last Updated" date
Review "Current Sprint Focus"
Check implementation progress
While Working:
Check off completed features in Implementation Progress
Add issues to "Active Issues & Blockers" as found
Update "Technical Status" with API integration details
After Completing Features:
Add entry to "Recent Changes Log" (newest at top)
Update accuracy metrics if measured
Move resolved issues to resolved section
Before Session End:
Update "Current Sprint Focus" with next priorities
Note any blockers in "Blocked/Waiting"
Final check that all progress is recorded
2. CHANGELOG.md
Add changes under [Unreleased] while working
Follow Added/Changed/Fixed format
Move to versioned section when releasing
3. README.md - Only Update When:
New user-facing features added
Setup process changes
Dependencies change
Public API changes
🏗️ Code Patterns
File Structure
typescript
// 1. Imports (React first, then external, then local)
import { useState } from 'react';
import { ExternalLib } from 'external';
import { localFunction } from '@/lib/local';

// 2. Types/Interfaces
interface Props {
  value: string;
  onChange: (value: string) => void;
}

// 3. Component
export default function ComponentName({ value, onChange }: Props) {
  // 4. Hooks
  const [state, setState] = useState('');
  
  // 5. Handlers
  const handleClick = () => {
    // logic
  };
  
  // 6. Render
  return <div>{/* JSX */}</div>;
}
Type Safety
typescript
// ✅ Always use strict types
interface AnalysisResult {
  score: number;
  breakdown: Record<string, number>;
}

// ❌ Avoid any
const result: any = getData();
🚀 Deployment
Pre-deployment Checklist
 npm run build succeeds
 No TypeScript errors
 All tests pass
 Documentation updated
 Changelog updated
Deployment Process
bash
# Automatic via GitHub
git push origin main  # Deploys to Vercel
🐛 Common Issues & Solutions
<!-- CLAUDE CODE: Add solutions as you encounter issues -->
Dev Server Issues
bash
# If styles not loading
rm -rf .next && npm run dev

# If port in use
lsof -ti:3000 | xargs kill -9
TypeScript Errors
typescript
// Missing types? Add to types.ts
export interface NewType {
  // definition
}
📋 Quick Reference
Commands
bash
npm run dev      # Start dev server
npm test         # Run tests
npm run build    # Build for production
npm run lint     # Check code quality
File Locations
/app              # Pages and API routes
/components       # React components  
/lib              # Business logic
/utils            # Helper functions
/public           # Static assets
<!-- CLAUDE CODE: Add new patterns and learnings as you discover them -->
Remember: This guide is for HOW to build. Check CLAUDE_CONTEXT.md for WHAT to build.

