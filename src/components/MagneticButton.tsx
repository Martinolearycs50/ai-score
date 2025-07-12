'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useMagneticEffect } from '@/hooks/useMagneticEffect';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function MagneticButton({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  ...props 
}: MagneticButtonProps) {
  const magneticRef = useMagneticEffect<HTMLButtonElement>({
    strength: 0.25,
    radius: 150
  });

  const baseClasses = 'relative overflow-hidden font-semibold smooth-transition liquid-button';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:shadow-2xl hover:glow-cyan',
    secondary: 'glass border border-glass-border text-foreground hover:border-accent-cyan hover:glow-cyan',
    ghost: 'text-foreground-secondary hover:text-foreground hover:bg-white/5'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  return (
    <button
      ref={magneticRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {variant === 'primary' && (
        <>
          <div className="absolute inset-0 opacity-0 hover:opacity-100 smooth-transition">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-cyan"></div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan to-accent-purple opacity-0 blur-xl hover:opacity-50 smooth-transition"></div>
        </>
      )}
    </button>
  );
}