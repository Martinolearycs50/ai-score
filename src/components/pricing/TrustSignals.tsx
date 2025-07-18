'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ShieldCheckIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { trustSignals } from '@/lib/pricingData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '14-day free trial': CheckIcon,
  'No credit card required': CreditCardIcon,
  'Cancel anytime': ShieldCheckIcon,
  'SSL encrypted': LockClosedIcon
};

export default function TrustSignals() {
  return (
    <div className="flex items-center justify-center space-x-8">
      {trustSignals.map((signal, index) => {
        const Icon = iconMap[signal.text] || CheckIcon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {signal.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}