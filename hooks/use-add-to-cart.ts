'use client';

import { useState, useCallback } from 'react';

interface UseAddToCartReturn {
  isAdded: boolean;
  isBouncing: boolean;
  addToCart: () => void;
}

/**
 * Hook to handle add to cart animation and state
 * @returns Object with isAdded, isBouncing, and addToCart function
 */
export function useAddToCart(): UseAddToCartReturn {
  const [isAdded, setIsAdded] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const addToCart = useCallback(() => {
    // Trigger bounce animation
    setIsBouncing(true);
    
    // Trigger added state
    setIsAdded(true);

    // Reset bounce after animation
    setTimeout(() => {
      setIsBouncing(false);
    }, 600);

    // Reset added state after delay
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }, []);

  return { isAdded, isBouncing, addToCart };
}
