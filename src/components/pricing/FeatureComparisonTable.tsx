'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  if (isMobileView) {
    // Mobile accordion view
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Compare Features
        </h3>
        {featureCategories.map((category, catIdx) => (
          <motion.div
            key={catIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category.name ? null : category.name
              )}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h4 className="font-semibold text-gray-900">{category.name}</h4>
              <motion.svg
                animate={{ rotate: expandedCategory === category.name ? 180 : 0 }}
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                  <div className="p-4 space-y-4">
                    {category.features.map((feature, featIdx) => (
                      <div key={featIdx} className="space-y-2">
                        <h5 className="font-medium text-gray-900">{feature.name}</h5>
                        {feature.description && (
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Free</p>
                            {renderFeatureValue(feature.tiers.free)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pro</p>
                            {renderFeatureValue(feature.tiers.pro)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Consultation</p>
                            {renderFeatureValue(feature.tiers.consultation)}
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
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Feature Comparison
      </h3>
      <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
              Pro
              <span className="block text-xs font-normal text-blue-600 mt-1">Most Popular</span>
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Consultation</th>
          </tr>
        </thead>
        <tbody>
          {featureCategories.map((category, catIdx) => (
            <React.Fragment key={catIdx}>
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">
                  {category.name}
                </td>
              </tr>
              {category.features.map((feature, featIdx) => (
                <motion.tr
                  key={featIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIdx * 0.1 + featIdx * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                      {feature.description && (
                        <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{renderFeatureValue(feature.tiers.free)}</td>
                  <td className="px-6 py-4 text-center bg-blue-50/30">{renderFeatureValue(feature.tiers.pro)}</td>
                  <td className="px-6 py-4 text-center">{renderFeatureValue(feature.tiers.consultation)}</td>
                </motion.tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}