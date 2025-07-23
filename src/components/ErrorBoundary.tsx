'use client';

import React from 'react';

import { cssVars } from '@/lib/design-system/colors';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          {' '}
          <div className="p-8 text-center">
            {' '}
            <h1 className="text-foreground mb-4 text-2xl font-semibold">
              {' '}
              Something went wrong{' '}
            </h1>{' '}
            <p className="text-body mb-6">
              {' '}
              {this.state.error?.message || 'An unexpected error occurred'}{' '}
            </p>{' '}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="rounded-lg px-6 py-2 transition-opacity hover:opacity-90"
              style={{ color: 'white', backgroundColor: cssVars.accent }}
            >
              {' '}
              Go back home{' '}
            </button>{' '}
          </div>{' '}
        </div>
      );
    }
    return this.props.children;
  }
}
