'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            Recommended
          </span>
        </div>
      )}

      <div
        className={`
          h-full bg-white rounded-xl p-8 transition-all duration-200
          ${isPopular 
            ? 'border-2 border-gray-900 shadow-lg hover:shadow-xl' 
            : 'border border-gray-200 hover:border-gray-300 hover:shadow-md'}
        `}
      >
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{tier.name}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-semibold text-gray-900">{tier.price}</span>
            {tier.priceDetail && (
              <span className="text-gray-500 ml-2">/{tier.priceDetail}</span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{tier.description}</p>
        </div>

        <ul className="space-y-4 mb-8">
          {tier.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + idx * 0.05 }}
              className="flex items-start"
            >
              <svg
                className="w-4 h-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className={`
            w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
            ${isPopular 
              ? 'bg-gray-900 text-white hover:bg-gray-800' 
              : 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {tier.ctaText}
        </button>

        {tier.id === 'free' && (
          <p className="text-center text-xs text-gray-500 mt-4">
            No credit card required
          </p>
        )}

        {tier.id === 'pro' && (
          <div className="mt-4 space-y-2">
            <p className="text-center text-xs text-gray-500">
              14-day free trial • Cancel anytime
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SSL encrypted
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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