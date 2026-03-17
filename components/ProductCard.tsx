"use client";

import { Star, ShoppingCart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  image: string;
  badge?: "Best Sale" | "Organic" | "Frozen" | string;
  discount?: string;
  name: string;
  weight: string;
  origin?: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
}

export function ProductCard({
  id,
  image,
  badge,
  discount,
  name,
  weight,
  origin,
  rating,
  reviewCount,
  price,
  originalPrice,
}: ProductCardProps) {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  const getBadgeStyles = (badgeName: string) => {
    switch (badgeName) {
      case "Best Sale":
        return "bg-brand-light text-brand-dark";
      case "Organic":
        return "bg-brand text-white";
      case "Frozen":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-brand-light text-brand-dark";
    }
  };

  return (
    <div
      onClick={() => router.push(`/products/${id}`)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-card transition-all duration-200 hover:scale-[1.02] hover:shadow-hover"
    >
      {/* Top badges */}
      <div className="absolute left-3 right-3 top-3 z-10 flex items-start justify-between">
        {badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeStyles(badge)}`}
          >
            {badge}
          </span>
        )}
        {discount && (
          <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            {discount}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="mb-3 mt-6 flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pale to-cream transition-colors group-hover:from-brand-light/50 group-hover:to-brand-pale">
        <span className="transform text-6xl transition-transform duration-300 group-hover:scale-110">
          {image}
        </span>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col space-y-2">
        {/* Product Name */}
        <h3 className="font-display text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand">
          {name}
        </h3>

        {/* Weight / Origin */}
        {origin && (
          <p className="text-xs text-gray-500">{origin} • {weight}</p>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold text-amber-800">{rating}</span>
          </div>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        {/* Price and Add Button */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-brand">
              AED {price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                AED {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAdded(true);
              setTimeout(() => setIsAdded(false), 1500);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow-green ${
              isAdded ? "scale-125 animate-bounce bg-green-600 hover:bg-green-600" : "active:scale-95"
            }`}
          >
            {isAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
