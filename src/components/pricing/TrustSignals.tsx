'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { trustSignals } from '@/lib/pricingData';

export default function TrustSignals() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 rounded-lg p-8 md:p-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="text-3xl mb-3"
              >
                {signal.icon}
              </motion.div>
              <p className="text-sm font-medium text-gray-800">
                {signal.text}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 text-sm">
            Your data is safe and secure with enterprise-grade encryption and privacy protection.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}