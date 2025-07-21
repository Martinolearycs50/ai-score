'use client';

import React from 'react';

import { motion } from 'framer-motion';

import { valuePropositions } from '@/lib/pricingData';

export default function ValuePropositions() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {' '}
      {valuePropositions.map((prop, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="text-center"
        >
          {' '}
          <h3 className="text-foreground mb-2 text-lg font-semibold"> {prop.title} </h3>{' '}
          <p className="text-body text-sm"> {prop.description} </p>{' '}
        </motion.div>
      ))}{' '}
    </div>
  );
}
