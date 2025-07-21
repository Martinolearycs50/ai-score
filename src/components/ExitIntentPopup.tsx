'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { cssVars } from '@/lib/design-system/colors';

interface ExitIntentPopupProps {
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
}

export default function ExitIntentPopup({ onClose, onEmailSubmit }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const hasShownPopup = sessionStorage.getItem('exitIntentShown');
    if (hasShownPopup) return;

    let mouseLeaveTimer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top
      if (e.clientY <= 0) {
        // Debounce to avoid multiple triggers
        clearTimeout(mouseLeaveTimer);
        mouseLeaveTimer = setTimeout(() => {
          setIsVisible(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }, 100);
      }
    };

    // Add event listener after a delay (don't show immediately)
    const setupTimer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before activating

    return () => {
      clearTimeout(setupTimer);
      clearTimeout(mouseLeaveTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      setSubmitted(true);
      // Close after success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Email submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-foreground/50 fixed inset-0 z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-card relative rounded-lg p-8 shadow-xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="text-muted hover:text-body absolute top-4 right-4 transition-colors"
                aria-label="Close popup"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {!submitted ? (
                <>
                  {/* Icon */}
                  <div className="mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto"
                    >
                      <path
                        d="M12 2L14.09 8.26L20.76 9.27L16.38 13.14L17.57 19.84L12 16.5L6.43 19.84L7.62 13.14L3.24 9.27L9.91 8.26L12 2Z"
                        fill={cssVars.primary}
                        fillOpacity="0.2"
                        stroke={cssVars.primary}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2
                    className="mb-2 text-center text-2xl font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Wait! Don't Miss Out
                  </h2>
                  <p className="text-muted mb-6 text-center">
                    Get free AI optimization tips and be the first to know when Pro features launch!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
                      style={
                        {
                          borderColor: 'var(--gray-300)',
                          color: 'var(--foreground)',
                          '--tw-ring-color': cssVars.primary,
                        } as React.CSSProperties
                      }
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg px-6 py-3 transition-colors disabled:opacity-50"
                      style={{
                        color: 'white',
                        backgroundColor: isSubmitting ? cssVars.muted : cssVars.primary,
                      }}
                      onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = '1')}
                    >
                      {isSubmitting ? 'Sending...' : 'Get Free Tips'}
                    </button>
                  </form>

                  <p className="text-muted mt-4 text-center text-xs">
                    No spam, unsubscribe anytime
                  </p>
                </>
              ) : (
                <div className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="mb-4"
                  >
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mx-auto"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke={cssVars.success}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="mb-2 text-xl font-medium" style={{ color: 'var(--foreground)' }}>
                    You're all set!
                  </h3>
                  <p className="text-muted">Check your email for AI optimization tips</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
