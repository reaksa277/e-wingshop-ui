"use client";

import { useState, useCallback } from "react";

export function useAddToCart() {
  const [isAdded, setIsAdded] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const addToCart = useCallback(() => {
    setIsAdded(true);
    setIsBouncing(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
    
    setTimeout(() => {
      setIsBouncing(false);
    }, 600);
  }, []);

  return { isAdded, isBouncing, addToCart };
}
