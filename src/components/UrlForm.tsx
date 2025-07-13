'use client';

import { useState } from 'react';
import { validateAndNormalizeUrl } from '@/utils/validators';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function UrlForm({ onSubmit, isLoading, disabled = false }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="Enter website URL"
          disabled={isLoading || disabled}
          className="search-input pr-32"
          style={{ 
            color: 'var(--foreground)',
            opacity: isLoading || disabled ? 0.5 : 1
          }}
          autoComplete="url"
          autoFocus
        />
        
        <button
          type="submit"
          disabled={isLoading || disabled || !url.trim()}
          className="btn-primary absolute right-2 top-1/2 -translate-y-1/2"
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
      </div>

      {error && (
        <p className="mt-4 text-center text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}
    </form>
  );
}