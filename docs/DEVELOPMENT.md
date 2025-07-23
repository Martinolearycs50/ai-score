# AI Search Score - Development Guide

> Complete guide for local development, debugging, testing, and common issues

## Table of Contents

- [Quick Start](#quick-start)
- [Development Commands](#development-commands)
- [Debugging](#debugging)
- [Testing](#testing)
- [Common Issues & Fixes](#common-issues--fixes)
- [Security Best Practices](#security-best-practices)
- [Development Workflow](#development-workflow)

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd ai-search-analyzer-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 2. Environment Variables

Create `.env.local` from the template:

```bash
# Optional - for enhanced features
CHROME_UX_API_KEY=your_api_key_here
NEXT_PUBLIC_WORKER_URL=your_worker_url_here

# Feature flags
NEXT_PUBLIC_ENABLE_DYNAMIC_SCORING=true
NEXT_PUBLIC_ENABLE_PRO_FEATURES=false
NEXT_PUBLIC_ENABLE_PROGRESSIVE_ENHANCEMENT=true
```

### 3. Access the Application

- **Free tier**: http://localhost:3000
- **Pro tier**: http://localhost:3000/?tier=pro
- **API test**: http://localhost:3000/api/analyze (POST)

## Development Commands

### Server Management

```bash
npm run dev              # Primary dev server (auto port detection)
npm run dev:simple       # Basic Next.js dev (fallback option)
npm run dev:stable       # Alternative stable dev server
npm run dev:pm2          # PM2-managed dev server

# PM2 management
npm run dev:stop         # Stop all dev servers
npm run dev:restart      # Stop and restart servers
npm run dev:status       # Check PM2 process status
npm run dev:logs        # View PM2 logs
```

### Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm test -- [pattern]    # Run specific tests (e.g., npm test -- scorer)
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # E2E tests with UI
npm run test:e2e:headed  # E2E tests with visible browser
npm run test:api         # Run API integration tests
```

### Build & Quality

```bash
npm run build           # Build for production
npm run lint            # Check code quality
npm run format          # Format all files
npm run format:check    # Check formatting
npm run format:fix      # Auto-fix formatting and linting
npm run format:verify   # Verify formatting
npm start               # Run production server
```

### Diagnostics

```bash
node scripts/diagnose.js    # Diagnose connection issues
./scripts/check-styles.sh   # Check style compliance
```

## Debugging

### Quick Debug Steps

1. **Start the dev server**

   ```bash
   npm run dev
   ```

2. **Test API directly**

   ```bash
   # Create test file: test-api.js
   const url = 'https://example.com';
   fetch('http://localhost:3000/api/analyze', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ url })
   }).then(r => r.json()).then(console.log);
   ```

3. **Check browser console**
   - All debug logs appear in development mode
   - Look for API responses and error messages

4. **Check Network tab**
   - Verify API calls to `/api/analyze`
   - Check response status and payload

### Debug Information Locations

- **Frontend logs**: Browser console (dev mode only)
- **Backend logs**: Terminal running dev server
- **API responses**: Network tab in browser DevTools
- **Test output**: Terminal when running tests

### Common Debug Scenarios

#### "Failed to fetch" Error

- Browser extension blocking requests
- Solution: Test in incognito mode or disable extensions

#### No Console Logs

- Check `NODE_ENV` is set to `development`
- Restart dev server

#### API Returns 404

- Verify server is running on port 3000
- Check if another process is using the port

#### Local URLs Blocked

- The app blocks localhost/internal URLs for security
- Use external URLs for testing (e.g., https://example.com)

## Testing

### Test Structure

```
src/
├── __tests__/                    # General tests
│   ├── e2e/                     # E2E tests
│   └── *.test.ts               # Integration tests
├── lib/
│   ├── __tests__/              # Library tests
│   └── audit/__tests__/        # Audit module tests
└── components/*.test.tsx        # Component tests
```

### Testing Strategy

#### Unit Tests (70% of tests)

- Business logic in `/lib`
- Scoring algorithms
- Utility functions
- Individual audit modules

#### Integration Tests (20% of tests)

- API endpoints
- External service integration
- Error handling flows

#### E2E Tests (10% of tests)

- Critical user journeys
- Form submissions
- Results display

### Writing Tests

#### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from '@/components/ScoreDisplay';

test('displays score correctly', () => {
  render(<ScoreDisplay score={85} />);
  expect(screen.getByText('85')).toBeInTheDocument();
});
```

#### API Test Example

```typescript
test('analyze endpoint validates URLs', async () => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ url: 'invalid-url' }),
  });
  expect(response.status).toBe(400);
});
```

### Coverage Requirements

- **Audit modules**: 90%+ coverage required
- **Scoring logic**: 100% for calculations
- **API routes**: Full error scenario coverage
- **UI components**: Critical paths covered

## Common Issues & Fixes

### Connection Issues

#### localhost Not Working

```bash
# Use IP address instead
http://127.0.0.1:3000

# Clear Chrome DNS cache
chrome://net-internals/#dns

# Reset network interface (Mac)
sudo ifconfig lo0 down && sudo ifconfig lo0 up
```

#### Port Conflicts

```bash
# Check what's using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use the built-in command
npm run dev:stop
```

### Next.js Issues

#### Cache Problems

```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
```

#### Build Errors

```bash
# Check for TypeScript errors
npm run build

# Fix formatting issues
npm run format:fix
```

### Browser Extension Conflicts

1. Test in incognito mode
2. Create a development Chrome profile
3. Disable extensions for localhost
4. Use Firefox/Safari as alternatives

### Code Formatting Issues

#### Prevent Code Compression

- Always use `npm run format`
- Never use external formatters
- Don't use online code formatters
- Let pre-commit hooks handle formatting

#### Fix Compressed Files

```bash
# Revert to last commit
git checkout -- path/to/file

# Or run the formatter
npm run format:fix
```

## Security Best Practices

### API Security

- ✅ URL validation with Zod schemas
- ✅ Rate limiting (50 requests/hour per IP)
- ✅ Generic error messages to users
- ✅ No access to internal/local URLs
- ✅ Input sanitization on all endpoints

### Environment Variables

- ❌ Never commit `.env.local`
- ✅ Use `.env.example` as template
- ✅ Document all required variables
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/prod

### Code Security

```javascript
// ❌ Bad
const apiKey = "sk-abc123def456";

// ✅ Good
const apiKey = process.env.API_KEY;
```

### Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review before updating
npm outdated
```

## Development Workflow

### Starting a New Feature

1. **Read PROJECT_VISION.md** for current state
2. **Create git checkpoint**
   ```bash
   git add . && git commit -m "chore: checkpoint before [feature]"
   ```
3. **Start dev server**
   ```bash
   npm run dev
   ```
4. **Update documentation** as you work

### While Coding

- ✅ Follow existing patterns in codebase
- ✅ Use semantic color tokens (see docs/GLOBAL_STYLE_SYSTEM.md)
- ✅ Test at 375px width (mobile first)
- ✅ Handle loading and error states
- ✅ Add appropriate TypeScript types

### Before Committing

1. **Format code**

   ```bash
   npm run format:check
   ```

2. **Run tests**

   ```bash
   npm test
   ```

3. **Build check**

   ```bash
   npm run build
   ```

4. **Update docs**
   - Add to CHANGELOG.md if user-facing
   - Update PROJECT_VISION.md if needed

### Terminal Notifications (AI Assistants)

When requesting user approval, play a chime:

```bash
afplay /System/Library/Sounds/Glass.aiff
```

## Troubleshooting Quick Reference

| Issue              | Solution                          |
| ------------------ | --------------------------------- |
| "Failed to fetch"  | Test in incognito mode            |
| Port 3000 in use   | `npm run dev:stop`                |
| No console logs    | Check NODE_ENV=development        |
| Build fails        | `npm run format:fix` then rebuild |
| Tests fail         | Check `.env.test` exists          |
| Styles not loading | `rm -rf .next && npm run dev`     |

## Additional Resources

- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Style Guide**: See [GLOBAL_STYLE_SYSTEM.md](./GLOBAL_STYLE_SYSTEM.md)
- **Project Vision**: See [PROJECT_VISION.md](../PROJECT_VISION.md)
- **AI Instructions**: See [CLAUDE.md](../CLAUDE.md)
