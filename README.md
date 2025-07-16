# AI Search Analyzer

A professional web application that analyzes websites for optimization across major AI search platforms (ChatGPT, Claude, Perplexity, Gemini).

## 🎯 What It Does

Instantly analyze any website to see how well it's optimized for AI search engines. Get actionable insights to improve your visibility in AI-powered search results.

## ✨ Features

- **🤖 AI Platform Analysis**: Comprehensive scoring for ChatGPT, Claude, Perplexity, and Gemini
- **📊 5-Pillar AI-First Scoring**: 100-point system optimized for AI retrieval and comprehension
- **🔍 Website Comparison**: Compare two websites side-by-side to benchmark performance
- **🎮 Gamified Experience**: Engaging animations and encouraging messages make optimization fun
- **✨ Emotional Results Reveal**: 4-stage animated score presentation that builds anticipation
- **🎯 Friendly Recommendations**: Interactive cards with time estimates and progress tracking
- **⚔️ Battle Mode Comparisons**: Exciting VS animations for website competitions
- **⚡ Instant Results**: Get your analysis in seconds with delightful animations
- **💡 Actionable Insights**: Specific recommendations with examples from your actual content
- **🎨 Clean Interface**: Professional, minimalist design with engaging interactions
- **🧪 Comprehensive Testing**: Full test coverage ensuring reliable analysis

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
1. Enter a website URL in the input field
2. Click "Analyze" to start the experience
3. Enjoy the animated score reveal with encouraging messages
4. Explore your detailed breakdown with friendly explanations
5. Click on recommendation cards to see personalized fixes
6. Track your progress with time estimates and completion buttons

### Website Comparison (Battle Mode!)
1. Click "Compare Websites" to enter battle mode
2. Enter two website URLs for the competition
3. Click "Compare" to start the VS animation
4. Watch the dual score counting and crown the winner
5. View the enhanced comparison with:
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
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Jest](https://jestjs.io/) with React Testing Library
- **Deployment**: [Vercel](https://vercel.com/)
- **Architecture**: Client-side analysis with serverless API routes
- **Development**: 100% AI-driven using Claude Code in Cursor

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

## 🔜 Roadmap

- [ ] User accounts and saved analyses
- [ ] Bulk URL analysis
- [ ] API access for developers
- [ ] Competitor comparison
- [ ] Weekly monitoring and alerts
- [ ] Export reports (PDF/CSV)
- [ ] Chrome extension
- [ ] WordPress plugin

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

## 📊 Performance

- **Build Status**: ✅ Production Ready (v2.3.0)
- **Test Coverage**: Comprehensive unit and integration tests
- **Lighthouse Score**: 95+ Performance
- **Accessibility**: WCAG 2.1 AA compliant
- **User Experience**: Engaging animations with optimal timing
- **TypeScript**: Strict mode with full type safety

---

**Note**: This tool analyzes publicly accessible website data only. Some websites may block analysis due to CORS restrictions. The tool respects robots.txt and implements responsible crawling practices.