# Fixing localhost Connection Issues on macOS

## The Problem

You're experiencing ERR_CONNECTION_REFUSED when trying to access localhost, even
though:

- The server is starting successfully
- Ports are available
- The loopback interface is up
- Python servers work (curl can connect)

This suggests the issue is specific to your browser or system configuration.

## Immediate Solutions to Try

### 1. Use 127.0.0.1 Instead of localhost

```bash
# Instead of: http://localhost:3000
# Try: http://127.0.0.1:3000
```

### 2. Clear Chrome's DNS Cache

1. Open Chrome
2. Go to: `chrome://net-internals/#dns`
3. Click "Clear host cache"
4. Go to: `chrome://net-internals/#sockets`
5. Click "Flush socket pools"

### 3. Reset Chrome Settings

1. Chrome Settings > Advanced > Reset and clean up
2. "Restore settings to their original defaults"

### 4. Check Chrome Proxy Settings

1. Chrome Settings > Advanced > System
2. "Open your computer's proxy settings"
3. Ensure no proxy is configured for localhost

### 5. Terminal Commands to Fix

```bash
# Kill all Chrome processes
killall "Google Chrome"

# Clear DNS cache (run in Terminal)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Reset network settings
sudo ifconfig lo0 down
sudo ifconfig lo0 up

# Test with curl first
curl http://127.0.0.1:3000
```

### 6. Alternative Browsers

Try accessing the development server with:

- Safari: http://127.0.0.1:3000
- Firefox: http://127.0.0.1:3000
- Terminal: `curl http://127.0.0.1:3000`

### 7. Check /etc/hosts

```bash
# Verify localhost is mapped correctly
cat /etc/hosts | grep localhost
# Should show:
# 127.0.0.1	localhost
# ::1         localhost
```

### 8. Disable Extensions

1. Open Chrome in Incognito mode (Cmd+Shift+N)
2. Try accessing http://127.0.0.1:3000
3. If it works, an extension is blocking connections

### 9. macOS Firewall

1. System Preferences > Security & Privacy > Firewall
2. Click "Firewall Options"
3. Ensure "Block all incoming connections" is NOT checked
4. Add Node.js to allowed apps if needed

### 10. Last Resort - Full Reset

```bash
# 1. Restart your Mac
# 2. After restart, run:
npm run dev:stop
rm -rf .next
rm -rf node_modules/.cache
npm run dev

# 3. Access via IP instead of localhost:
# http://127.0.0.1:3000
```

## Working Alternative

Since Python servers work with curl, the issue is likely Chrome-specific. Use:

1. **Different browser**: Safari or Firefox
2. **Direct IP**: http://127.0.0.1:3000 instead of localhost
3. **Network IP**: http://192.168.1.194:3000

## Root Cause

The issue appears to be:

- Chrome's DNS resolution for localhost
- A Chrome security setting blocking local connections
- An extension interfering with localhost
- macOS security software blocking Chrome specifically

The fact that curl works but Chrome doesn't confirms this is a browser/system
interaction issue, not a server problem.
