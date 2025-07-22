'use client';

import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'pro';
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  secondary: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  pro: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0',
};

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

export function Badge({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${badgeVariants[variant]} ${badgeSizes[size]} ${className} `}
      {...props}
    >
      {children}
    </span>
  );
}

export function ProBadge({ className = '', ...props }: Omit<BadgeProps, 'variant'>) {
  return (
    <Badge variant="pro" className={`animate-shimmer ${className}`} {...props}>
      PRO
    </Badge>
  );
}
