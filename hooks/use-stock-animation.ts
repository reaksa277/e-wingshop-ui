'use client';

import { useState, useEffect, useMemo } from 'react';

export function useStockAnimation(currentStock: number, maxStock: number) {
  const [displayedStock, setDisplayedStock] = useState(0);

  const stockLevel = useMemo<'high' | 'medium' | 'low'>(() => {
    const stockPercentage = (currentStock / maxStock) * 100;

    if (stockPercentage < 20) {
      return 'low';
    } else if (stockPercentage < 50) {
      return 'medium';
    } else {
      return 'high';
    }
  }, [currentStock, maxStock]);

  useEffect(() => {
    // Animate from 0 to current stock
    const duration = 800;
    const steps = 20;
    const increment = currentStock / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= currentStock) {
        setDisplayedStock(currentStock);
        clearInterval(interval);
      } else {
        setDisplayedStock(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [currentStock, maxStock]);

  return { displayedStock, stockLevel };
}
