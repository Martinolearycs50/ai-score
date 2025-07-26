#!/bin/bash

# Cloudflare Worker Deployment Script
# This script helps deploy the AI Search Worker to Cloudflare

set -e

echo "🚀 AI Search Worker Deployment Script"
echo "====================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "src/index.ts" ]; then
    echo "❌ Please run this script from the workers/ai-search-worker directory"
    exit 1
fi

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "📝 Creating wrangler.toml configuration..."
    
    cat > wrangler.toml << 'EOF'
name = "ai-search-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
# KV namespace will be created automatically

durable_objects.bindings = [
  { name = "RATE_LIMITER", class_name = "RateLimiter" }
]

[[migrations]]
tag = "v1"
new_classes = ["RateLimiter"]
EOF
    echo "✅ Created wrangler.toml"
fi

# Check authentication
echo ""
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please authenticate with Cloudflare:"
    wrangler login
fi

# Create KV namespace if it doesn't exist
echo ""
echo "📦 Setting up KV namespace for caching..."
KV_OUTPUT=$(wrangler kv:namespace create "CACHE" 2>&1 || true)

if [[ $KV_OUTPUT == *"already exists"* ]]; then
    echo "✅ KV namespace already exists"
    # Try to get the ID from existing namespaces
    echo "Please add your KV namespace ID to wrangler.toml manually"
else
    # Extract the ID from the output
    KV_ID=$(echo "$KV_OUTPUT" | grep -oE 'id = "[^"]+' | cut -d'"' -f2)
    if [ ! -z "$KV_ID" ]; then
        echo "✅ Created KV namespace with ID: $KV_ID"
        # Update wrangler.toml with the KV namespace
        sed -i.bak '/\[env.production\]/a\
kv_namespaces = [\
  { binding = "CACHE", id = "'$KV_ID'" }\
]' wrangler.toml
        rm wrangler.toml.bak
    fi
fi

# Deploy the worker
echo ""
echo "🚀 Deploying worker to Cloudflare..."
DEPLOY_OUTPUT=$(wrangler deploy 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract the worker URL
WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+\.workers\.dev' | head -1)

if [ ! -z "$WORKER_URL" ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your worker URL is: $WORKER_URL"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add this to your .env.local file:"
    echo "   NEXT_PUBLIC_WORKER_URL=$WORKER_URL"
    echo ""
    echo "2. Restart your development server"
    echo ""
    echo "3. The analyzer will now use Cloudflare's network to fetch content!"
else
    echo ""
    echo "⚠️  Could not extract worker URL from output."
    echo "Please check the output above for your worker URL."
fi

echo ""
echo "💡 Tip: Monitor your worker at https://dash.cloudflare.com/"
echo ""