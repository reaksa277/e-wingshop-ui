"use client";

import { useState, useCallback } from "react";

export function useWishlist() {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleWishlist = useCallback(() => {
    setIsAnimating(true);
    setIsWishlisted((prev) => !prev);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  }, []);

  return { isWishlisted, isAnimating, toggleWishlist };
}
