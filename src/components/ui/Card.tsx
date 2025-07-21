'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export default function Card({
  children,
  className = '',
  hoverable = false,
  noPadding = false,
  onClick,
  style,
}: CardProps) {
  const baseClasses = [
    'rounded-lg',
    'transition-all duration-200',
    !noPadding && 'p-6',
    hoverable && 'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ');
  const cardStyle: React.CSSProperties = {
    backgroundColor: cssVars.card,
    border: `1px solid ${cssVars.border}`,
    boxShadow: 'var(--shadow-sm)',
    ...style,
  };
  const Component = hoverable ? motion.div : 'div';
  const hoverProps = hoverable
    ? { whileHover: { y: -2, boxShadow: 'var(--shadow-hover)' }, transition: { duration: 0.2 } }
    : {};
  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={cardStyle}
      onClick={onClick}
      {...hoverProps}
    >
      {' '}
      {children}{' '}
    </Component>
  );
}
