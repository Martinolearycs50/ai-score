'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { ButtonVariant, buttonColors, cssVars } from '@/lib/design-system/colors';

interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onAnimationEnd'
  > {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  style,
  onClick,
  type,
  ...props
}: ButtonProps) {
  const colorScheme = buttonColors[variant];
  const isDisabled = disabled || isLoading;

  // Build base classes
  const baseClasses = [
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ');

  // Build variant-specific styles
  const variantStyles: React.CSSProperties = {
    ...style,
  };

  // Apply variant colors
  if (variant === 'secondary') {
    variantStyles.backgroundColor = (colorScheme as any).base;
    variantStyles.color = (colorScheme as any).text;
    variantStyles.border = `1px solid ${(colorScheme as any).border}`;
  } else if (variant === 'ghost') {
    variantStyles.color = (colorScheme as any).text;
  } else {
    variantStyles.backgroundColor = (colorScheme as any).background;
  }

  // Focus ring color
  const focusRingColor =
    variant === 'secondary' || variant === 'ghost'
      ? cssVars.primary
      : (colorScheme as any).background || cssVars.accent;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={` ${baseClasses} ${colorScheme.base} ${!isDisabled ? colorScheme.hover : ''} ${!isDisabled ? colorScheme.active : ''} ${className} `}
      style={
        {
          ...variantStyles,
          '--tw-ring-color': focusRingColor,
        } as React.CSSProperties
      }
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-dots flex items-center gap-1">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
