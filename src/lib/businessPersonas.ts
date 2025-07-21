import type {
  
 ExtractedContent 
} from './contentExtractor';

  interface BusinessPersona {

type: ExtractedContent['businessType'];
displayName: string;
characteristics: {
  
primaryGoals: string[];
painPoints: string[];
aiSearchNeeds: string[];
typicalCompetitors: string[];

}
narratives: {
  
recognition: string;
// Initial recognition message curiosityGap: string;
// Teaser that creates anticipation concernTrigger: string;
// Loss aversion activation hopeTrigger: string;
// Positive possibility celebrationMessage: string;
// Success message

};
recommendations: {
  
priorities: string[];
// Which scoring pillars matter most quickWins: string[];
// Easy improvements with big impact specificTips: string[];
// Persona-specific advice

};
};
 
export const businessPersonas: Record<ExtractedContent['businessType'],
  BusinessPersona> = {
  payment: {
type: 'payment',
displayName: 'Payment Processing Platform',
  characteristics: {
  
primaryGoals: [ 'Build trust with financial institutions',
  'Demonstrate security and compliance',
  'Show global reach and reliability',
  'Highlight developer-friendly features' ],
  painPoints: [ 'Complex technical documentation',
  'Trust and security concerns',
  'Competition from established players',
  'Need for clear differentiation' ],
  aiSearchNeeds: [ 'API documentation visibility',
  'Security features prominence',
  'Integration examples and guides',
  'Success stories and case studies' ],
  typicalCompetitors: ['Stripe',
  'PayPal',
  'Square',
  'Adyen',
  'Braintree']

},
  narratives: {
recognition: "Analyzing your payment platform... We see you're competing in the financial technology space.",
curiosityGap: "Wait... we're seeing something interesting about how AI recommends payment solutions...",
concernTrigger: "While you focused on features, {competitor} is getting recommended by AI for '{searchQuery}'",
hopeTrigger: "But here's the opportunity: Payment platforms that emphasize {missingElement} see 3x more AI recommendations",
celebrationMessage: "Your payment solution is now optimized for AI discovery!"
},
  recommendations: {
  
priorities: ['TRUST',
  'STRUCTURE',
  'FACT_DENSITY'],
  quickWins: [ 'Add security certifications prominently',
  'Include processing statistics and uptime data',
  'Create comparison tables with competitors',
  'Add developer testimonials with metrics' ],
  specificTips: [ 'AI tools prioritize payment platforms that clearly state compliance (PCI-DSS, SOC2)',
  'Include specific transaction volumes and success rates',
  'Highlight unique features like instant payouts or global coverage' ] 
}

},
  ecommerce: {
type: 'ecommerce',
displayName: 'E-commerce Store',
  characteristics: {
  
primaryGoals: [ 'Drive product discovery',
  'Build brand trust',
  'Increase conversion rates',
  'Stand out from marketplace giants' ],
  painPoints: [ 'Competition from Amazon and large retailers',
  'Product descriptions lack detail',
  'Limited brand story visibility',
  'Missing social proof elements' ],
  aiSearchNeeds: [ 'Detailed product specifications',
  'Customer reviews and ratings',
  'Unique value propositions',
  'Category and use-case clarity' ],
  typicalCompetitors: ['Amazon',
  'Shopify stores',
  'Etsy sellers',
  'Brand-specific stores']

},
narratives: {
 recognition: "Analyzing your e-commerce store... We see you're selling {
  
mainProduct
};
 to {
  
targetAudience
}
.",
curiosityGap: "Interesting... AI shopping assistants are recommending your competitors for '{
  
productCategory
}
'...",
concernTrigger: "You're losing an estimated {
  
visitorCount
};
 AI-driven shoppers daily to {
  
competitor
}
",
hopeTrigger: "But with just 3 specific changes, you could capture those shoppers looking for {
  
productType
}
",
celebrationMessage: "Your products are now AI-optimized for discovery!"
},
  recommendations: {
  
priorities: ['STRUCTURE',
  'FACT_DENSITY',
  'TRUST'],
  quickWins: [ 'Add detailed product specifications in lists',
  'Include size charts and comparison guides',
  'Show customer reviews with specific details',
  'Create FAQ sections for each product category' ],
  specificTips: [ 'AI favors stores with complete product data (materials,
  dimensions,
  origin)',
  'Include "why choose us" sections with specific benefits',
  'Add structured data markup for products' ] 
}

},
  blog: {
type: 'blog',
displayName: 'Content Blog',
  characteristics: {
  
primaryGoals: [ 'Establish thought leadership',
  'Drive organic traffic',
  'Build subscriber base',
  'Monetize expertise' ],
  painPoints: [ 'Content gets buried in search results',
  'Lack of authoritative signals',
  'Missing data and statistics',
  'Weak content structure' ],
  aiSearchNeeds: [ 'Expert author information',
  'Data-backed claims',
  'Clear article structure',
  'Fresh,
  updated content' ],
  typicalCompetitors: ['Medium articles',
  'Industry publications',
  'Competitor blogs',
  'News sites']

},
narratives: {
 recognition: "Analyzing your blog about {
  
primaryTopic
}
... We see you're creating content for {
  
targetAudience
}
.",
curiosityGap: "We noticed something... When people ask AI about '{
  
topicArea
}
', they're getting different blogs...",
concernTrigger: "Your valuable insights on {
  
topic
};
 are invisible to AI, while {
  
competitor
};
 dominates AI responses",
hopeTrigger: "The good news? Blogs that implement our content optimization see AI citations within 48 hours",
celebrationMessage: "Your expertise is now AI-discoverable!"
},
  recommendations: {
  
priorities: ['RECENCY',
  'TRUST',
  'FACT_DENSITY'],
  quickWins: [ 'Add author bio with credentials',
  'Include publish and update dates',
  'Add statistics and data points',
  'Create summary boxes for key points' ],
  specificTips: [ 'AI prioritizes blogs with clear expertise signals',
  'Include numbered lists and structured content',
  'Update older posts with fresh data' ] 
}

},
  news: {
type: 'news',
displayName: 'News Publication',
  characteristics: {
  
primaryGoals: [ 'Break stories first',
  'Build credibility',
  'Increase readership',
  'Compete with major outlets' ],
  painPoints: [ 'Competition from established media',
  'Need for trust signals',
  'Content freshness requirements',
  'Attribution and sourcing' ],
  aiSearchNeeds: [ 'Clear datelines and timestamps',
  'Author credentials',
  'Source attribution',
  'Fact-checking indicators' ],
  typicalCompetitors: ['CNN',
  'BBC',
  'Reuters',
  'Local news outlets',
  'Industry publications']

},
narratives: {
 recognition: "Analyzing your news publication... We see you cover {
  
primaryTopic
};
 with a focus on {
  
location
}
.",
curiosityGap: "Curious finding... When AI summarizes news about '{
  
newsCategory
}
', certain outlets dominate...",
concernTrigger: "Breaking: Your news stories aren't being cited by AI, giving {
  
competitor
};
 the narrative control",
hopeTrigger: "But news sites with proper AI optimization see 5x more citations in AI summaries",
celebrationMessage: "Your journalism is now AI-citation ready!"
},
  recommendations: {
  
priorities: ['RECENCY',
  'TRUST',
  'STRUCTURE'],
  quickWins: [ 'Add clear datelines to all articles',
  'Include journalist bylines with credentials',
  'Create fact-check badges',
  'Add "Key Points" summaries' ],
  specificTips: [ 'AI favors news with clear sourcing and attribution',
  'Include update timestamps for developing stories',
  'Add location tags and category markers' ] 
}

},
  documentation: {
type: 'documentation',
displayName: 'Technical Documentation',
  characteristics: {
  
primaryGoals: [ 'Help developers integrate quickly',
  'Reduce support tickets',
  'Showcase API capabilities',
  'Build developer community' ],
  painPoints: [ 'Complex technical concepts',
  'Outdated examples',
  'Poor search visibility',
  'Lack of practical examples' ],
  aiSearchNeeds: [ 'Code examples that work',
  'Clear API endpoints',
  'Version information',
  'Common use cases' ],
  typicalCompetitors: ['Stack Overflow',
  'GitHub docs',
  'Competitor APIs',
  'Framework documentation']

},
narratives: {
 recognition: "Analyzing your developer documentation for {
  
mainProduct
}
... We see you're helping developers with {
  
mainService
}
.",
curiosityGap: "Interesting pattern detected... Developers are asking AI about '{
  
apiFeature
}
' but getting competitor docs...",
concernTrigger: "Your API docs are invisible to AI coding assistants, sending developers to {
  
competitor
};
 instead",
hopeTrigger: "Documentation with our optimization sees 10x more AI-driven developer traffic",
celebrationMessage: "Your docs are now the AI's go-to reference!"
},
  recommendations: {
  
priorities: ['STRUCTURE',
  'FACT_DENSITY',
  'RECENCY'],
  quickWins: [ 'Add "Last Updated" timestamps',
  'Include working code examples',
  'Create quick-start guides',
  'Add API response examples' ],
  specificTips: [ 'AI coding assistants favor docs with complete examples',
  'Include error messages and solutions',
  'Add version compatibility information' ] 
}

},
  corporate: {
type: 'corporate',
displayName: 'Corporate Website',
  characteristics: {
  
primaryGoals: [ 'Build brand awareness',
  'Attract customers and partners',
  'Recruit talent',
  'Showcase expertise' ],
  painPoints: [ 'Generic corporate messaging',
  'Lack of specific achievements',
  'Missing trust signals',
  'Weak differentiation' ],
  aiSearchNeeds: [ 'Company achievements and metrics',
  'Clear service descriptions',
  'Industry recognition',
  'Team expertise' ],
  typicalCompetitors: ['Industry leaders',
  'Consulting firms',
  'Service providers',
  'Agencies']

},
narratives: {
 recognition: "Analyzing {
  
companyName
}
... We see you're a {
  
industry
};
 company serving {
  
targetAudience
}
.",
curiosityGap: "We discovered something... When executives ask AI about '{
  
serviceType
}
', they're getting your competitors...",
concernTrigger: "Potential clients asking AI for {
  
industry
};
 solutions are being directed to {
  
competitor
}, not you",
hopeTrigger: "Companies that optimize for AI discovery see 40% more qualified leads",
celebrationMessage: "Your company is now AI-recommended!"
},
  recommendations: {
  
priorities: ['TRUST',
  'FACT_DENSITY',
  'STRUCTURE'],
  quickWins: [ 'Add specific client success metrics',
  'Include industry awards and certifications',
  'Create detailed service pages',
  'Add team member credentials' ],
  specificTips: [ 'AI favors companies with quantifiable achievements',
  'Include case studies with specific results',
  'Add industry-specific terminology' ] 
}

},
  educational: {
type: 'educational',
displayName: 'Educational Platform',
  characteristics: {
  
primaryGoals: [ 'Attract learners',
  'Demonstrate expertise',
  'Build course enrollments',
  'Establish authority' ],
  painPoints: [ 'Competition from MOOCs',
  'Need for credibility',
  'Course discovery issues',
  'Student success proof' ],
  aiSearchNeeds: [ 'Course outcomes and skills',
  'Instructor credentials',
  'Student success rates',
  'Curriculum details' ],
  typicalCompetitors: ['Coursera',
  'Udemy',
  'University programs',
  'YouTube tutorials']

},
narratives: {
 recognition: "Analyzing your educational platform... We see you teach {
  
primaryTopic
};
 to {
  
targetAudience
}
.",
curiosityGap: "Surprising discovery... When learners ask AI about '{
  
skillArea
}
', they're directed elsewhere...",
concernTrigger: "Students seeking {
  
courseType
};
 training are being sent to {
  
competitor
};
 by AI assistants",
hopeTrigger: "Educational sites with AI optimization see 3x more organic enrollments",
celebrationMessage: "Your courses are now AI-recommended!"
},
  recommendations: {
  
priorities: ['TRUST',
  'STRUCTURE',
  'FACT_DENSITY'],
  quickWins: [ 'Add instructor credentials prominently',
  'Include course completion rates',
  'Create detailed syllabi',
  'Add student testimonials with outcomes' ],
  specificTips: [ 'AI favors courses with clear learning outcomes',
  'Include job placement or success statistics',
  'Add prerequisite information clearly' ] 
}

},
  other: {
type: 'other',
displayName: 'Business Website',
  characteristics: {
  
primaryGoals: [ 'Increase visibility',
  'Build credibility',
  'Generate leads',
  'Stand out online' ],
  painPoints: [ 'Unclear messaging',
  'Lack of differentiation',
  'Missing trust signals',
  'Poor content structure' ],
  aiSearchNeeds: [ 'Clear value proposition',
  'Specific services or products',
  'Trust indicators',
  'Contact information' ],
  typicalCompetitors: ['Similar businesses',
  'Industry alternatives',
  'Local competitors']

},
  narratives: {
  
recognition: "Analyzing your website... We're learning about your unique business model.",
  curiosityGap: "We're noticing patterns in how AI discovers businesses like yours...",
  concernTrigger: "Your website is missing key signals that AI uses to recommend businesses",
  hopeTrigger: "Businesses that optimize these signals see immediate AI visibility improvements",
  celebrationMessage: "Your business is now AI-optimized!"

},
  recommendations: {
  
priorities: ['STRUCTURE',
  'TRUST',
  'FACT_DENSITY'],
  quickWins: [ 'Add clear service descriptions',
  'Include business achievements',
  'Create FAQ sections',
  'Add location and contact details' ],
  specificTips: [ 'AI needs clear understanding of what you offer',
  'Include specific benefits and outcomes',
  'Add any certifications or memberships' ] 
}
 }

};
/** * Get the business persona based on extracted content */

  
export function getBusinessPersona(extractedContent: ExtractedContent): BusinessPersona {
  
return businessPersonas[extractedContent.businessType];

}
 /** * Personalize narrative templates with actual business data */


export function personalizeNarrative( template: string,
extractedContent: ExtractedContent,
additionalData?: Record<string,
  string | number> ): string {
let personalized = template;
//  Replace with actual business attributes 
const replacements: Record<string,
  string | number> = {
  
companyName: extractedContent.contentSamples.title.split(' - ')[0] || 'your company',
  mainProduct: extractedContent.businessAttributes.mainProduct || extractedContent.productNames[0] || 'your product',
  mainService: extractedContent.businessAttributes.mainService || 'your services',
  targetAudience: extractedContent.businessAttributes.targetAudience || 'your customers',
  industry: extractedContent.businessAttributes.industry || 'your industry',
  primaryTopic: extractedContent.primaryTopic,
  location: extractedContent.businessAttributes.location || 'your area',
  ...additionalData

};
// Replace all placeholders Object.entries(replacements).forEach(([key,
value]) => {
 const regex = new RegExp(`{
${
  
key
}
}
`,
'g');
personalized = personalized.replace(regex,
String(value));
});
return personalized;
}
 /** * Get competitor examples based on business type */

  
export function getTypicalCompetitors(businessType: ExtractedContent['businessType']): string[] {
  
return businessPersonas[businessType].characteristics.typicalCompetitors;

}
 /** * Get priority improvements for a business type */


export function getPriorityImprovements( businessType: ExtractedContent['businessType'],
  currentScore: number ): string[] {
const persona = businessPersonas[businessType];
if (currentScore < 40) {
  
return persona.recommendations.quickWins;

} else if (currentScore < 70) {
  
return persona.recommendations.specificTips;

} else {
  
// For high scores,
  focus on maintaining and fine-tuning return [ 'Maintain content freshness with regular updates',
  'Monitor competitor changes and adapt',
  'Continue adding new data points and examples',
  'Expand on successful content patterns' ];

}
 }
