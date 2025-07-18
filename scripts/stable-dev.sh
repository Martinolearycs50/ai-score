#!/bin/bash

echo "🧹 Cleaning up..."
# Kill any existing processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

# Wait a moment
sleep 1

# Clear caches
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "🚀 Starting development server..."
echo "   This will auto-restart if it crashes"
echo ""

# Use nodemon for auto-restart on crash
npx nodemon --exec "next dev" --watch src --ext js,jsx,ts,tsx,json