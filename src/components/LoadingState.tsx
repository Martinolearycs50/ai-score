'use client';

interface LoadingStateProps {
  url?: string;
}

export default function LoadingState({ url }: LoadingStateProps) {
  return (
    <div className="text-center">
      <div className="animate-dots flex items-center justify-center gap-2 text-4xl mb-8" style={{ color: 'var(--accent)' }}>
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
      
      <p className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>
        Analyzing
      </p>
      
      {url && (
        <p className="text-sm text-muted mono">
          {url}
        </p>
      )}
    </div>
  );
}