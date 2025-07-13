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
            w-full px-4 py-3 pr-32 text-base border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${isLoading || disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          autoComplete="url"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={isLoading || disabled || !url.trim()}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            px-6 py-2 text-sm font-medium rounded-md
            transition-all duration-200
            ${!url.trim() || isLoading || disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="spinner w-4 h-4 border-white"></div>
              <span>Analyzing</span>
            </div>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-gray-500 text-sm">
        Enter any website URL to analyze its AI search readiness
      </p>
    </form>
  );
}