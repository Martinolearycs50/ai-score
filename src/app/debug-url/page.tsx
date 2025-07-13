'use client';

import { useState } from 'react';
import { validateAndNormalizeUrl } from '@/utils/validators';

export default function DebugUrlPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);

  const testUrl = () => {
    console.log('Testing URL:', url);
    const validation = validateAndNormalizeUrl(url);
    console.log('Validation result:', validation);
    setResult(validation);
  };

  const testCommonUrls = () => {
    const testUrls = [
      'www.tap.company',
      'tap.company',
      'https://www.tap.company',
      'google.com',
      'https://google.com',
      'example.com/path',
      'subdomain.example.com'
    ];

    const results = testUrls.map(testUrl => ({
      input: testUrl,
      result: validateAndNormalizeUrl(testUrl)
    }));

    setResult({ testResults: results });
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <h1 className="text-2xl mb-6">URL Validation Debug Page</h1>
      
      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block mb-2">Test a specific URL:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to test"
              className="flex-1 px-4 py-2 rounded-lg border"
              style={{ 
                background: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            />
            <button
              onClick={testUrl}
              className="px-6 py-2 rounded-lg"
              style={{ 
                background: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              Test URL
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={testCommonUrls}
            className="px-6 py-2 rounded-lg"
            style={{ 
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)'
            }}
          >
            Test Common URLs
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--card)' }}>
            <h2 className="text-lg mb-2">Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--muted)' }}>
          <h3 className="text-lg mb-2">Debug Info:</h3>
          <p>Open the browser console (F12) to see detailed logs</p>
          <p>Current environment: {process.env.NODE_ENV}</p>
          <p>Browser: {typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}</p>
        </div>
      </div>
    </div>
  );
}