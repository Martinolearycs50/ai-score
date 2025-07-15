# Debug Guide - AI Search Analyzer

## Quick Debugging Steps

### 1. Start Dev Server
```bash
npm run dev
```
Wait for "Ready" message

### 2. Test API Directly
```bash
node test-analyze-debug.js
# or test specific URL:
node test-analyze-debug.js https://example.com
```

### 3. Check Browser Console
When clicking "Analyze" button, you should see:
- `[Debug] handleAnalyze called with URL: <your-url>`
- `[Debug] Sending request to /api/analyze`
- `[Debug] Response status: 200`
- `[Debug] Response data: {...}`

If you see errors instead, check for:
- Chrome extensions blocking requests
- Network/firewall issues
- CORS problems

### 4. Common Issues & Solutions

#### "Failed to fetch" Error
- **Cause**: Browser extension blocking requests
- **Fix**: Use incognito mode or disable extensions

#### No logs in console
- **Cause**: Dev server not in development mode
- **Fix**: Ensure `NODE_ENV` is not set to production

#### API returns 404
- **Cause**: Dev server not running or wrong port
- **Fix**: Check `npm run dev` is running on port 3000

#### "Local/internal URLs not allowed"
- **Cause**: Security validation blocking localhost
- **Fix**: Use external URLs for testing (example.com, google.com)

### 5. Debug Information Added

**Frontend (page.tsx)**:
- Logs when analyze is called
- Logs request/response details
- Logs any errors with full details

**Backend (api/analyze/route.ts)**:
- Logs incoming requests (dev only)
- Logs parsed body (dev only)
- Already has extensive error logging

All debug logs are wrapped in `if (process.env.NODE_ENV === 'development')` so they won't appear in production.

### 6. Manual Testing

Test the full flow:
1. Open http://localhost:3000
2. Open browser DevTools Console (F12)
3. Enter URL: "example.com"
4. Click "Analyze"
5. Check console for debug logs
6. Check Network tab for API request/response

### 7. Removing Debug Code

Once issue is resolved, debug code can stay as it only runs in development. No changes needed for production.