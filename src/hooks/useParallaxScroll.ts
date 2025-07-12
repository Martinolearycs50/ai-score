'use client';

import { useEffect, useRef, useState } from 'react';

interface ParallaxOptions {
  speed?: number;
  offset?: number;
  startInView?: boolean;
}

export function useParallaxScroll<T extends HTMLElement = HTMLDivElement>({
  speed = 0.5,
  offset = 0,
  startInView = true
}: ParallaxOptions = {}) {
  const ref = useRef<T>(null);
  const [transform, setTransform] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === 'undefined') return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      const inView = rect.top < windowHeight && rect.bottom > 0;
      setIsInView(inView);
      
      if (!inView && !startInView) return;
      
      // Calculate parallax offset
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      const yPos = rate + offset;
      
      setTransform(yPos);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [speed, offset, startInView]);

  return { ref, transform, isInView };
}