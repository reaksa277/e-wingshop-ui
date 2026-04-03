'use client';

import { useState, useEffect } from 'react';

type StockLevel = 'low' | 'medium' | 'high';

interface UseStockAnimationReturn {
  displayedStock: number;
  stockLevel: StockLevel;
}

/**
 * Hook to animate stock level display and determine stock status
 * @param currentStock - Current stock quantity
 * @param maxStock - Maximum stock capacity
 * @returns Object with displayedStock (animated) and stockLevel (low/medium/high)
 */
export function useStockAnimation(
  currentStock: number,
  maxStock: number
): UseStockAnimationReturn {
  const [displayedStock, setDisplayedStock] = useState(0);

  // Animate the stock count from 0 to currentStock
  useEffect(() => {
    let animationFrame: number;
    let startTime: number;
    const duration = 800; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setDisplayedStock(Math.floor(easedProgress * currentStock));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayedStock(currentStock);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [currentStock]);

  // Determine stock level
  const stockLevel: StockLevel = (() => {
    const percentage = (currentStock / maxStock) * 100;
    if (percentage <= 20) return 'low';
    if (percentage <= 50) return 'medium';
    return 'high';
  })();

  return { displayedStock, stockLevel };
}
