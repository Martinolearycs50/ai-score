import * as cheerio from 'cheerio';

interface TrustScores {
  authorBio: number;      // Visible author bio & credentials (+5)
  napConsistency: number; // Consistent NAP / company imprint (+5)
  license: number;        // <meta property="og:license"> with CC-BY or equivalent (+5)
}

/**
 * Audit module for the Trust pillar (15 points max)
 * Checks: Author bio, NAP consistency, content license
 */
export async function run(html: string): Promise<TrustScores> {
  const scores: TrustScores = {
    authorBio: 0,
    napConsistency: 0,
    license: 0,
  };

  const $ = cheerio.load(html);

  // Check for visible author bio & credentials
  const authorIndicators = [
    // Schema.org author data
    $('script[type="application/ld+json"]').filter((_, el) => {
      const content = $(el).html();
      return content ? content.includes('"author"') || content.includes('"Person"') : false;
    }).length > 0,
    
    // Meta tags
    $('meta[name="author"], meta[property="article:author"]').length > 0,
    
    // Common author bio selectors
    $('.author-bio, .author-info, .author-box, .author-details, .writer-bio').length > 0,
    $('[class*="author"][class*="bio"], [class*="author"][class*="info"]').length > 0,
    $('[id*="author"][id*="bio"], [id*="author"][id*="info"]').length > 0,
    
    // Author bylines with links
    $('.byline a, .author-name a, .written-by a, .posted-by a').length > 0,
    
    // About the author sections
    $('h2, h3, h4').filter((_, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes('about the author') || text.includes('about me') || text.includes('author bio');
    }).length > 0
  ];

  scores.authorBio = authorIndicators.some(indicator => indicator) ? 5 : 0;

  // Check for consistent NAP (Name, Address, Phone) / company imprint
  const napElements = {
    // Company/organization name
    name: [
      $('meta[property="og:site_name"]').attr('content'),
      $('.company-name, .site-name, .brand-name').text(),
      $('[itemtype*="Organization"] [itemprop="name"]').text()
    ].filter(Boolean),
    
    // Address
    address: [
      $('.address, .location, .company-address').text(),
      $('[itemtype*="PostalAddress"]').text(),
      $('[itemprop="address"]').text(),
      $('footer address').text()
    ].filter(Boolean),
    
    // Phone
    phone: [
      $('a[href^="tel:"]').text(),
      $('.phone, .telephone, .contact-phone').text(),
      $('[itemprop="telephone"]').text()
    ].filter(Boolean),
    
    // Email
    email: [
      $('a[href^="mailto:"]').text(),
      $('.email, .contact-email').text(),
      $('[itemprop="email"]').text()
    ].filter(Boolean)
  };

  // Check for imprint/legal pages
  const imprintLinks = $('a').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    const href = $(el).attr('href') || '';
    return (
      text.includes('imprint') ||
      text.includes('legal notice') ||
      text.includes('terms') ||
      text.includes('privacy') ||
      text.includes('about us') ||
      text.includes('contact') ||
      href.includes('/imprint') ||
      href.includes('/legal') ||
      href.includes('/about') ||
      href.includes('/contact')
    );
  });

  // Score based on NAP completeness
  const hasName = napElements.name.length > 0;
  const hasContact = napElements.phone.length > 0 || napElements.email.length > 0;
  const hasAddress = napElements.address.length > 0;
  const hasImprint = imprintLinks.length > 0;
  
  // Need at least name + contact info OR imprint page
  scores.napConsistency = ((hasName && hasContact) || hasImprint || hasAddress) ? 5 : 0;

  // Check for content license
  const licenseIndicators = [
    // Open Graph license meta tag
    $('meta[property="og:license"]').attr('content'),
    
    // Creative Commons indicators
    $('a[rel="license"][href*="creativecommons.org"]').length > 0,
    $('[class*="cc-"], [class*="creative-commons"]').length > 0,
    
    // License text in footer
    $('footer').text().toLowerCase().includes('creative commons') ||
    $('footer').text().toLowerCase().includes('cc-by') ||
    $('footer').text().toLowerCase().includes('cc by'),
    
    // Microdata/RDFa license
    $('[property="dc:license"], [property="dcterms:license"]').length > 0,
    $('[rel="license"]').length > 0
  ];

  // Check if license is CC-BY or equivalent open license
  const licenseContent = $('meta[property="og:license"]').attr('content') || '';
  const hasOpenLicense = 
    licenseContent.toLowerCase().includes('cc-by') ||
    licenseContent.toLowerCase().includes('creative commons') ||
    licenseContent.toLowerCase().includes('mit') ||
    licenseContent.toLowerCase().includes('apache') ||
    licenseContent.toLowerCase().includes('public domain') ||
    licenseIndicators.some(indicator => indicator);

  scores.license = hasOpenLicense ? 5 : 0;

  return scores;
}