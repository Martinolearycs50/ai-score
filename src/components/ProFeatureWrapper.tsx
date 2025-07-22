'use client';

import React, { useState } from 'react';

import { LockClosedIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

import { useTier } from '@/contexts/TierContext';
import { hasFeature, isProFeaturesEnabled } from '@/lib/tierConfig';

import { Badge, ProBadge } from './ui/Badge';
import { Button } from './ui/Button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';

export interface ProFeatureWrapperProps {
  feature: string;
  children: React.ReactNode;
  showBadge?: boolean;
  blurContent?: boolean;
  customMessage?: string;
  customTitle?: string;
  className?: string;
}

export function ProFeatureWrapper({
  feature,
  children,
  showBadge = true,
  blurContent = true,
  customMessage,
  customTitle,
  className = '',
}: ProFeatureWrapperProps) {
  const { tier } = useTier();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Check if pro features are enabled globally
  if (!isProFeaturesEnabled()) {
    return <>{children}</>;
  }

  // Check if user has access to this feature
  const hasAccess = hasFeature(tier, feature as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show locked state
  return (
    <>
      <div className={`relative ${className}`}>
        {showBadge && (
          <div className="absolute -top-2 -right-2 z-10">
            <ProBadge size="sm" />
          </div>
        )}

        <div
          className={`relative cursor-pointer ${blurContent ? 'select-none' : ''} `}
          onClick={() => setShowUpgradeDialog(true)}
        >
          {blurContent && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-md">
                <LockClosedIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Pro Feature</span>
              </div>
            </div>
          )}

          <div className={blurContent ? 'pointer-events-none opacity-50' : ''}>{children}</div>
        </div>
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogClose onClose={() => setShowUpgradeDialog(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            {customTitle || 'Upgrade to Pro'}
          </DialogTitle>
          <DialogDescription>
            {customMessage ||
              'This feature is available with our Pro plan. Upgrade now to unlock advanced features and take your AI search visibility to the next level.'}
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">Pro Plan Benefits:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Detailed AI recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Implementation timelines
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> API access for automation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Bulk URL analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Priority support
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setShowUpgradeDialog(false)}>
            Maybe Later
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // Navigate to pricing page
              window.location.href = '/pricing';
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

// Convenience component for inline pro features
export function ProFeature({
  feature,
  children,
  showIcon = true,
}: {
  feature: string;
  children: React.ReactNode;
  showIcon?: boolean;
}) {
  const { tier } = useTier();

  if (!isProFeaturesEnabled()) {
    return <>{children}</>;
  }

  const hasAccess = hasFeature(tier, feature as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex items-center gap-1 opacity-50">
      {showIcon && <LockClosedIcon className="h-4 w-4" />}
      {children}
      <ProBadge size="sm" />
    </span>
  );
}
