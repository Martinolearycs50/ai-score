'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDebugEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data', url: 'https://example.com' }),
      });
      const data = await response.json();
      setResult({ endpoint: 'debug', data });
    } catch (error) {
      setResult({ endpoint: 'debug', error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  const testAnalyzeEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
      const data = await response.json();
      setResult({ endpoint: 'analyze', status: response.status, data });
    } catch (error) {
      setResult({ endpoint: 'analyze', error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'GET',
      });
      const data = await response.json();
      setResult({ endpoint: 'health', data });
    } catch (error) {
      setResult({ endpoint: 'health', error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-2xl mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
        >
          Test Health Check
        </button>
        
        <button
          onClick={testDebugEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-green-600 rounded disabled:opacity-50 ml-4"
        >
          Test Debug Endpoint
        </button>
        
        <button
          onClick={testAnalyzeEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50 ml-4"
        >
          Test Analyze Endpoint
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-lg mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}