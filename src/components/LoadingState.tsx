'use client';

import { useEffect, useState } from 'react';
import DNALoader from '@/components/DNALoader';
import { CheckCircle, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  url?: string;
}

export default function LoadingState({ url }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const analysisSteps = [
    { 
      icon: '🤖', 
      title: 'Contacting AI Platforms',
      description: 'Checking crawler accessibility and permissions',
      color: 'from-green-400 to-green-500'
    },
    { 
      icon: '📊', 
      title: 'Analyzing Content Structure',
      description: 'Evaluating headings, lists, and content hierarchy',
      color: 'from-blue-400 to-blue-500'
    },
    { 
      icon: '⚡', 
      title: 'Technical SEO Scan',
      description: 'Examining meta tags, schema markup, and performance',
      color: 'from-purple-400 to-purple-500'
    },
    { 
      icon: '🎯', 
      title: 'AI Optimization Review',
      description: 'Assessing platform-specific optimization factors',
      color: 'from-orange-400 to-orange-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % analysisSteps.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [analysisSteps.length]);

  return (
    <div className="w-full max-w-4xl mx-auto text-center py-16 px-6">
      {/* Central DNA Helix Animation */}
      <div className="relative mb-12 flex justify-center">
        <DNALoader size={200} />
      </div>

      {/* Status Text */}
      <h2 className="text-4xl font-display font-bold text-foreground mb-4">
        AI Observatory Scanning...
      </h2>
      
      {url && (
        <div className="mb-8 glass rounded-xl p-4 max-w-2xl mx-auto">
          <p className="text-foreground-secondary break-all">
            <span className="text-accent-cyan font-medium">Analyzing:</span> {url}
          </p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-4 max-w-2xl mx-auto mb-12">
        {analysisSteps.map((step, index) => (
          <div
            key={index}
            className={`
              glass rounded-xl p-6 smooth-transition border
              ${index === currentStep 
                ? 'border-accent-cyan glow-cyan scale-105' 
                : index < currentStep 
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-glass-border'
              }
            `}
          >
            <div className="flex items-center space-x-4">
              {/* Step Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${index === currentStep 
                  ? `bg-gradient-to-r ${step.color} glow-cyan animate-pulse` 
                  : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-surface-elevated'
                }
                smooth-transition
              `}>
                {index < currentStep ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 text-left">
                <h3 className={`
                  font-semibold 
                  ${index === currentStep ? 'text-accent-cyan' : 'text-foreground'}
                  smooth-transition
                `}>
                  {step.title}
                </h3>
                <p className="text-sm text-foreground-secondary">
                  {step.description}
                </p>
              </div>
              
              {/* Loading Indicator */}
              {index === currentStep && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Platform Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
        {[
          { name: 'ChatGPT', status: 'Scanning', color: 'green', delay: '0s' },
          { name: 'Claude', status: 'Analyzing', color: 'orange', delay: '0.5s' },
          { name: 'Perplexity', status: 'Processing', color: 'blue', delay: '1s' },
          { name: 'Gemini', status: 'Evaluating', color: 'purple', delay: '1.5s' }
        ].map((platform) => (
          <div key={platform.name} className="glass rounded-xl p-4">
            <div className={`w-3 h-3 bg-${platform.color}-400 rounded-full mx-auto mb-2 animate-pulse`} 
                 style={{ animationDelay: platform.delay }}></div>
            <div className="text-sm font-medium text-foreground mb-1">{platform.name}</div>
            <div className="text-xs text-foreground-secondary">{platform.status}</div>
          </div>
        ))}
      </div>


      {/* Estimated Time */}
      <div className="glass rounded-xl p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-center space-x-2 text-foreground-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            Deep analysis in progress • 15-25 seconds
          </span>
        </div>
      </div>
    </div>
  );
}