"use client";

import { useState, useCallback, useEffect } from "react";

export function useStockAnimation(currentStock: number, maxStock: number) {
  const [displayedStock, setDisplayedStock] = useState(0);
  const [stockLevel, setStockLevel] = useState<"high" | "medium" | "low">("high");

  useEffect(() => {
    const stockPercentage = (currentStock / maxStock) * 100;
    
    if (stockPercentage < 20) {
      setStockLevel("low");
    } else if (stockPercentage < 50) {
      setStockLevel("medium");
    } else {
      setStockLevel("high");
    }

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
