'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { featureCategories } from '@/lib/pricingData';

export default function FeatureComparisonTable() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <svg className="text-accent mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <span className="text-muted text-sm">—</span>
      );
    }
    return <span className="text-body text-sm">{value}</span>;
  };

  if (isMobileView) {
    // Mobile accordion view
    return (
      <div className="space-y-4">
        <h3 className="text-foreground mb-6 text-center text-2xl font-bold">Compare Features</h3>
        {featureCategories.map((category, catIdx) => (
          <motion.div
            key={catIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
            className="bg-card border-default overflow-hidden rounded-lg border"
          >
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === category.name ? null : category.name)
              }
              className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
            >
              <h4 className="text-foreground font-semibold">{category.name}</h4>
              <motion.svg
                animate={{ rotate: expandedCategory === category.name ? 180 : 0 }}
                className="text-muted h-5 w-5"
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
              {expandedCategory === category.name && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 p-4">
                    {category.features.map((feature, featIdx) => (
                      <div key={featIdx} className="space-y-2">
                        <h5 className="text-foreground font-medium">{feature.name}</h5>
                        {feature.description && (
                          <p className="text-body text-sm">{feature.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="border-default rounded-lg border p-3">
                            <p className="text-body mb-2 text-xs font-medium">Free</p>
                            {renderFeatureValue(feature.tiers.free)}
                          </div>
                          <div
                            className="rounded-lg border bg-gray-50 p-3"
                            style={{ borderColor: 'var(--gray-900)' }}
                          >
                            <p className="text-foreground mb-2 text-xs font-medium">Pro</p>
                            {renderFeatureValue(feature.tiers.pro)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto"
    >
      <h3 className="text-foreground mb-8 text-center text-2xl font-medium">Feature Comparison</h3>
      <table className="bg-card w-full overflow-hidden rounded-lg shadow-sm">
        <thead>
          <tr className="border-default border-b bg-gray-50">
            <th className="text-body w-3/5 px-6 py-4 text-left text-sm font-medium">Features</th>
            <th className="text-body w-1/5 px-6 py-4 text-center text-sm font-medium">Free</th>
            <th
              className="text-foreground w-1/5 border-l-2 bg-gray-50 px-6 py-4 text-center text-sm font-medium"
              style={{ borderColor: 'var(--gray-900)' }}
            >
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {featureCategories.map((category, catIdx) => (
            <React.Fragment key={catIdx}>
              <tr className="bg-gray-50">
                <td colSpan={3} className="text-body px-6 py-3 text-sm font-medium">
                  {category.name}
                </td>
              </tr>
              {category.features.map((feature, featIdx) => (
                <motion.tr
                  key={featIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIdx * 0.1 + featIdx * 0.05 }}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{feature.name}</p>
                      {feature.description && (
                        <p className="text-body mt-1 text-xs">{feature.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderFeatureValue(feature.tiers.free)}
                  </td>
                  <td className="border-l-2 border-gray-100 bg-gray-50 px-6 py-4 text-center">
                    {renderFeatureValue(feature.tiers.pro)}
                  </td>
                </motion.tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
