'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div style={{ 
      padding: '2rem', 
      background: 'black', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
      <p style={{ marginBottom: '1rem' }}>Error: {error.message}</p>
      <details style={{ marginBottom: '2rem', maxWidth: '600px' }}>
        <summary style={{ cursor: 'pointer' }}>Error Details</summary>
        <pre style={{ marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {error.stack}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          background: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        Try again
      </button>
    </div>
  );
}