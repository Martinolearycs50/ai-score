# AI Search Analyzer

A comprehensive web application that analyzes websites for AI search engine optimization. Get your AI Search Score and actionable recommendations to improve visibility in AI-powered search platforms like ChatGPT, Claude, and Perplexity.

## 🆕 Freemium Model

The AI Search Analyzer now offers two tiers:

### Free Tier (Default)
- 5 analyses per month
- AI Search Score (0-100)
- Simple performance ratings (Excellent/Good/Fair/Poor/Critical)
- Basic overview of strengths and weaknesses
- Access with default URL or `?tier=free`

### Pro Tier ($39/month)
- 30 analyses per month
- Everything in Free tier, plus:
- Detailed pillar breakdowns with exact scores
- Personalized, actionable recommendations
- Content-aware suggestions with examples
- Time estimates and implementation guides
- Website profile analysis
- Access with `?tier=pro`

## 🎯 What It Does

The AI Search Analyzer evaluates any website URL and provides:
- An overall AI Search Score (0-100)
- Analysis across 5 key pillars
- Performance ratings for each pillar
- **Pro only**: Detailed recommendations, scores, and implementation guides
- **Pro only**: Side-by-side website comparisons

> **📖 For detailed technical documentation, see [MVP_DOCUMENTATION.md](./MVP_DOCUMENTATION.md)**
> **🏗️ For current technical requirements and architecture, see [TECHNICAL_REQUIREMENTS.md](./TECHNICAL_REQUIREMENTS.md)**

## ✨ Key Features

### Core Functionality
- **🎯 AI Search Score**: Get a comprehensive 0-100 score for your website
- **📊 5-Pillar Analysis**: Detailed breakdown across Retrieval, Fact Density, Structure, Trust, and Recency
- **🔍 Page Type Detection**: Automatic identification of homepage, article, product, and other page types
- **💡 Smart Recommendations**: Context-aware suggestions based on your content and page type
- **⚡ Website Comparison**: Analyze two websites side-by-side with visual comparisons

### User Experience
- **✨ Emotional Score Reveal**: Animated presentation with encouraging messages
- **🎨 Interactive UI**: Smooth animations powered by Framer Motion
- **📱 Responsive Design**: Works perfectly on all devices
- **🚀 Fast Analysis**: Results in 2-5 seconds
- **🎯 Clear Guidance**: Step-by-step recommendations with examples

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Martinolearycs50/a-search-v2.git

# Navigate to project directory
cd a-search-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎯 Usage

### Single Website Analysis

#### Free Tier Experience
1. Enter a website URL in the input field
2. Click "Analyze" to start the analysis
3. View your AI Search Score (0-100)
4. See simple ratings for each pillar (Excellent/Good/Fair/Poor/Critical)
5. Get a general assessment of your site's AI readiness
6. Click "Upgrade to Pro" to unlock detailed insights

#### Pro Tier Experience (`?tier=pro`)
1. Enter a website URL in the input field
2. Click "Analyze" to start the experience
3. Enjoy the animated score reveal with encouraging messages
4. Explore your detailed breakdown with exact scores
5. Click on recommendation cards to see personalized fixes
6. Track your progress with time estimates and completion buttons
7. View website profile information and content analysis

### Website Comparison (Pro Only)
1. Access with `?tier=pro`
2. Click "Compare Websites" to enter battle mode
3. Enter two website URLs for the competition
4. Click "Compare" to start the VS animation
5. Watch the dual score counting and crown the winner
6. View the enhanced comparison with:
   - Animated winner announcement
   - Friendly pillar breakdowns with emojis
   - Quick Wins section for the underdog
   - Encouraging tips throughout

## 📏 AI-First Scoring System

Each website is scored out of 100 points across five AI-optimized pillars:

### 1. **RETRIEVAL (30 pts)**
How easily AI systems can access and extract your content
- **TTFB Performance**: Time to First Byte < 800ms
- **Paywall Detection**: No content blocking
- **Main Content Extraction**: Clear content structure
- **HTML Size**: Optimized page weight < 500KB

### 2. **FACT DENSITY (25 pts)**
Information richness and verifiability for AI comprehension
- **Unique Statistics**: Numerical data and measurements
- **Data Markup**: Structured data implementation
- **Citations**: Source references and links
- **Content Deduplication**: Unique, non-repetitive content

### 3. **STRUCTURE (20 pts)**
Content organization for AI parsing
- **Heading Frequency**: One heading per 100-200 words
- **Heading Depth**: Proper H1-H3 hierarchy
- **Structured Data**: Schema.org markup
- **RSS Feed**: Machine-readable content feeds

### 4. **TRUST (15 pts)**
Credibility signals for AI evaluation
- **Author Bio**: Clear author information
- **NAP Consistency**: Name, Address, Phone alignment
- **License Information**: Clear content licensing

### 5. **RECENCY (10 pts)**
Freshness indicators for AI prioritization
- **Last Modified Headers**: HTTP date headers
- **Stable Canonical URLs**: Consistent URL structure

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **State Management**: React Context + Custom Hooks
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Jest](https://jestjs.io/) with React Testing Library
- **Deployment**: [Vercel](https://vercel.com/)
- **Architecture**: Client-side analysis with serverless API routes
- **Development**: 100% AI-driven using Claude Code in Cursor

### Tier Architecture (v2.7.1+)

The application uses a feature flag architecture for tier management:

- **`tierConfig.ts`**: Single source of truth for all tier features
- **`TierContext`**: React Context managing tier state across the app
- **`useTier()` hook**: Type-safe access to features in components
- **URL-based tier detection**: `?tier=free` (default) or `?tier=pro`

This architecture eliminates prop drilling and scattered conditionals, making it easy to add new features or tiers by simply updating the configuration.

## 📂 Project Structure

```
a-search-v2/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Core business logic
│   │   ├── audit/       # Pillar-specific audit modules
│   │   ├── analyzer-new.ts    # Main analysis engine
│   │   ├── scorer-new.ts      # Scoring calculations
│   │   └── recommendations.ts # AI recommendations
│   ├── utils/           # Helper functions
│   └── middleware.ts    # Rate limiting & security
├── public/              # Static assets
├── __tests__/          # Test suites
└── docs/               # Documentation
```

## 🔌 API Reference

### POST /api/analyze

Analyzes a website for AI search optimization.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aiSearchScore": 85,
    "breakdown": {
      "RETRIEVAL": { "earned": 28, "max": 30, "checks": {...} },
      "FACT_DENSITY": { "earned": 20, "max": 25, "checks": {...} },
      "STRUCTURE": { "earned": 18, "max": 20, "checks": {...} },
      "TRUST": { "earned": 12, "max": 15, "checks": {...} },
      "RECENCY": { "earned": 7, "max": 10, "checks": {...} }
    },
    "recommendations": [
      {
        "why": "Fast page loads help AI crawlers...",
        "fix": "Implement caching and CDN...",
        "gain": 2,
        "example": { "before": "...", "after": "..." }
      }
    ]
  }
}
```

## 🎨 Design Philosophy

- **Clean & Professional**: Minimalist white/blue theme focusing on results
- **User-Friendly**: Clear explanations with no technical jargon
- **Fast & Efficient**: Instant analysis without external dependencies
- **Accessible**: High contrast, readable typography, plain language
- **AI-First**: Built specifically for modern AI search platforms

## 🔐 Security Features

- URL validation and sanitization
- Rate limiting (10 requests/hour per IP)
- CORS protection
- No data persistence (privacy-first)
- TypeScript strict mode for type safety

## 📈 Version

Current Version: **v2.7.0** (Freemium Model - Phase 1)

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Use TypeScript strict mode
- Follow the existing code patterns
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Martin O'Leary - [@Martinolearycs50](https://github.com/Martinolearycs50)

## 🙏 Acknowledgments

- Built with Next.js and Vercel
- Developed using Claude Code and Cursor IDE
- Inspired by the need for better AI search visibility
- Thanks to the open-source community

## 📊 Performance & Quality

- **Build Status**: ✅ Production Ready (v2.5.0)
- **Test Coverage**: Comprehensive unit and integration tests
- **Analysis Speed**: 2-5 seconds average
- **Lighthouse Score**: 95+ Performance
- **Accessibility**: WCAG 2.1 AA compliant
- **TypeScript**: Strict mode with full type safety
- **Reliability**: Handles edge cases gracefully

---

**Note**: This tool analyzes publicly accessible website data only. Some websites may block analysis due to CORS restrictions. The tool respects robots.txt and implements responsible crawling practices.