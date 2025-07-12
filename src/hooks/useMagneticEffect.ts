'use client';

import { useEffect, useRef } from 'react';

interface MagneticOptions {
  strength?: number;
  radius?: number;
  damping?: number;
}

export function useMagneticEffect<T extends HTMLElement = HTMLButtonElement>({
  strength = 0.3,
  radius = 100,
  damping = 0.8
}: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const animationFrame = useRef<number | undefined>(undefined);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      if (distance < radius) {
        const force = 1 - (distance / radius);
        target.current = {
          x: distanceX * strength * force,
          y: distanceY * strength * force
        };
      } else {
        target.current = { x: 0, y: 0 };
      }
    };

    const handleMouseLeave = () => {
      target.current = { x: 0, y: 0 };
    };

    const animate = () => {
      position.current.x += (target.current.x - position.current.x) * damping;
      position.current.y += (target.current.y - position.current.y) * damping;
      
      if (element) {
        element.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
      }
      
      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [strength, radius, damping]);

  return ref;
}