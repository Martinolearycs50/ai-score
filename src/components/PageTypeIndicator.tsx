'use client';

import { useState } from 'react';
import type { PageType } from '@/lib/types';

interface PageTypeIndicatorProps {
  detectedType: PageType;
  onTypeChange?: (type: PageType) => void;
  allowOverride?: boolean;
}

const PAGE_TYPE_INFO: Record<PageType, { label: string; icon: string; description: string }> = {
  homepage: {
    label: 'Homepage',
    icon: '🏠',
    description: 'Main landing page or site root'
  },
  blog: {
    label: 'Blog/Article',
    icon: '📝',
    description: 'Blog post or news article'
  },
  article: {
    label: 'Article',
    icon: '📄',
    description: 'Article or editorial content'
  },
  product: {
    label: 'Product Page',
    icon: '🛍️',
    description: 'Product listing or detail page'
  },
  documentation: {
    label: 'Documentation',
    icon: '📚',
    description: 'Technical documentation or guide'
  },
  category: {
    label: 'Category',
    icon: '📁',
    description: 'Category or listing page'
  },
  about: {
    label: 'About',
    icon: 'ℹ️',
    description: 'About or company information'
  },
  contact: {
    label: 'Contact',
    icon: '📧',
    description: 'Contact information page'
  },
  search: {
    label: 'Search',
    icon: '🔍',
    description: 'Search results page'
  },
  general: {
    label: 'General',
    icon: '📋',
    description: 'General content page'
  }
};

export default function PageTypeIndicator({ 
  detectedType, 
  onTypeChange, 
  allowOverride = false 
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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-lg">{info.icon}</span>
        <div className="text-sm">
          <div className="font-medium text-blue-900">{info.label}</div>
          <div className="text-xs text-blue-700">Auto-detected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <span className="text-lg">{info.icon}</span>
        <div className="text-sm text-left">
          <div className="font-medium text-blue-900">{info.label}</div>
          <div className="text-xs text-blue-700">Click to change</div>
        </div>
        <svg 
          className={`w-4 h-4 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">Select page type:</div>
            {(Object.keys(PAGE_TYPE_INFO) as PageType[]).map((type) => {
              const typeInfo = PAGE_TYPE_INFO[type];
              const isSelected = type === selectedType;
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{typeInfo.label}</div>
                      <div className="text-xs text-gray-500">{typeInfo.description}</div>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}