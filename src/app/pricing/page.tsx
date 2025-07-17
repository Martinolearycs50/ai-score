'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PricingCard from '@/components/pricing/PricingCard';
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable';
import TrustSignals from '@/components/pricing/TrustSignals';
import ValuePropositions from '@/components/pricing/ValuePropositions';
import FAQAccordion from '@/components/pricing/FAQAccordion';
import { pricingTiers } from '@/lib/pricingData';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (tierId: string, ctaLink?: string) => {
    if (tierId === 'consultation' && ctaLink) {
      window.open(ctaLink, '_blank');
    } else if (tierId === 'free') {
      router.push('/');
    } else if (tierId === 'pro') {
      // For now, just show an alert. In production, this would go to a payment flow
      alert('Pro plan signup would go here - integrate with Stripe/payment provider');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-b from-blue-50 to-white pt-20 pb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose the Right Plan for Your{' '}
              <span className="text-blue-600">AI Search Success</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale up as you grow. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                index={index}
                onSelect={() => handleSelectPlan(tier.id, tier.ctaLink)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustSignals />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureComparisonTable />
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ValuePropositions />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-t from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your AI Search Visibility?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start optimizing your content for AI search engines today with actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectPlan('free')}
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Start Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectPlan('pro')}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Pro Access
              </motion.button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required for free plan • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}