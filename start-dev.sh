#!/bin/bash

# Kill any existing processes
pkill -f "next dev" 2>/dev/null || true
killall node 2>/dev/null || true

# Wait for processes to die
sleep 2

# Clear Next.js cache
rm -rf .next

# Start the dev server with explicit settings
echo "Starting Next.js development server..."
HOST=127.0.0.1 PORT=3000 npm run dev