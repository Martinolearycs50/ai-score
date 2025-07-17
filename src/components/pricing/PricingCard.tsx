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
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`
          h-full bg-white rounded-lg border-2 p-8
          ${isPopular ? 'border-blue-600 shadow-xl' : 'border-gray-200 shadow-sm'}
          ${isConsultation ? 'bg-gradient-to-br from-white to-blue-50' : ''}
        `}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
          <p className="text-gray-600 mb-4">{tier.description}</p>
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
            {tier.priceDetail && (
              <span className="text-gray-600 ml-2">{tier.priceDetail}</span>
            )}
          </div>
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
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSelect}
          className={`
            w-full py-3 px-6 rounded-lg font-semibold transition-colors
            ${isPopular 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : isConsultation
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }
          `}
        >
          {tier.ctaText}
        </motion.button>

        {tier.id === 'free' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            No credit card required
          </p>
        )}

        {tier.id === 'pro' && (
          <p className="text-center text-sm text-gray-500 mt-4">
            14-day free trial • Cancel anytime
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}