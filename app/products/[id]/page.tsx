"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  Star,
  ChevronLeft,
  Share2,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Leaf,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Product {
  id: string;
  image: string;
  badge?: "Organic" | "Best Sale" | "Frozen";
  discount?: string;
  name: string;
  weight: string;
  origin?: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  description: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fiber: string;
    fat: string;
  };
  stock: number;
  category: string;
  features?: string[];
}

// Sample product data (in real app, fetch from API)
const products: Record<string, Product> = {
  "1": {
    id: "1",
    image: "🍎",
    badge: "Organic" as const,
    discount: "20% OFF",
    name: "Fresh Organic Apples",
    weight: "1000gm",
    origin: "Imported from South Africa",
    rating: 4.8,
    reviewCount: 124,
    price: 12.99,
    originalPrice: 16.99,
    description: "Premium quality organic apples, hand-picked from the finest orchards in South Africa. Rich in vitamins and fiber, these crisp and juicy apples are perfect for snacking, baking, or making fresh juice.",
    nutrition: {
      calories: "52 kcal",
      protein: "0.3g",
      carbs: "14g",
      fiber: "2.4g",
      fat: "0.2g",
    },
    stock: 45,
    category: "fruits",
    features: ["Pesticide-free", "Non-GMO", "Rich in Vitamin C"],
  },
  "2": {
    id: "2",
    image: "🥛",
    badge: "Best Sale" as const,
    name: "Full Cream Milk",
    weight: "1L",
    origin: "Local Farm",
    rating: 4.5,
    reviewCount: 89,
    price: 5.99,
    description: "Fresh full cream milk sourced from local farms. Rich in calcium and protein, perfect for drinking, cooking, or baking. Pasteurized and homogenized for quality and safety.",
    nutrition: {
      calories: "61 kcal",
      protein: "3.2g",
      carbs: "4.8g",
      fiber: "0g",
      fat: "3.3g",
    },
    stock: 120,
    category: "dairy",
    features: ["Farm Fresh", "Pasteurized", "High in Calcium"],
  },
  "3": {
    id: "3",
    image: "🍦",
    badge: "Frozen" as const,
    discount: "15% OFF",
    name: "Vanilla Ice Cream",
    weight: "500ml",
    origin: "Local",
    rating: 4.7,
    reviewCount: 56,
    price: 8.99,
    originalPrice: 10.99,
    description: "Creamy vanilla ice cream made with real vanilla beans. A classic dessert favorite that pairs perfectly with any topping or stands alone as a sweet treat.",
    nutrition: {
      calories: "207 kcal",
      protein: "3.5g",
      carbs: "24g",
      fiber: "0.5g",
      fat: "11g",
    },
    stock: 30,
    category: "snacks",
    features: ["Real Vanilla", "No Artificial Colors", "Creamy Texture"],
  },
  "4": {
    id: "4",
    image: "🥖",
    name: "Whole Wheat Bread",
    weight: "400gm",
    origin: "Baked Daily",
    rating: 4.3,
    reviewCount: 201,
    price: 3.99,
    description: "Freshly baked whole wheat bread made with 100% whole grain flour. High in fiber and nutrients, perfect for sandwiches, toast, or enjoying with your favorite spread.",
    nutrition: {
      calories: "265 kcal",
      protein: "13g",
      carbs: "49g",
      fiber: "7g",
      fat: "3.5g",
    },
    stock: 60,
    category: "bakery",
    features: ["100% Whole Grain", "High Fiber", "No Preservatives"],
  },
  "5": {
    id: "5",
    image: "🥚",
    badge: "Organic" as const,
    name: "Farm Fresh Eggs",
    weight: "12 pack",
    origin: "Local Farm",
    rating: 4.9,
    reviewCount: 312,
    price: 14.99,
    description: "Fresh organic eggs from free-range hens. Rich in protein and essential nutrients, these farm-fresh eggs are perfect for breakfast, baking, or any meal.",
    nutrition: {
      calories: "155 kcal",
      protein: "13g",
      carbs: "1.1g",
      fiber: "0g",
      fat: "11g",
    },
    stock: 85,
    category: "dairy",
    features: ["Free Range", "Omega-3 Rich", "Grade A"],
  },
  "6": {
    id: "6",
    image: "🧀",
    discount: "10% OFF",
    name: "Cheddar Cheese Slices",
    weight: "200gm",
    origin: "Imported",
    rating: 4.6,
    reviewCount: 78,
    price: 9.99,
    originalPrice: 11.99,
    description: "Premium aged cheddar cheese slices with a rich, sharp flavor. Perfect for sandwiches, burgers, or enjoying with crackers. Made from 100% real cheese.",
    nutrition: {
      calories: "403 kcal",
      protein: "25g",
      carbs: "1.3g",
      fiber: "0g",
      fat: "33g",
    },
    stock: 40,
    category: "dairy",
    features: ["Aged 12 Months", "Real Cheese", "Sharp Flavor"],
  },
  "7": {
    id: "7",
    image: "🥤",
    name: "Orange Juice",
    weight: "1.5L",
    origin: "Imported",
    rating: 4.4,
    reviewCount: 145,
    price: 7.99,
    description: "100% pure orange juice with no added sugar or preservatives. Packed with vitamin C and natural citrus flavor, perfect for breakfast or anytime refreshment.",
    nutrition: {
      calories: "45 kcal",
      protein: "0.7g",
      carbs: "10.4g",
      fiber: "0.2g",
      fat: "0.2g",
    },
    stock: 55,
    category: "beverages",
    features: ["100% Pure", "No Added Sugar", "Vitamin C Rich"],
  },
  "8": {
    id: "8",
    image: "🍗",
    badge: "Frozen" as const,
    name: "Chicken Breast",
    weight: "500gm",
    origin: "Local Farm",
    rating: 4.7,
    reviewCount: 234,
    price: 18.99,
    description: "Premium quality chicken breast, lean and tender. Perfect for grilling, baking, or stir-frying. High in protein and low in fat, ideal for healthy meals.",
    nutrition: {
      calories: "165 kcal",
      protein: "31g",
      carbs: "0g",
      fiber: "0g",
      fat: "3.6g",
    },
    stock: 25,
    category: "meat",
    features: ["Lean Cut", "High Protein", "Hormone-Free"],
  },
};

function Badge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Organic: "bg-brand-light text-brand-dark",
    "Best Sale": "bg-amber-100 text-amber-800",
    Frozen: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        styles[type] || "bg-gray-100 text-gray-800"
      }`}
    >
      {type === "Organic" && <Leaf className="h-3 w-3" />}
      {type}
    </span>
  );
}

function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:bg-brand-pale/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pale text-brand">
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = products[params.id as keyof typeof products];

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-lg text-gray-500">Product not found</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    console.log(`Added ${quantity} x ${product.name} to cart`);
  };

  const lowStock = product.stock <= 30;

  return (
    <div className="min-h-screen bg-cream pb-32">
      <Header />
      
      {/* Back Button & Actions Bar */}
      <div className="sticky top-[130px] z-20 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur-md shadow-sm md:top-[150px]">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-base font-semibold text-gray-900 font-display">Product Details</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100">
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="px-4">
        {/* Product Image */}
        <div className="relative mt-4 flex h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-pale to-cream shadow-card">
          <div className="animate-fade-up text-8xl">{product.image}</div>
          {product.discount && (
            <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-green">
              {product.discount}
            </span>
          )}
          {lowStock && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white animate-pulse-dot">
              Only {product.stock} left!
            </span>
          )}
        </div>

        {/* Badges */}
        {product.badge && (
          <div className="mt-4 flex justify-center">
            <Badge type={product.badge} />
          </div>
        )}

        {/* Product Name & Rating */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-display">{product.name}</h2>

          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-bold text-amber-800">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>

          {/* Weight & Origin */}
          <div className="mt-3 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span className="font-medium">{product.weight}</span>
            {product.origin && (
              <>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {product.origin}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="text-3xl font-bold text-brand">
            AED {product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-base text-gray-400 line-through">
              AED {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Features */}
        {product.features && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {product.features.map((feature, index) => (
              <span
                key={index}
                className="flex items-center gap-1 rounded-full bg-brand-pale px-3 py-1 text-xs font-medium text-brand-dark"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Accordion Sections */}
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-card">
          <Accordion
            title="Description"
            icon={<Leaf className="h-5 w-5" />}
            defaultOpen
          >
            <p className="px-3 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </Accordion>

          <Accordion title="Nutrition Facts" icon={<ShieldCheck className="h-5 w-5" />}>
            <div className="mx-3 grid grid-cols-2 gap-3 rounded-xl bg-brand-pale p-4">
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Calories</p>
                <p className="text-base font-bold text-brand-dark">{product.nutrition.calories}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Protein</p>
                <p className="text-base font-bold text-brand-dark">{product.nutrition.protein}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Carbs</p>
                <p className="text-base font-bold text-brand-dark">{product.nutrition.carbs}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Fat</p>
                <p className="text-base font-bold text-brand-dark">{product.nutrition.fat}</p>
              </div>
            </div>
          </Accordion>

          <Accordion title="Delivery & Returns" icon={<Truck className="h-5 w-5" />}>
            <div className="space-y-3 px-3">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-500">On orders over AED 50</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-500">7-day return policy for fresh products</p>
                </div>
              </div>
            </div>
          </Accordion>
        </div>

        {/* Quantity Selector */}
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center rounded-full border border-gray-200 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-l-full text-gray-600 transition-colors hover:bg-brand-pale"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-14 text-center text-sm font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-r-full text-gray-600 transition-colors hover:bg-brand-pale"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-brand">
                AED {(product.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 safe-area-bottom">
        <div className="border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md">
          <button
            onClick={handleAddToCart}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-base font-semibold text-white shadow-green transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart - AED {(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
