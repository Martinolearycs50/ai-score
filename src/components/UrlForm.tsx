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
  const [placeholder, setPlaceholder] = useState(0);
  const [focused, setFocused] = useState(false);

  // Cycling placeholder examples with animation
  const placeholders = [
    'anthropic.com',
    'openai.com',
    'your-website.com',
    'github.com',
    'stackoverflow.com'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => (prev + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || disabled) return;

    // Clear previous error
    setError('');

    // Validate URL
    const validation = validateAndNormalizeUrl(url.trim());
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL');
      return;
    }

    // Submit the normalized URL
    onSubmit(validation.normalizedUrl!);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handlePasteExample = () => {
    setUrl('anthropic.com');
    setError('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main input section */}
        <div className="relative group">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={handleInputChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholders[placeholder]}
              disabled={isLoading || disabled}
              className={`
                w-full px-8 py-6 text-lg rounded-2xl border-2 
                glass-intense text-foreground
                placeholder-foreground-muted
                smooth-transition
                focus:outline-none focus:border-accent-cyan focus:glow-cyan
                ${error 
                  ? 'border-red-500 glow-red' 
                  : focused
                    ? 'border-accent-cyan glow-cyan'
                    : 'border-glass-border'
                }
                ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
                pr-40
              `}
              autoComplete="url"
              autoFocus
            />
            
            {/* Animated border glow */}
            <div className={`
              absolute inset-0 rounded-2xl pointer-events-none smooth-transition
              ${focused ? 'shadow-[0_0_30px_rgba(0,217,255,0.3)]' : ''}
            `} />
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || disabled || !url.trim()}
              className={`
                absolute right-3 top-3 bottom-3 px-8 py-3
                bg-gradient-to-r from-accent-cyan to-accent-purple
                text-white font-semibold rounded-xl
                liquid-button magnetic smooth-transition
                focus:outline-none focus:ring-4 focus:ring-accent-cyan/20
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!isLoading && !disabled && url.trim() 
                  ? 'glow-cyan hover:shadow-2xl hover:scale-105' 
                  : ''
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full"></div>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin absolute top-0"></div>
                  </div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Analyze</span>
                  <div className="text-lg">⚡</div>
                </div>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 glass rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-center space-x-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <span className="text-red-400 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Helper text and example */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-foreground-secondary">
          <div className="flex items-center space-x-2">
            <div className="text-accent-cyan">🔬</div>
            <span>
              Enter any website URL for comprehensive AI search analysis
            </span>
          </div>
          
          <button
            type="button"
            onClick={handlePasteExample}
            disabled={isLoading || disabled}
            className="magnetic text-accent-cyan hover:text-white smooth-transition underline decoration-accent-cyan/50 hover:decoration-white"
          >
            Try example: anthropic.com
          </button>
        </div>
      </form>

      {/* Analysis capabilities preview */}
      <div className="mt-12 glass rounded-2xl p-8 border border-white/5">
        <h3 className="font-display font-semibold text-foreground mb-6 text-center">
          🔍 Advanced Analysis Capabilities
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center group-hover:scale-110 smooth-transition">
              <span className="text-white font-bold">🤖</span>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">Crawler Access</div>
            <div className="text-xs text-foreground-muted">AI bot permissions</div>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center group-hover:scale-110 smooth-transition">
              <span className="text-white font-bold">📊</span>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">Content Structure</div>
            <div className="text-xs text-foreground-muted">Hierarchy & format</div>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center group-hover:scale-110 smooth-transition">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">Technical SEO</div>
            <div className="text-xs text-foreground-muted">Schema & metadata</div>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center group-hover:scale-110 smooth-transition">
              <span className="text-white font-bold">🎯</span>
            </div>
            <div className="text-sm font-medium text-foreground mb-1">AI Optimization</div>
            <div className="text-xs text-foreground-muted">Platform-specific</div>
          </div>
        </div>

        {/* Platform compatibility indicators */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-xs text-foreground-muted mb-4">
            Compatible with all major AI platforms
          </div>
          <div className="flex justify-center items-center space-x-6">
            {[
              { name: 'ChatGPT', color: 'from-green-400 to-green-500' },
              { name: 'Claude', color: 'from-orange-400 to-orange-500' },
              { name: 'Perplexity', color: 'from-blue-400 to-blue-500' },
              { name: 'Gemini', color: 'from-purple-400 to-purple-500' }
            ].map((platform, index) => (
              <div key={platform.name} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${platform.color} animate-pulse`} 
                     style={{ animationDelay: `${index * 0.5}s` }}></div>
                <span className="text-xs text-foreground-secondary font-medium">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}