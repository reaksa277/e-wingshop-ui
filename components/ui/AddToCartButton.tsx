"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  price: number;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({
  productId,
  price,
  quantity = 1,
  className,
}: AddToCartButtonProps) {
  const { isAdded, isBouncing, addToCart } = useAddToCart();

  const total = (price * quantity).toFixed(2);

  return (
    <button
      onClick={addToCart}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-green transition-all duration-200 hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]",
        isAdded && "added",
        isBouncing && "cart-badge bounce",
        className
      )}
    >
      {isAdded ? (
        <>
          <Check className="h-5 w-5 animate-check" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Add to Cart - AED {total}
        </>
      )}
    </button>
  );
}
