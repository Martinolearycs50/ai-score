'use client';

import { useState } from 'react';
import { validateAndNormalizeUrl } from '@/utils/validators';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  onCompare?: (urls: [string, string]) => void;
  isLoading: boolean;
  disabled?: boolean;
  comparisonMode?: boolean;
  onComparisonModeChange?: (mode: boolean) => void;
}

export default function UrlForm({ 
  onSubmit, 
  onCompare,
  isLoading, 
  disabled = false,
  comparisonMode = false,
  onComparisonModeChange
}: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [url2, setUrl2] = useState('');
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || disabled) {
      return;
    }

    if (comparisonMode) {
      // Handle comparison mode
      setError('');
      setError2('');

      const trimmedUrl1 = url.trim();
      const trimmedUrl2 = url2.trim();
      
      const validation1 = validateAndNormalizeUrl(trimmedUrl1);
      const validation2 = validateAndNormalizeUrl(trimmedUrl2);
      
      let hasError = false;
      
      if (!validation1.isValid) {
        setError(validation1.error || 'Please enter a valid URL');
        hasError = true;
      }
      
      if (!validation2.isValid) {
        setError2(validation2.error || 'Please enter a valid URL');
        hasError = true;
      }
      
      if (hasError || !onCompare) return;
      
      // Clear fields and submit
      setUrl('');
      setUrl2('');
      onCompare([validation1.normalizedUrl!, validation2.normalizedUrl!]);
    } else {
      // Handle single mode
      setError('');

      const trimmedUrl = url.trim();
      const validation = validateAndNormalizeUrl(trimmedUrl);
      
      if (!validation.isValid) {
        setError(validation.error || 'Please enter a valid URL');
        return;
      }

      setUrl('');
      onSubmit(validation.normalizedUrl!);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (error) {
      setError('');
    }
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl2(value);
    
    if (error2) {
      setError2('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !disabled && url.trim()) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <div className="w-full">
      {/* Comparison mode toggle */}
      {onComparisonModeChange && (
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => onComparisonModeChange(!comparisonMode)}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            {comparisonMode ? 'Single Analysis' : 'Compare Websites'} →
          </button>
        </div>
      )}

      {comparisonMode ? (
        /* Comparison mode UI */
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter first website URL"
              disabled={isLoading || disabled}
              className="search-input"
              style={{ 
                color: 'var(--foreground)',
                opacity: isLoading || disabled ? 0.5 : 1
              }}
              autoComplete="url"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={url2}
              onChange={handleInputChange2}
              onKeyPress={handleKeyPress}
              placeholder="Enter second website URL"
              disabled={isLoading || disabled}
              className="search-input"
              style={{ 
                color: 'var(--foreground)',
                opacity: isLoading || disabled ? 0.5 : 1
              }}
              autoComplete="url"
            />
            {error2 && (
              <p className="mt-2 text-sm" style={{ color: 'var(--error)' }}>
                {error2}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || disabled || !url.trim() || !url2.trim()}
            className="btn-primary w-full"
            style={{
              opacity: !url.trim() || !url2.trim() || isLoading || disabled ? 0.5 : 1,
              cursor: !url.trim() || !url2.trim() || isLoading || disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <div className="animate-dots flex items-center justify-center gap-1">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            ) : (
              'Compare'
            )}
          </button>
        </div>
      ) : (
        /* Single mode UI */
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter website URL"
            disabled={isLoading || disabled}
            className="search-input pr-36"
            style={{ 
              color: 'var(--foreground)',
              opacity: isLoading || disabled ? 0.5 : 1
            }}
            autoComplete="url"
            autoFocus
          />
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || disabled || !url.trim()}
            className="btn-primary absolute right-4 top-1/2 -translate-y-1/2"
            style={{
              opacity: !url.trim() || isLoading || disabled ? 0.5 : 1,
              cursor: !url.trim() || isLoading || disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <div className="animate-dots flex items-center gap-1">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            ) : (
              'Analyze'
            )}
          </button>

          {error && (
            <p className="mt-4 text-center text-sm" style={{ color: 'var(--error)' }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}