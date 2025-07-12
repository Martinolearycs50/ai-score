'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export function useScrollAnimation<T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  delay = 0
}: ScrollAnimationOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldShow = entry.isIntersecting;
        
        if (shouldShow && delay > 0) {
          setTimeout(() => {
            setIsVisible(true);
            if (triggerOnce) setHasTriggered(true);
          }, delay);
        } else if (shouldShow) {
          setIsVisible(true);
          if (triggerOnce) setHasTriggered(true);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasTriggered]);

  return { ref, isVisible };
}