'use client';

import React, { useEffect, useState } from 'react';

import { useTier } from '@/hooks/useTier';

export default function TierDebug() {
  const { tier, features } = useTier();
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    // Only set URL after hydration to avoid mismatch
    setCurrentUrl(window.location.href);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      className="bg-foreground fixed right-4 bottom-4 z-50 max-w-sm rounded-lg p-4 shadow-lg"
      style={{ color: 'white' }}
    >
      <h3 className="mb-2 font-bold">Tier Debug Info</h3>
      <div className="space-y-1 text-xs">
        <div>
          Current Tier: <span className="text-yellow-400">{tier}</span>
        </div>
        <div>
          URL: <span className="text-muted">{currentUrl || 'Loading...'}</span>
        </div>
        <div className="mt-2">Features:</div>
        <ul className="ml-2 text-xs">
          <li>Detailed Scores: {features.showDetailedScores ? '✅' : '❌'}</li>
          <li>Recommendations: {features.showRecommendations ? '✅' : '❌'}</li>
          <li>Website Profile: {features.showWebsiteProfile ? '✅' : '❌'}</li>
          <li>Comparison Mode: {features.showComparisonMode ? '✅' : '❌'}</li>
          <li>Upgrade CTA: {features.showUpgradeCTA ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
}
