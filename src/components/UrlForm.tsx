'use client';

import { useState, useEffect } from 'react';
import { validateAndNormalizeUrl } from '@/utils/validators';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function UrlForm({ onSubmit, isLoading, disabled = false }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'example.com',
    'stripe.com',
    'anthropic.com',
    'openai.com'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || disabled) return;

    setError('');

    const validation = validateAndNormalizeUrl(url.trim());
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL');
      return;
    }

    onSubmit(validation.normalizedUrl!);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder={placeholders[placeholderIndex]}
          disabled={isLoading || disabled}
          className={`
            input w-full h-12 px-4 pr-32 text-base
            ${error ? 'border-error focus:border-error' : ''}
            ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          autoComplete="url"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={isLoading || disabled || !url.trim()}
          className={`
            absolute right-2 top-2 bottom-2
            btn btn-primary h-auto
            ${!url.trim() || isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="spinner w-4 h-4"></div>
              <span>Analyzing</span>
            </div>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error text-small">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-foreground-muted text-small">
        Enter any website URL to analyze its AI search readiness
      </p>
    </form>
  );
}