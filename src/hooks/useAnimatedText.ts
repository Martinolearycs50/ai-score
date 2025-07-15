'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

interface UseAnimatedTextOptions {
  duration?: number;
  scrambleDuration?: number;
  scrambleSpeed?: number;
}

export function useAnimatedText(
  text: string,
  isActive: boolean,
  options: UseAnimatedTextOptions = {}
) {
  const {
    duration = 1000,
    scrambleDuration = 500,
    scrambleSpeed = 50,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getRandomChar = () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

  const scrambleText = useCallback((targetText: string, currentLength: number) => {
    return targetText
      .split('')
      .map((char, index) => {
        if (index < currentLength) {
          return char;
        }
        return getRandomChar();
      })
      .join('');
  }, []);

  const animateText = useCallback(() => {
    if (!isActive || !text) {
      setDisplayText('');
      return;
    }

    setIsAnimating(true);
    let currentLength = 0;
    const targetLength = text.length;
    const revealDelay = duration / targetLength;

    // Start with scrambled text
    setDisplayText(scrambleText(text, 0));

    // Scramble animation
    const scrambleInterval = setInterval(() => {
      if (currentLength < targetLength) {
        setDisplayText(scrambleText(text, currentLength));
      }
    }, scrambleSpeed);

    // Reveal animation
    const revealInterval = setInterval(() => {
      currentLength++;
      if (currentLength <= targetLength) {
        setDisplayText(text.slice(0, currentLength) + scrambleText(text.slice(currentLength), 0));
      } else {
        clearInterval(scrambleInterval);
        clearInterval(revealInterval);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, revealDelay);

    intervalRef.current = revealInterval;

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(revealInterval);
    };
  }, [text, isActive, duration, scrambleSpeed, scrambleText]);

  useEffect(() => {
    if (isActive && text) {
      // Add a small delay before starting animation
      timeoutRef.current = setTimeout(() => {
        animateText();
      }, 100);
    } else {
      setDisplayText('');
      setIsAnimating(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isActive, animateText]);

  return {
    displayText,
    isAnimating,
  };
}

// Hook for cycling through multiple texts
export function useCyclingText(texts: string[], interval: number = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return {
    currentText: texts[currentIndex],
    currentIndex,
    isTransitioning,
  };
}