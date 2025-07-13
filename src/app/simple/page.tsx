'use client';

import { useState } from 'react';

export default function SimplePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('[Simple] Sending URL:', url);
      
      const response = await fetch('/api/analyze-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      console.log('[Simple] Response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.data);
    } catch (err) {
      console.error('[Simple] Error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      background: '#000', 
      color: '#fff' 
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Simple URL Analyzer</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="Enter URL (e.g., www.tap.company)"
          style={{
            padding: '0.5rem',
            width: '300px',
            marginRight: '1rem',
            color: '#000'
          }}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: loading ? '#666' : '#0070f3',
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div>
          <h2>Analysis Results</h2>
          <div style={{ 
            background: '#111', 
            padding: '1rem', 
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
            <p>URL: {result.url}</p>
            <p>Overall Score: {result.score.overall}/100</p>
            <p>Title: {result.metadata.title}</p>
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer' }}>Full Results</summary>
              <pre style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}