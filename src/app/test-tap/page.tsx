'use client';

import { useState } from 'react';

export default function TestTapPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUrl = async () => {
    setLoading(true);
    try {
      // Test validation endpoint
      const validationRes = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.tap.company/' })
      });
      const validationData = await validationRes.json();

      // Test main analyze endpoint
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.tap.company/' })
      });
      const analyzeData = await analyzeRes.json();

      setResult({
        validation: validationData,
        analyze: {
          status: analyzeRes.status,
          data: analyzeData
        }
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test tap.company URL</h1>
      
      <button 
        onClick={testUrl}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test URL'}
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}