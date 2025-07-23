'use client';

import React from 'react';

import { ProFeature, ProFeatureWrapper } from '../ProFeatureWrapper';
import { ProBadge } from '../ui/Badge';
import { Card } from '../ui/Card';

/**
 * Example usage of Pro feature components
 * This file demonstrates how to use PRO badges and feature wrappers
 */

export function ProFeatureExamples() {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Pro Feature Examples</h2>

      {/* Example 1: Simple PRO Badge */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">1. Simple PRO Badge</h3>
        <div className="flex items-center gap-4">
          <span>API Access</span>
          <ProBadge />
        </div>
      </section>

      {/* Example 2: Wrapped Feature Card */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">2. Wrapped Feature Card</h3>
        <ProFeatureWrapper feature="showCustomReports" blurContent={true}>
          <Card className="p-6">
            <h4 className="mb-2 font-semibold">Custom Reports</h4>
            <p className="text-gray-600">
              Generate detailed PDF reports with your branding and custom metrics.
            </p>
          </Card>
        </ProFeatureWrapper>
      </section>

      {/* Example 3: Inline Pro Feature */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">3. Inline Pro Feature</h3>
        <p>
          Your analysis includes{' '}
          <ProFeature feature="showHistoricalData">30-day historical tracking</ProFeature> to
          monitor your progress over time.
        </p>
      </section>

      {/* Example 4: Feature List with Mixed Access */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">4. Feature List</h3>
        <ul className="space-y-2">
          <li className="flex items-center justify-between rounded bg-gray-50 p-3">
            <span>Basic Analysis</span>
            <span className="text-green-600">✓ Free</span>
          </li>
          <li className="flex items-center justify-between rounded bg-gray-50 p-3">
            <span>AI Recommendations</span>
            <ProBadge />
          </li>
          <li className="flex items-center justify-between rounded bg-gray-50 p-3">
            <span>Bulk Analysis</span>
            <ProBadge />
          </li>
        </ul>
      </section>

      {/* Example 5: Custom Upgrade Message */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">5. Custom Upgrade Message</h3>
        <ProFeatureWrapper
          feature="showAPIAccess"
          customTitle="API Access Required"
          customMessage="Integrate our analysis into your workflow with our powerful API. Perfect for agencies and teams managing multiple websites."
          blurContent={false}
        >
          <Card className="border-2 border-dashed border-gray-300 p-6">
            <h4 className="mb-2 font-semibold">API Integration</h4>
            <pre className="rounded bg-gray-100 p-3 text-sm">
              {`POST /api/v1/analyze
{
  "url": "https://example.com",
  "detailed": true
}`}
            </pre>
          </Card>
        </ProFeatureWrapper>
      </section>
    </div>
  );
}

/**
 * Usage in other components:
 *
 * 1. Import the components:
 *    import { ProFeatureWrapper, ProFeature } from '@/components/ProFeatureWrapper';
 *    import { ProBadge } from '@/components/ui/Badge';
 *
 * 2. For a simple badge next to a feature name:
 *    <div className="flex items-center gap-2">
 *      <span>Advanced Analytics</span>
 *      <ProBadge />
 *    </div>
 *
 * 3. For wrapping entire sections:
 *    <ProFeatureWrapper feature="showRecommendations">
 *      <RecommendationsSection />
 *    </ProFeatureWrapper>
 *
 * 4. For inline text:
 *    <p>
 *      Analyze up to <ProFeature feature="showBulkAnalysis">100 URLs at once</ProFeature>
 *    </p>
 */
