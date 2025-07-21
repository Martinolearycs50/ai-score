# Development Server Guide

## Quick Start

```bash
# Start the development server (recommended)
npm run dev

# If having issues, diagnose first
node scripts/diagnose.js

# Alternative commands
npm run dev:simple    # Basic Next.js dev server
npm run dev:pm2      # Use PM2 process manager
npm run dev:restart  # Stop everything and restart
```

## Available Commands

| Command               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | Start server with automatic port detection and health checks |
| `npm run dev:stop`    | Stop all development servers                                 |
| `npm run dev:restart` | Stop and restart the server                                  |
| `npm run dev:status`  | Check server status (PM2)                                    |
| `npm run dev:logs`    | View server logs (PM2)                                       |
| `npm run dev:simple`  | Basic Next.js dev (fallback)                                 |

## Features

### 1. **Automatic Port Detection**

- Tries port 3000 first
- Falls back to 3001, 3002, 8080, 8081
- Cleans up blocked ports automatically

### 2. **Health Checks**

- Waits for server to be truly ready
- Shows clear success/error messages
- Automatic retry on failure

### 3. **Process Management**

- Kills zombie processes
- Clears Next.js cache on start
- Graceful shutdown on CTRL+C

### 4. **Network Diagnostics**

- Shows both localhost and network URLs
- Detects common issues
- Provides clear troubleshooting steps

## Troubleshooting

### Connection Refused Errors

1. **Run diagnostics:**

   ```bash
   node scripts/diagnose.js
   ```

2. **Common fixes:**
   - Restart your computer (clears network state)
   - Check firewall settings
   - Disable VPN/proxy temporarily
   - Try incognito browser window

3. **macOS Firewall:**
   - Go to System Preferences > Security & Privacy > Firewall
   - Click "Firewall Options"
   - Add Node.js to allowed applications

### Port Already in Use

```bash
# Stop all processes
npm run dev:stop

# Check what's using ports
lsof -i :3000

# Force kill if needed
kill -9 <PID>
```

### Next.js Errors

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
```

## Access URLs

Once running, access the app at:

- **Free tier**: http://localhost:3000
- **Pro tier**: http://localhost:3000/?tier=pro
- **Consultation**: http://localhost:3000/?tier=consultation

## Architecture

The development setup uses a multi-layered approach:

1. **Primary**: Custom Node.js script with health checks
2. **Fallback**: PM2 process manager for stability
3. **Emergency**: Direct Next.js dev server

This ensures maximum stability and clear error messages.
