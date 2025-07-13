'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  url?: string;
}

const steps = [
  { id: 'fetch', label: 'Fetching website content' },
  { id: 'parse', label: 'Parsing HTML structure' },
  { id: 'analyze', label: 'Analyzing AI optimization' },
  { id: 'score', label: 'Calculating scores' },
];

export default function LoadingState({ url }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Website</h2>
        {url && (
          <p className="text-gray-500 text-sm">
            {url}
          </p>
        )}
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border
                transition-all duration-300
                ${isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}
                ${isComplete ? 'opacity-60' : ''}
              `}
            >
              <div className="flex-shrink-0">
                {isComplete ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" fill="currentColor" />
                    <path
                      d="M14 7L8.5 12.5L6 10"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="spinner w-5 h-5 border-indigo-600"></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
              <span
                className={`
                  text-sm font-medium
                  ${isActive ? 'text-indigo-700' : 'text-gray-600'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          This typically takes 10-30 seconds
        </p>
      </div>
    </div>
  );
}