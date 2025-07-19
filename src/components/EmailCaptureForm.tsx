'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        className={`
          ${variant === 'hero' ? 'p-8' : 'p-6'}
          bg-green-50 rounded-lg border border-green-200 text-center
        `}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3">
          <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-lg font-medium text-green-800">Success!</p>
        <p className="text-green-700 mt-1">Check your email for AI optimization tips</p>
      </motion.div>
    );
  }

  const variants = {
    inline: {
      container: 'bg-blue-50 rounded-lg p-6',
      title: 'Get AI Optimization Tips',
      subtitle: 'Weekly insights to boost your AI visibility',
      formClass: 'flex gap-3 mt-4',
      inputClass: 'flex-1',
      buttonClass: 'px-6',
    },
    hero: {
      container: 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg',
      title: 'Boost Your AI Visibility',
      subtitle: 'Get exclusive tips and be first to know about new features',
      formClass: 'mt-6 space-y-3',
      inputClass: 'w-full',
      buttonClass: 'w-full',
    },
    cta: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center',
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
    >
      <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--foreground)' }}>
        {styles.title}
      </h3>
      <p className="text-muted text-sm">
        {styles.subtitle}
      </p>

      <form onSubmit={handleSubmit} className={styles.formClass}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isSubmitting}
          className={`
            ${styles.inputClass}
            px-4 py-3 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50
          `}
          style={{ color: 'var(--foreground)' }}
        />
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            ${styles.buttonClass}
            bg-blue-600 text-white px-6 py-3 rounded-lg 
            hover:bg-blue-700 transition-colors 
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? 'Sending...' : 'Get Tips'}
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}

      <p className="text-xs text-muted mt-3">
        No spam, unsubscribe anytime. By subscribing, you agree to our privacy policy.
      </p>
    </motion.div>
  );
}