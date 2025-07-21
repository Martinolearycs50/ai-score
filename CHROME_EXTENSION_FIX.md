# Chrome Extension Fetch Error Fix

## Issue

You're seeing this error when testing locally:

```
TypeError: Failed to fetch
at window.fetch (chrome-extension://hoklmmgfnpapgjgcpechhaamimifchmp/frame_ant/frame_ant.js:2:12357)
```

This is caused by a Chrome extension intercepting and blocking fetch requests.

## Solutions

### Option 1: Test in Incognito Mode

1. Open Chrome in Incognito mode (Ctrl+Shift+N or Cmd+Shift+N)
2. Navigate to http://localhost:3000
3. Extensions are usually disabled in Incognito by default

### Option 2: Disable Extension for Localhost

1. Right-click the extension icon in Chrome
2. Select "Manage Extension"
3. Look for site access settings
4. Add localhost to excluded sites

### Option 3: Use a Different Browser

Test in Firefox, Safari, or Edge to avoid the extension issue entirely.

### Option 4: Create a Chrome Profile for Development

1. Click your profile picture in Chrome
2. Click "Add" to create a new profile
3. Name it "Development"
4. Don't install problematic extensions in this profile

## Testing Production Locally

To ensure local matches what Vercel deploys:

```bash
npm run build
npm start
```

This runs the exact production build that Vercel will use.
