'use client';

interface ScoreDifferenceProps {
  difference: number;
  showSign?: boolean;
}

export default function ScoreDifference({ difference, showSign = false }: ScoreDifferenceProps) {
  if (difference === 0) {
    return (
      <span className="text-muted text-sm">
        =
      </span>
    );
  }

  const isPositive = difference > 0;
  const color = isPositive ? 'var(--success)' : 'var(--error)';
  const sign = isPositive ? '+' : '';
  
  return (
    <div className="flex items-center gap-1">
      <span 
        className="text-sm font-medium"
        style={{ color }}
      >
        {showSign && sign}{Math.abs(difference)}
      </span>
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="none"
        style={{ 
          transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)',
          color 
        }}
      >
        <path 
          d="M6 2 L10 8 L2 8 Z" 
          fill="currentColor"
        />
      </svg>
    </div>
  );
}