# AI Search Analyzer

A professional web application that analyzes websites for optimization across major AI search platforms (ChatGPT, Claude, Perplexity, Gemini).

## 🎯 What It Does

Instantly analyze any website to see how well it's optimized for AI search engines. Get actionable insights to improve your visibility in AI-powered search results.

## ✨ Features

- **🤖 AI Platform Analysis**: Comprehensive scoring for ChatGPT, Claude, Perplexity, and Gemini
- **📊 Detailed Scoring**: 100-point system across 4 key categories
- **⚡ Instant Results**: Get your analysis in seconds
- **💡 Actionable Insights**: Specific recommendations for improvement
- **🎨 Clean Interface**: Professional, minimalist design for clarity

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

## 📏 Scoring System

Each website is scored out of 100 points across four categories:

1. **Crawler Accessibility (25 pts)**
   - HTTPS validation
   - Robots.txt compliance
   - AI bot permissions

2. **Content Structure (25 pts)**
   - Heading hierarchy
   - Content readability
   - FAQ detection

3. **Technical SEO (25 pts)**
   - Meta tags optimization
   - Schema markup
   - Site performance

4. **AI Optimization (25 pts)**
   - Content freshness
   - Credibility signals
   - Structured data

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Architecture**: Client-side analysis (no backend required)

## 📂 Project Structure

```
a-search-v2/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Core business logic
├── public/          # Static assets
└── styles/          # Global styles
```

## 🎨 Design Philosophy

- **Clean & Professional**: Minimalist interface that focuses on results
- **User-Friendly**: Clear explanations for non-technical users
- **Fast & Efficient**: Instant analysis without external API calls
- **Accessible**: High contrast, readable typography

## 🔜 Roadmap

- [ ] User accounts and saved analyses
- [ ] Bulk URL analysis
- [ ] API access for developers
- [ ] Competitor comparison
- [ ] Weekly monitoring and alerts
- [ ] Export reports (PDF/CSV)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Martin O'Leary - [@Martinolearycs50](https://github.com/Martinolearycs50)

## 🙏 Acknowledgments

- Built with Next.js and Vercel
- Inspired by the need for better AI search visibility

---

**Note**: This tool analyzes publicly accessible website data only. Some websites may block analysis due to CORS restrictions.