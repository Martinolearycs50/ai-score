// Simplified URL validation as a temporary workaround

export function simpleValidateUrl(input: string): {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
} {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }
  
  const url = input.trim();
  
  // Basic checks
  if (url.includes(' ')) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces'
    };
  }
  
  // Add protocol if missing
  let normalizedUrl = url;
  if (!url.match(/^https?:\/\//)) {
    normalizedUrl = 'https://' + url;
  }
  
  // Very basic domain check
  const domainMatch = normalizedUrl.match(/^https?:\/\/([^\/]+)/);
  if (!domainMatch || !domainMatch[1].includes('.')) {
    return {
      isValid: false,
      error: 'Invalid domain format'
    };
  }
  
  // Check for localhost
  const domain = domainMatch[1].toLowerCase();
  if (domain === 'localhost' || domain.startsWith('127.') || domain.startsWith('192.168.')) {
    return {
      isValid: false,
      error: 'Local URLs not allowed'
    };
  }
  
  return {
    isValid: true,
    normalizedUrl
  };
}