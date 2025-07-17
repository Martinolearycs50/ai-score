'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  TierType, 
  TierFeatures, 
  getTierFeatures, 
  DEFAULT_TIER, 
  isValidTier 
} from '@/lib/tierConfig';

interface TierContextValue {
  tier: TierType;
  features: TierFeatures;
  setTier: (tier: TierType) => void;
  isLoading: boolean;
}

const TierContext = createContext<TierContextValue | undefined>(undefined);

interface TierProviderProps {
  children: ReactNode;
  defaultTier?: TierType;
  overrideFeatures?: Partial<TierFeatures>; // For testing or A/B testing
}

export function TierProvider({ 
  children, 
  defaultTier = DEFAULT_TIER,
  overrideFeatures 
}: TierProviderProps) {
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<TierType>(defaultTier);
  const [isLoading, setIsLoading] = useState(true);

  // Read tier from URL parameters
  useEffect(() => {
    const tierParam = searchParams.get('tier');
    
    console.log('[TierContext] URL tier parameter:', tierParam);
    console.log('[TierContext] Current tier state:', tier);
    console.log('[TierContext] Search params string:', searchParams.toString());
    
    if (tierParam && isValidTier(tierParam)) {
      console.log('[TierContext] Setting tier to:', tierParam);
      setTier(tierParam);
    } else {
      console.log('[TierContext] Using default tier:', defaultTier);
      // Reset to default if no tier param
      setTier(defaultTier);
    }
    setIsLoading(false);
  }, [searchParams, searchParams.toString()]); // Add searchParams.toString() to force re-render

  // Memoize features to prevent unnecessary re-renders
  const features = useMemo(() => {
    const baseFeatures = getTierFeatures(tier);
    
    // Apply any feature overrides (useful for testing or gradual rollouts)
    if (overrideFeatures) {
      return { ...baseFeatures, ...overrideFeatures };
    }
    
    return baseFeatures;
  }, [tier, overrideFeatures]);

  const contextValue = useMemo(() => ({
    tier,
    features,
    setTier,
    isLoading
  }), [tier, features, isLoading]);

  return (
    <TierContext.Provider value={contextValue}>
      {children}
    </TierContext.Provider>
  );
}

// Custom hook to use the tier context
export function useTierContext() {
  const context = useContext(TierContext);
  
  if (!context) {
    throw new Error('useTierContext must be used within a TierProvider');
  }
  
  return context;
}

// Optional: Export a higher-order component for class components
export function withTier<P extends object>(
  Component: React.ComponentType<P & { tier: TierType; features: TierFeatures }>
) {
  return function WithTierComponent(props: P) {
    const { tier, features } = useTierContext();
    return <Component {...props} tier={tier} features={features} />;
  };
}