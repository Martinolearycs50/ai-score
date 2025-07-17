'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { valuePropositions } from '@/lib/pricingData';

export default function ValuePropositions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {valuePropositions.map((prop, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: index * 0.3
            }}
            className="text-4xl mb-4"
          >
            {prop.icon}
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {prop.title}
          </h3>
          <p className="text-sm text-gray-600">
            {prop.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}