'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import { colors, cssVars } from '@/lib/design-system/colors';

interface EmailCaptureFormProps {
  variant?: 'inline' | 'hero' | 'cta';
  onSubmit?: (email: string) => void;
}

export default function EmailCaptureForm({ variant = 'inline', onSubmit }: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent handler or default implementation
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Default: simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Email submitted:', email);
      }

      setSubmitted(true);
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${variant === 'hero' ? 'p-8' : 'p-6'} rounded-lg border text-center`}
        style={{
          backgroundColor: `${cssVars.success}20`,
          borderColor: `${cssVars.success}40`,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-3"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="var(--outstanding)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="success-text text-lg font-medium">Success!</p>
        <p className="success-text mt-1" style={{ opacity: 0.9 }}>
          Check your email for AI optimization tips
        </p>
      </motion.div>
    );
  }

  const variants = {
    inline: {
      container: 'rounded-lg p-6',
      containerStyle: {
        backgroundColor: `${cssVars.accent}10`,
      },
      title: 'Get AI Optimization Tips',
      subtitle: 'Weekly insights to boost your AI visibility',
      formClass: 'flex gap-3 mt-4',
      inputClass: 'flex-1',
      buttonClass: 'px-6',
    },
    hero: {
      container: 'rounded-2xl p-8 shadow-lg',
      containerStyle: {
        background: `linear-gradient(to bottom right, ${cssVars.accent}10, ${cssVars.primary}10)`,
      },
      title: 'Boost Your AI Visibility',
      subtitle: 'Get exclusive tips and be first to know about new features',
      formClass: 'mt-6 space-y-3',
      inputClass: 'w-full',
      buttonClass: 'w-full',
    },
    cta: {
      container: 'rounded-lg border shadow-sm p-8 text-center',
      containerStyle: {
        backgroundColor: cssVars.card,
        borderColor: cssVars.border,
      },
      title: 'Ready to Improve Your Score?',
      subtitle: 'Get personalized recommendations delivered to your inbox',
      formClass: 'mt-6 max-w-md mx-auto space-y-3',
      inputClass: 'w-full',
      buttonClass: 'w-full',
    },
  };

  const styles = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
      style={styles.containerStyle || {}}
    >
      <h3 className="mb-2 text-xl font-medium" style={{ color: 'var(--foreground)' }}>
        {styles.title}
      </h3>
      <p className="text-muted text-sm">{styles.subtitle}</p>

      <form onSubmit={handleSubmit} className={styles.formClass}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isSubmitting}
          className={` ${styles.inputClass} border-default focus:ring-accent rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none disabled:opacity-50`}
          style={{ color: 'var(--foreground)' }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={` ${styles.buttonClass} rounded-lg px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
          style={{ backgroundColor: cssVars.accent }}
        >
          {isSubmitting ? 'Sending...' : 'Get Tips'}
        </button>
      </form>

      {error && <p className="error-text mt-2 text-sm">{error}</p>}

      <p className="text-muted mt-3 text-xs">
        No spam, unsubscribe anytime. By subscribing, you agree to our privacy policy.
      </p>
    </motion.div>
  );
}
