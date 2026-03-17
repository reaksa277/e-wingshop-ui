"use client";

import { ProductCard } from "./ProductCard";

const mockProducts = [
  {
    id: "1",
    image: "🍌",
    badge: "Best Sale" as const,
    discount: "29% OFF",
    name: "Fresh Organic Bananas",
    weight: "1 bunch (approx. 6-8)",
    origin: "",
    rating: 4.8,
    reviewCount: 234,
    price: 4.99,
    originalPrice: 6.99,
  },
  {
    id: "2",
    image: "🍎",
    name: "Premium Red Apples",
    weight: "1 kg",
    rating: 4.7,
    reviewCount: 189,
    price: 8.50,
  },
  {
    id: "3",
    image: "🥚",
    badge: "Best Sale" as const,
    discount: "20% OFF",
    name: "Fresh Farm Eggs",
    weight: "12 pieces",
    origin: "",
    rating: 4.9,
    reviewCount: 456,
    price: 12.00,
    originalPrice: 15.00,
  },
  {
    id: "4",
    image: "🥛",
    name: "Whole Milk",
    weight: "1 liter",
    rating: 4.6,
    reviewCount: 312,
    price: 6.50,
  },
  {
    id: "5",
    image: "🍗",
    name: "Fresh Chicken Breast",
    weight: "500g",
    rating: 4.8,
    reviewCount: 178,
    price: 22.00,
  },
  {
    id: "6",
    image: "🍞",
    discount: "21% OFF",
    name: "Whole Wheat Bread",
    weight: "400g loaf",
    rating: 4.5,
    reviewCount: 267,
    price: 5.50,
    originalPrice: 7.00,
  },
  {
    id: "7",
    image: "🧃",
    name: "Fresh Orange Juice",
    weight: "1 liter",
    rating: 4.7,
    reviewCount: 145,
    price: 9.99,
  },
  {
    id: "8",
    image: "🥜",
    badge: "Best Sale" as const,
    name: "Mixed Nuts Pack",
    weight: "250g",
    rating: 4.9,
    reviewCount: 89,
    price: 18.00,
  },
  {
    id: "9",
    image: "🥑",
    name: "Fresh Avocados",
    weight: "4 pieces",
    rating: 4.8,
    reviewCount: 201,
    price: 14.00,
  },
  {
    id: "10",
    image: "🥣",
    name: "Greek Yogurt",
    weight: "500g",
    rating: 4.6,
    reviewCount: 156,
    price: 8.00,
  },
  {
    id: "11",
    image: "🐟",
    discount: "18% OFF",
    name: "Fresh Salmon Fillet",
    weight: "400g",
    rating: 4.9,
    reviewCount: 98,
    price: 45.00,
    originalPrice: 55.00,
  },
  {
    id: "12",
    image: "🥐",
    name: "Croissants",
    weight: "4 pieces",
    rating: 4.7,
    reviewCount: 234,
    price: 10.00,
  },
];

interface ProductGridProps {
  selectedCategory?: string;
}

export function ProductGrid({ selectedCategory = "all" }: ProductGridProps) {
  // For now, show all products regardless of category
  // Can be enhanced later with proper category filtering
  const filteredProducts = mockProducts;

  return (
    <section className="w-full bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-nunito-sans text-2xl font-bold text-[#1a1a1a]">
            All Products
          </h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} products
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              badge={product.badge}
              discount={product.discount}
              name={product.name}
              weight={product.weight}
              origin={product.origin}
              rating={product.rating}
              reviewCount={product.reviewCount}
              price={product.price}
              originalPrice={product.originalPrice}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
