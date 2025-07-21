# AI Search Score

A web application that analyzes websites for AI/LLM visibility. Find out if
ChatGPT, Claude, Perplexity, and other AI tools will mention your site.

## 🎯 What It Does

AI Search Score evaluates any website URL and provides:

- An overall AI Search Score (0-100)
- Analysis across 5 key pillars optimized for AI discovery
- Intelligent page type detection (Homepage, Blog, Product)
- Actionable recommendations to improve AI visibility

## ✨ Key Features

### Free Tier (Current Focus)

- **🎯 AI Search Score**: Comprehensive 0-100 score for your website
- **📊 5-Pillar Analysis**: Detailed breakdown with visual progress bars
- **🔍 Smart Page Detection**: Automatically identifies page type with manual
  override
- **💡 Recommendations**: All issues identified with clear fixes
- **⚡ Two-Phase Analysis**: Instant results enhanced with API data
- **📱 Responsive Design**: Works perfectly on all devices
- **🚀 No Signup Required**: Start analyzing immediately

### Coming Soon: Pro Tier ($29/month)

- AI-powered content optimization
- Side-by-side before/after comparisons
- Export functionality
- Historical tracking
- 30 monthly scans

## 🚀 Getting Started

Visit [AI Search Score](https://yourdomain.com) to start analyzing your website
immediately. No signup required.

## 🎯 How to Use

1. **Enter URL**: Type any website URL (must include https://)
2. **Analyze**: Click "Analyze Now - Free" to start
3. **View Results**: See your score, breakdown, and recommendations
4. **Page Type**: System auto-detects but you can manually change it
5. **Take Action**: Follow recommendations to improve your score

## 📏 AI-First Scoring System

Each website is scored across five AI-optimized pillars with dynamic weights
based on page type:

| Pillar           | What It Measures           | Homepage | Blog/Article | Product |
| ---------------- | -------------------------- | -------- | ------------ | ------- |
| **RETRIEVAL**    | Speed & crawler access     | 35%      | 25%          | 25%     |
| **FACT_DENSITY** | Statistics & data richness | 15%      | 35%          | 30%     |
| **STRUCTURE**    | Content organization       | 25%      | 20%          | 25%     |
| **TRUST**        | Credibility signals        | 20%      | 10%          | 15%     |
| **RECENCY**      | Content freshness          | 5%       | 10%          | 5%      |

### What We Analyze

**RETRIEVAL**: Page load speed, robots.txt permissions, sitemap presence,
accessibility

**FACT_DENSITY**: Statistics, named entities, citations, examples, structured
data

**STRUCTURE**: Heading hierarchy, schema markup, semantic HTML, FAQ sections

**TRUST**: HTTPS, author info, publication dates, contact pages, citations

**RECENCY**: Last modified dates, content updates, current references

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **APIs**: Chrome UX Report, Cloudflare Workers
- **Deployment**: Vercel
- **Development**: 100% AI-driven using Claude Code in Cursor

## 🎨 Design Philosophy

- **Clean & Professional**: Minimalist white/blue theme
- **User-Friendly**: No technical jargon
- **Fast & Accurate**: Two-phase analysis approach
- **Transparent**: Shows what we check and why
- **Actionable**: Clear steps to improve

## 🔐 Security & Privacy

- URL validation and sanitization
- Rate limiting (10 requests/hour per IP)
- No data storage - completely stateless
- No cookies or tracking
- HTTPS only for external requests

## 📈 Accuracy

- **Phase 1**: Instant client-side analysis (~70% accuracy)
- **Phase 2**: API-enhanced results (~90% accuracy)
- Real performance data from Chrome UX Report
- Cross-origin checks via Cloudflare Workers

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome UX Report API key (free)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-search-analyzer-v2.git
cd ai-search-analyzer-v2
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Add your Chrome UX Report API key to `.env.local`:

```
CHROME_UX_API_KEY=your_api_key_here
```

> **Getting a Chrome UX Report API Key (Free)**:
>
> 1. Go to [Google Cloud Console](https://console.cloud.google.com/)
> 2. Create a new project or select existing
> 3. Enable the Chrome UX Report API
> 4. Create credentials (API Key)
> 5. Copy the API key to your `.env.local`
>
> The free tier includes 1,000 requests per day.

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests (requires API key)
CHROME_UX_API_KEY=your_key npm test -- chromeUxReport.integration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and Vercel
- Developed using Claude Code and Cursor IDE
- Inspired by the need for better AI search visibility

---

**Note**: This tool analyzes publicly accessible website data only. It respects
robots.txt and implements responsible crawling practices. Some sites may block
analysis due to security policies.
