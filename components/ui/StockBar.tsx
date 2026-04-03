'use client';

import { cn } from '@/lib/utils';
import { useStockAnimation } from '@/hooks/use-stock-animation';

interface StockBarProps {
  currentStock: number;
  maxStock: number;
  showLabel?: boolean;
  className?: string;
}

export function StockBar({ currentStock, maxStock, showLabel = true, className }: StockBarProps) {
  const { displayedStock, stockLevel } = useStockAnimation(currentStock, maxStock);
  const percentage = Math.min((currentStock / maxStock) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            {displayedStock} / {maxStock} in stock
          </span>
          <span
            className={cn(
              'font-semibold',
              stockLevel === 'low' && 'text-destructive',
              stockLevel === 'medium' && 'text-accent',
              stockLevel === 'high' && 'text-primary'
            )}
          >
            {stockLevel === 'low' && '🔥 Selling fast!'}
            {stockLevel === 'medium' && '✓ Available'}
            {stockLevel === 'high' && '✓ In stock'}
          </span>
        </div>
      )}

      <div className="stock-bar">
        <div
          className={cn(
            'stock-bar-fill',
            stockLevel === 'low' && 'low',
            stockLevel === 'medium' && 'medium'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
