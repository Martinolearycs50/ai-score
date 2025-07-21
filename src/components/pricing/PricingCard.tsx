'use client';

import React from 'react';

import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';
import { PricingTier } from '@/lib/pricingData';

interface PricingCardProps {
  tier: PricingTier;
  index: number;
  onSelect: () => void;
}

export default function PricingCard({ tier, index, onSelect }: PricingCardProps) {
  const isPopular = tier.popular;
  const isConsultation = tier.id === 'consultation';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 transform">
          <span
            className="rounded-full px-4 py-1 text-xs font-medium tracking-wide uppercase"
            style={{
              color: 'white',
              backgroundColor: 'var(--gray-900)',
            }}
          >
            Recommended
          </span>
        </div>
      )}
      <div
        className={`bg-card h-full rounded-xl p-8 transition-all duration-200 ${
          isPopular ? 'border-2 shadow-lg hover:shadow-xl' : 'border-default border hover:shadow-md'
        } `}
        style={isPopular ? { borderColor: 'var(--gray-900)' } : {}}
      >
        <div className="mb-8">
          <h3 className="text-foreground mb-3 text-xl font-semibold">{tier.name}</h3>
          <div className="mb-4 flex items-baseline">
            <span className="text-foreground text-4xl font-semibold">{tier.price}</span>
            {tier.priceDetail && <span className="text-muted ml-2">/{tier.priceDetail}</span>}
          </div>
          <p className="text-body text-sm">{tier.description}</p>
        </div>

        <ul className="mb-8 space-y-4">
          {tier.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + idx * 0.05 }}
              className="flex items-start"
            >
              <svg
                className="text-accent mt-0.5 mr-3 h-4 w-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-body text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Button
          variant={isPopular ? 'primary' : 'secondary'}
          onClick={onSelect}
          fullWidth
          size="lg"
        >
          {tier.ctaText}
        </Button>

        {tier.id === 'free' && (
          <p className="text-muted mt-4 text-center text-xs">No credit card required</p>
        )}

        {tier.id === 'pro' && (
          <div className="mt-4 space-y-2">
            <p className="text-muted text-center text-xs">14-day free trial • Cancel anytime</p>
            <div className="text-muted flex items-center justify-center space-x-4 text-xs">
              <span className="flex items-center">
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                SSL encrypted
              </span>
              <span className="flex items-center">
                <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Money-back guarantee
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
