// Test URL validation
function validateAndNormalizeUrl(input) {
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  const trimmed = input.trim();
  
  // Check for obvious invalid patterns
  if (trimmed.includes(' ')) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces'
    };
  }

  // Try to normalize the URL
  let normalizedUrl;
  
  try {
    // Add protocol if missing
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      normalizedUrl = `https://${trimmed}`;
    } else {
      normalizedUrl = trimmed;
    }

    // Validate with URL constructor
    const urlObj = new URL(normalizedUrl);
    
    // Additional validation checks
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return {
        isValid: false,
        error: 'Invalid domain name'
      };
    }

    // Check for localhost/internal IPs (for security)
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      return {
        isValid: false,
        error: 'Local/internal URLs are not allowed'
      };
    }

    return {
      isValid: true,
      normalizedUrl: urlObj.toString()
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., example.com or https://example.com)'
    };
  }
}

// Test the problematic URL
const testUrl = 'https://www.tap.company/en-ae';
console.log('Testing URL:', testUrl);
console.log('Result:', validateAndNormalizeUrl(testUrl));

// Test URL object creation directly
try {
  const urlObj = new URL(testUrl);
  console.log('URL object created successfully:');
  console.log('- hostname:', urlObj.hostname);
  console.log('- pathname:', urlObj.pathname);
  console.log('- toString():', urlObj.toString());
} catch (err) {
  console.log('URL object creation failed:', err.message);
}