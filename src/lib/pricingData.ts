import { TierType } from './tierConfig';

// Feature comparison data structure
export interface Feature {
  name: string;
  description?: string;
  tiers: {
    free: boolean | string;
    pro: boolean | string;
    consultation: boolean | string;
  };
}

export interface FeatureCategory {
  name: string;
  features: Feature[];
}

// Pricing tier details
export interface PricingTier {
  id: TierType;
  name: string;
  price: string;
  priceDetail?: string;
  description: string;
  ctaText: string;
  ctaLink?: string;
  popular?: boolean;
  features: string[];
}

// Complete pricing data
export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceDetail: 'per month',
    description: 'Perfect for getting started with AI search analysis',
    ctaText: 'Start Free',
    features: [
      'Unlimited basic AI scoring reports',
      'Basic AI search score',
      'AI battle comparison mode'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$39',
    priceDetail: 'per month',
    description: 'Everything you need to dominate AI search results',
    ctaText: 'Get Pro Access',
    popular: true,
    features: [
      'Unlimited analyses',
      'AI-powered insights',
      'Competitor tracking',
      'AI search trend analysis',
      'CSV & PDF exports',
      'Priority support',
      'Implementation guides',
      'Score breakdown by pillar'
    ]
  },
  {
    id: 'consultation',
    name: 'Consultation',
    price: 'Custom',
    description: '1-on-1 paid consultation to create your AI search strategy',
    ctaText: 'Book a Meeting',
    ctaLink: 'https://calendly.com/your-link', // Replace with actual booking link
    features: [
      'Everything in Pro',
      '1-on-1 strategy consultation',
      'Custom AI search strategy',
      'Dedicated account manager',
      'Personalized recommendations',
      'Monthly strategy sessions',
      'White-glove onboarding',
      'Custom integrations'
    ]
  }
];

// Feature comparison table data
export const featureCategories: FeatureCategory[] = [
  {
    name: 'Core Features',
    features: [
      {
        name: 'AI Search Score Analysis',
        description: 'Basic score vs detailed breakdown',
        tiers: {
          free: 'Basic score only',
          pro: 'Detailed score breakdown',
          consultation: 'Detailed score breakdown'
        }
      },
      {
        name: 'Monthly Analyses',
        tiers: {
          free: 'Unlimited',
          pro: 'Unlimited',
          consultation: 'Unlimited'
        }
      },
      {
        name: 'Comparison Mode',
        tiers: {
          free: true,
          pro: true,
          consultation: true
        }
      },
      {
        name: 'Export Reports',
        tiers: {
          free: false,
          pro: 'CSV & PDF',
          consultation: 'CSV, PDF & Custom'
        }
      }
    ]
  },
  {
    name: 'AI Insights',
    features: [
      {
        name: 'AI-Powered Recommendations',
        tiers: {
          free: false,
          pro: true,
          consultation: true
        }
      },
      {
        name: 'Competitor Analysis',
        tiers: {
          free: false,
          pro: true,
          consultation: true
        }
      },
      {
        name: 'AI Search Trend Tracking',
        tiers: {
          free: false,
          pro: true,
          consultation: true
        }
      },
      {
        name: 'Implementation Time Estimates',
        tiers: {
          free: false,
          pro: true,
          consultation: true
        }
      }
    ]
  },
  {
    name: 'Support & Consultation',
    features: [
      {
        name: 'Email Support',
        tiers: {
          free: 'Standard',
          pro: 'Priority',
          consultation: 'Dedicated'
        }
      },
      {
        name: '1-on-1 Consultations',
        tiers: {
          free: false,
          pro: false,
          consultation: 'Weekly/Monthly'
        }
      },
      {
        name: 'Custom AI Search Strategy',
        tiers: {
          free: false,
          pro: false,
          consultation: true
        }
      },
      {
        name: 'Account Manager',
        tiers: {
          free: false,
          pro: false,
          consultation: true
        }
      }
    ]
  }
];

// FAQ data
export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export const faqs: FAQ[] = [
  {
    question: 'Can I switch between plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to Pro features. When downgrading, you\'ll keep Pro features until the end of your billing period.',
    category: 'Billing'
  },
  {
    question: 'What\'s the difference between Free and Pro?',
    answer: 'Free gives you unlimited basic AI search scores to track your progress. Pro unlocks the full detailed analysis including specific recommendations, implementation guides, and trend tracking to help you improve your AI search visibility.',
    category: 'Features'
  },
  {
    question: 'How many analyses can I run?',
    answer: 'Both Free and Pro users get unlimited analyses! The difference is in the depth of analysis - Free users get the basic AI search score, while Pro users get detailed breakdowns and recommendations.',
    category: 'Features'
  },
  {
    question: 'How does the consultation tier work?',
    answer: 'Our consultation tier is a 1-on-1 paid consultation where our AI search experts understand your specific needs and create a custom strategy and implementation plan for you to execute. It\'s perfect for businesses wanting expert guidance to maximize their AI search visibility.',
    category: 'Consultation'
  },
  {
    question: 'What\'s included in the AI-powered insights?',
    answer: 'Our AI analyzes your content against top-performing competitors, identifies AI search trends, provides actionable recommendations, and estimates implementation time for each suggestion. It\'s like having an AI search expert available 24/7!',
    category: 'Features'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You\'ll continue to have access until the end of your current billing period.',
    category: 'Billing'
  },
  {
    question: 'How do exports work?',
    answer: 'Pro users can export their analyses as CSV files for data analysis or PDF reports for sharing with clients or team members. Consultation tier gets custom-branded exports.',
    category: 'Features'
  },
  {
    question: 'What kind of support do I get?',
    answer: 'Free users get standard email support (48-hour response time). Pro users get priority support (24-hour response time). Consultation users get a dedicated account manager and instant support.',
    category: 'Support'
  },
  {
    question: 'Can I use this for multiple websites?',
    answer: 'Yes! All plans allow you to analyze any website. Free users can analyze 5 different pages per month, while Pro and Consultation users can analyze unlimited websites and pages.',
    category: 'Features'
  }
];

// Value propositions to display between sections
export const valuePropositions = [
  {
    icon: '⏱️',
    title: 'Save 10+ Hours Per Week',
    description: 'Automate your AI search analysis and get instant insights that would take hours to compile manually.'
  },
  {
    icon: '🚀',
    title: 'Outrank Your Competition',
    description: 'See exactly what top-ranking sites do differently and get actionable steps to beat them.'
  },
  {
    icon: '📈',
    title: 'Track Real Progress',
    description: 'Monitor your AI search improvements over time and celebrate every visibility win.'
  },
  {
    icon: '🎯',
    title: 'Expert Guidance On-Demand',
    description: 'Get personalized AI search strategies from experts who understand your business goals.'
  }
];

// Trust signals
export const trustSignals = [
  {
    icon: '🔒',
    text: 'Bank-Level Security'
  },
  {
    icon: '⚡',
    text: 'No Credit Card Required for Free'
  },
  {
    icon: '🚀',
    text: 'Instant AI Analysis'
  },
  {
    icon: '✨',
    text: 'Trusted by Growing Businesses'
  }
];