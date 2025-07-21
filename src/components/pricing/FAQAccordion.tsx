'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { faqs } from '@/lib/pricingData';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-foreground mb-8 text-center text-3xl font-bold"
      >
        Frequently Asked Questions
      </motion.h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border-default overflow-hidden rounded-lg border"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <h3 className="text-foreground pr-4 text-lg font-medium">{faq.question}</h3>
              <motion.svg
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-body">{faq.answer}</p>
                    {faq.category && (
                      <span className="text-body mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {faq.category}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-body">
          Still have questions?{' '}
          <a
            href="mailto:support@example.com"
            className="font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Contact our support team
          </a>
        </p>
      </motion.div>
    </div>
  );
}
