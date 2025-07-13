'use client';

import { useState } from 'react';

export default function DirectTestPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const testDirectAPI = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://www.google.com' })
      });
      
      const data = await response.json();
      setStatus(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
    
    setLoading(false);
  };
  
  const testHealthCheck = async () => {
    setLoading(true);
    setStatus('Testing health check...');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'GET'
      });
      
      const data = await response.json();
      setStatus(`Health Check: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
    
    setLoading(false);
  };
  
  return (
    <div style={{ padding: '2rem', color: 'white', background: 'black' }}>
      <h1>Direct API Test</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={testHealthCheck}
          disabled={loading}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            background: loading ? 'gray' : 'blue',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Health Check
        </button>
        
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          style={{ 
            padding: '0.5rem 1rem', 
            background: loading ? 'gray' : 'green',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Direct API Call
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {status}
      </div>
      
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.7 }}>
        <p>This page directly tests the API without any form handling.</p>
        <p>Check the browser console for additional logs.</p>
      </div>
    </div>
  );
}