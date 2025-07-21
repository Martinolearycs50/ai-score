'use client';
interface LoadingStateProps {
  url?: string;
}
export default function LoadingState({ url }: LoadingStateProps) {
  return (
    <div className="text-center">
      {' '}
      <div
        className="animate-dots mb-8 flex items-center justify-center gap-2 text-4xl"
        style={{ color: 'var(--accent)' }}
      >
        {' '}
        <span>•</span> <span>•</span> <span>•</span>{' '}
      </div>{' '}
      <p className="mb-2 text-lg font-medium" style={{ color: 'var(--foreground)' }}>
        {' '}
        Analyzing{' '}
      </p>{' '}
      {url && <p className="text-muted mono text-sm"> {url} </p>}{' '}
    </div>
  );
}
