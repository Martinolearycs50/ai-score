'use client';

import { Suspense } from 'react';

import TierDebug from '@/components/TierDebug';
import { TierProvider } from '@/contexts/TierContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TierProvider>
        {children}
        {process.env.NODE_ENV === 'development' && <TierDebug />}
      </TierProvider>
    </Suspense>
  );
}
