'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PricingCard from '@/components/pricing/PricingCard';
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable';
import TrustSignals from '@/components/pricing/TrustSignals';
import FAQAccordion from '@/components/pricing/FAQAccordion';
import { pricingTiers, consultationService } from '@/lib/pricingData';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'free') {
      router.push('/');
    } else if (tierId === 'pro') {
      // For now, show alert. In production, integrate with payment provider
      alert('Pro trial signup would go here - integrate with Stripe');
    }
  };

  const handleConsultation = () => {
    window.open(consultationService.ctaLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* Hero Section - Compressed for above-fold pricing */}
      <section className="pt-16 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Choose your plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free. Upgrade for advanced features and insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards - 2 Column Layout */}
      <section className="py-8 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                index={index}
                onSelect={() => handleSelectPlan(tier.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals - Moved below pricing */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <TrustSignals />
        </div>
      </section>

      {/* Consultation Section - Separate from main tiers */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200"
          >
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h3 className="text-2xl font-medium text-gray-900 mb-2">
                  {consultationService.title}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {consultationService.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                  {consultationService.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
                <div className="text-right mb-2">
                  <span className="text-2xl font-semibold text-gray-900">{consultationService.price}</span>
                </div>
                <button
                  onClick={handleConsultation}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
                >
                  {consultationService.ctaText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureComparisonTable />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Ready to optimize for AI search?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of websites improving their AI visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleSelectPlan('free')}
                className="px-8 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-900 hover:bg-gray-50 transition-colors"
              >
                Start Free
              </button>
              <button
                onClick={() => handleSelectPlan('pro')}
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Pro Access
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}