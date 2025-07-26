# Cloudflare Worker Setup Guide

This guide will help you deploy and configure the Cloudflare Worker to bypass bot blockers and improve analysis accuracy.

## Why Use the Cloudflare Worker?

The Cloudflare Worker acts as a proxy for fetching web content, which helps avoid bot detection because:
- Requests come from Cloudflare's trusted IP addresses
- No browser automation signatures
- Built-in caching reduces load on target sites
- Edge network provides better performance

## Prerequisites

1. A Cloudflare account (free tier is sufficient)
2. Node.js installed locally
3. Wrangler CLI (Cloudflare's deployment tool)

## Step 1: Install Wrangler

```bash
npm install -g wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

## Step 3: Configure the Worker

1. Navigate to the worker directory:
   ```bash
   cd workers/ai-search-worker
   ```

2. Create a `wrangler.toml` file:
   ```toml
   name = "ai-search-worker"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"
   
   [env.production]
   kv_namespaces = [
     { binding = "CACHE", id = "YOUR_KV_NAMESPACE_ID" }
   ]
   
   durable_objects.bindings = [
     { name = "RATE_LIMITER", class_name = "RateLimiter" }
   ]
   
   [[migrations]]
   tag = "v1"
   new_classes = ["RateLimiter"]
   ```

## Step 4: Create KV Namespace

```bash
# Create a KV namespace for caching
wrangler kv:namespace create "CACHE"
```

Copy the ID from the output and update `wrangler.toml` with your KV namespace ID.

## Step 5: Deploy the Worker

```bash
# Deploy to Cloudflare
wrangler deploy
```

The output will show your worker URL, something like:
```
https://ai-search-worker.your-subdomain.workers.dev
```

## Step 6: Configure Your Application

1. Copy your worker URL from the deployment output

2. Add it to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_WORKER_URL=https://ai-search-worker.your-subdomain.workers.dev
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 7: Verify It's Working

1. Check the console logs when analyzing a URL - you should see:
   ```
   [Progressive Enhancement] Using Cloudflare Worker for cross-origin request
   ```

2. Try analyzing sites that were previously blocked (like stripe.com)

## How It Works

When enabled, the application will:
1. First attempt direct analysis
2. If that fails or returns minimal content, use the Cloudflare Worker
3. Merge results for the best accuracy

## Monitoring Usage

View your worker analytics in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your worker
3. View Analytics tab

## Troubleshooting

### Worker returns 500 errors
- Check wrangler logs: `wrangler tail`
- Ensure KV namespace is properly configured

### Still getting blocked
- Some sites may block Cloudflare Workers too
- Consider implementing request delays
- Rotate user agents in the worker

### CORS errors
- The worker already includes CORS headers
- Ensure your `NEXT_PUBLIC_WORKER_URL` is correct

## Cost Considerations

Cloudflare Workers Free Tier includes:
- 100,000 requests per day
- 10ms CPU time per request
- Sufficient for most use cases

For higher volume, consider the paid plan ($5/month).

## Security Notes

- The worker is publicly accessible but rate-limited
- Don't store sensitive data in KV storage
- Consider adding an API key for additional security

## Next Steps

1. Monitor performance and accuracy improvements
2. Customize the worker for specific needs
3. Add more sophisticated bot avoidance techniques if needed