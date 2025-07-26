'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import FAQAccordion from '@/components/pricing/FAQAccordion';
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable';
import PricingCard from '@/components/pricing/PricingCard';
import TrustSignals from '@/components/pricing/TrustSignals';
import Button from '@/components/ui/Button';
import { consultationService, pricingTiers } from '@/lib/pricingData';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'free') {
      // Redirect to homepage for free tier
      router.push('/');
    } else if (tierId === 'pro') {
      // Redirect to Pro dashboard
      router.push('/pro');
    }
  };

  const handleConsultation = () => {
    window.open(consultationService.ctaLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* Hero Section - Compressed for above-fold pricing */}
      <section className="pt-16 pb-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-foreground mb-2 text-3xl font-semibold md:text-4xl">
              Choose your plan
            </h1>
            <p className="text-body mx-auto max-w-2xl text-lg">
              Start free. Upgrade for advanced features and insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards - 2 Column Layout */}
      <section className="relative py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
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
        <div className="mx-auto max-w-6xl px-4">
          <TrustSignals />
        </div>
      </section>

      {/* Consultation Section - Separate from main tiers */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-default rounded-2xl border p-8 shadow-sm md:p-12"
          >
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h3 className="text-foreground mb-2 text-2xl font-medium">
                  {consultationService.title}
                </h3>
                <p className="text-body mb-4 text-lg">{consultationService.description}</p>
                <div className="text-body flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {consultationService.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center">
                      <svg
                        className="text-accent mr-2 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex-shrink-0 md:mt-0 md:ml-8">
                <div className="mb-2 text-right">
                  <span className="text-foreground text-2xl font-semibold">
                    {consultationService.price}
                  </span>
                </div>
                <Button onClick={handleConsultation} variant="primary" size="lg">
                  {consultationService.ctaText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FeatureComparisonTable />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-foreground mb-4 text-3xl font-semibold">
              Ready to optimize for AI search?
            </h2>
            <p className="text-body mb-8 text-xl">
              Join thousands of websites improving their AI visibility.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button onClick={() => handleSelectPlan('free')} variant="secondary" size="lg">
                Start Free
              </Button>
              <Button onClick={() => handleSelectPlan('pro')} variant="primary" size="lg">
                Get Pro Access
              </Button>
            </div>
            <p className="text-muted mt-4 text-sm">No credit card required • Cancel anytime</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
