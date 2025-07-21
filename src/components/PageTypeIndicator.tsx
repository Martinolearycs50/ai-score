'use client';

import { useState } from 'react';

import type { PageType } from '@/lib/types';

interface PageTypeIndicatorProps {
  detectedType: PageType;
  onTypeChange?: (type: PageType) => void;
  allowOverride?: boolean;
}
const PAGE_TYPE_INFO: Record<PageType, { label: string; icon: string; description: string }> = {
  homepage: { label: 'Homepage', icon: '🏠', description: 'Main landing page or site root' },
  blog: { label: 'Blog/Article', icon: '📝', description: 'Blog post or news article' },
  article: { label: 'Article', icon: '📄', description: 'Article or editorial content' },
  product: { label: 'Product Page', icon: '🛍️', description: 'Product listing or detail page' },
  documentation: {
    label: 'Documentation',
    icon: '📚',
    description: 'Technical documentation or guide',
  },
  category: { label: 'Category', icon: '📁', description: 'Category or listing page' },
  about: { label: 'About', icon: 'ℹ️', description: 'About or company information' },
  contact: { label: 'Contact', icon: '📧', description: 'Contact information page' },
  search: { label: 'Search', icon: '🔍', description: 'Search results page' },
  general: { label: 'General', icon: '📋', description: 'General content page' },
};
export default function PageTypeIndicator({
  detectedType,
  onTypeChange,
  allowOverride = false,
}: PageTypeIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(detectedType);
  const info = PAGE_TYPE_INFO[selectedType];
  const handleTypeChange = (type: PageType) => {
    setSelectedType(type);
    setIsOpen(false);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };
  if (!allowOverride) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5"
        style={{ backgroundColor: 'var(--blue-50)', borderColor: 'var(--accent)' }}
      >
        {' '}
        <span className="text-lg">{info.icon}</span>{' '}
        <div className="text-sm">
          {' '}
          <div className="font-medium" style={{ color: 'var(--accent)' }}>
            {info.label}
          </div>{' '}
          <div className="text-xs" style={{ color: 'var(--accent)', opacity: 0.8 }}>
            Auto-detected
          </div>{' '}
        </div>{' '}
      </div>
    );
  }
  return (
    <div className="relative">
      {' '}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors"
        style={{ backgroundColor: 'var(--blue-50)', borderColor: 'var(--accent)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--blue-100)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--blue-50)')}
      >
        {' '}
        <span className="text-lg">{info.icon}</span>{' '}
        <div className="text-left text-sm">
          {' '}
          <div className="font-medium" style={{ color: 'var(--accent)' }}>
            {info.label}
          </div>{' '}
          <div className="text-xs" style={{ color: 'var(--accent)', opacity: 0.8 }}>
            Click to change
          </div>{' '}
        </div>{' '}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--accent)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {' '}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />{' '}
        </svg>{' '}
      </button>{' '}
      {isOpen && (
        <div className="bg-card border-default absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border shadow-lg">
          {' '}
          <div className="p-2">
            {' '}
            <div className="text-muted px-3 py-2 text-xs font-medium">Select page type:</div>{' '}
            {(Object.keys(PAGE_TYPE_INFO) as PageType[]).map((type) => {
              const typeInfo = PAGE_TYPE_INFO[type];
              const isSelected = type === selectedType;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className="w-full rounded-md px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--blue-50)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {' '}
                  <div className="flex items-center gap-3">
                    {' '}
                    <span className="text-lg">{typeInfo.icon}</span>{' '}
                    <div className="flex-1">
                      {' '}
                      <div className="text-sm font-medium">{typeInfo.label}</div>{' '}
                      <div className="text-muted text-xs">{typeInfo.description}</div>{' '}
                    </div>{' '}
                    {isSelected && (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: 'var(--accent)' }}
                      >
                        {' '}
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />{' '}
                      </svg>
                    )}{' '}
                  </div>{' '}
                </button>
              );
            })}{' '}
          </div>{' '}
        </div>
      )}{' '}
    </div>
  );
}
