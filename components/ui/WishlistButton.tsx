'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function WishlistButton({ productId, className, size = 'md' }: WishlistButtonProps) {
  const { isWishlisted, isAnimating, toggleWishlist } = useWishlist();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist();
      }}
      className={cn(
        'wishlist-btn rounded-full bg-gray-50 transition-colors hover:bg-gray-100',
        sizeClasses[size],
        isWishlisted && 'wishlisted',
        isAnimating && 'scale-110',
        className
      )}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className="heart-icon h-5 w-5 text-gray-600 transition-colors" />
    </button>
  );
}
