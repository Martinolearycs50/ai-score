'use client';

import React from 'react';

import {
  CheckIcon,
  CreditCardIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { trustSignals } from '@/lib/pricingData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '14-day free trial': CheckIcon,
  'No credit card required': CreditCardIcon,
  'Cancel anytime': ShieldCheckIcon,
  'SSL encrypted': LockClosedIcon,
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
            <Icon className="text-muted h-4 w-4" />
            <span className="text-body text-sm">{signal.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
