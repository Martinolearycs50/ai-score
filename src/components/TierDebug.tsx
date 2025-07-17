'use client';

import React from 'react';
import { useTier } from '@/hooks/useTier';

export default function TierDebug() {
  const { tier, features } = useTier();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Tier Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>Current Tier: <span className="text-yellow-400">{tier}</span></div>
        <div>URL: <span className="text-gray-400">{typeof window !== 'undefined' ? window.location.href : 'SSR'}</span></div>
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