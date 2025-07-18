'use client';

import { Suspense } from 'react';
import { TierProvider } from '@/contexts/TierContext';
import TierDebug from '@/components/TierDebug';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TierProvider>
        {children}
        {process.env.NODE_ENV === 'development' && <TierDebug />}
      </TierProvider>
    </Suspense>
  );
}