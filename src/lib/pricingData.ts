import { TierType } from './tierConfig';

// Feature comparison data structure
export interface Feature {
  name: string;
  description?: string;
  tiers: {
    free: boolean | string;
    pro: boolean | string;
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
    priceDetail: 'forever',
    description: 'For individuals exploring AI search visibility',
    ctaText: 'Get Started',
    features: [
      'Unlimited basic scoring',
      'AI search visibility score',
      'Comparison analysis',
      'Basic recommendations',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    priceDetail: 'per month',
    description: 'For professionals serious about AI search optimization',
    ctaText: 'Start Free Trial',
    popular: true,
    features: [
      '30 detailed analyses per month',
      'Complete score breakdown',
      'Priority recommendations',
      'Competitor insights',
      'Export to CSV & PDF',
      'Implementation guides',
      'Email support',
    ],
  },
];

// Consultation data (separate from tiers)
export const consultationService = {
  title: 'Need expert guidance?',
  description: 'Book a 1-on-1 strategy session with our AI search experts',
  price: 'Starting at $299',
  ctaText: 'Schedule Consultation',
  ctaLink: 'https://calendly.com/your-link',
  benefits: [
    'Personalized AI search audit',
    'Custom optimization strategy',
    '60-minute video session',
    'Action plan document',
  ],
};

// Feature comparison table data
export const featureCategories: FeatureCategory[] = [
  {
    name: 'Analysis & Insights',
    features: [
      {
        name: 'AI Search Score',
        tiers: { free: 'Basic score', pro: 'Detailed breakdown' },
      },
      {
        name: 'Monthly analyses',
        tiers: { free: 'Unlimited basic', pro: '30 detailed' },
      },
      {
        name: 'Recommendations',
        tiers: { free: 'Basic tips', pro: 'Priority action plan' },
      },
      {
        name: 'Competitor analysis',
        tiers: { free: false, pro: true },
      },
      {
        name: 'Export capabilities',
        tiers: { free: false, pro: 'CSV & PDF' },
      },
    ],
  },
  {
    name: 'Support',
    features: [
      {
        name: 'Email support',
        tiers: { free: 'Standard (48h)', pro: 'Priority (24h)' },
      },
      {
        name: 'Implementation guides',
        tiers: { free: false, pro: true },
      },
      {
        name: 'API access',
        tiers: { free: false, pro: 'Coming soon' },
      },
    ],
  },
];

// FAQ data
export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export const faqs: FAQ[] = [
  {
    question: 'How does billing work?',
    answer:
      'We offer simple monthly billing. Upgrade to Pro anytime and get instant access to all features. Cancel anytime with no penalties.',
    category: 'Billing',
  },
  {
    question: "What's the difference between Free and Pro?",
    answer:
      'Free gives you unlimited basic scores to track your AI search visibility. Pro provides detailed analysis with actionable recommendations, competitor insights, and export capabilities for serious optimization.',
    category: 'Features',
  },
  {
    question: 'What counts as an analysis?',
    answer:
      'Free users get unlimited basic score checks. Pro users get 30 detailed analyses per month, which include full breakdowns, recommendations, and competitor comparisons.',
    category: 'Features',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Pro users can export all analyses as CSV files for data analysis or PDF reports for sharing with stakeholders.',
    category: 'Features',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes. We offer a 14-day money-back guarantee for Pro subscriptions. Try it risk-free.',
    category: 'Billing',
  },
  {
    question: 'How do I get expert help?',
    answer:
      'Beyond our Pro features, we offer one-on-one consultation sessions for businesses needing personalized AI search strategies. Book a session anytime.',
    category: 'Support',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. Try Pro free for 14 days. No credit card required to start.',
    category: 'Billing',
  },
  {
    question: 'Which AI platforms do you track?',
    answer:
      'We analyze visibility across ChatGPT, Claude, Perplexity, and other major AI search platforms.',
    category: 'Features',
  },
];

// Value propositions to display between sections
export const valuePropositions = [
  {
    title: 'Instant Analysis',
    description: 'Get comprehensive AI search visibility scores in seconds, not hours.',
  },
  {
    title: 'Actionable Insights',
    description: 'Receive specific recommendations tailored to your content and industry.',
  },
  {
    title: 'Track Progress',
    description: 'Monitor improvements and benchmark against competitors over time.',
  },
  {
    title: 'Export Reports',
    description: 'Share professional reports with stakeholders and track ROI.',
  },
];

// Trust signals
export const trustSignals = [
  { text: '14-day free trial' },
  { text: 'No credit card required' },
  { text: 'Cancel anytime' },
  { text: 'SSL encrypted' },
];
