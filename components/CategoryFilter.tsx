"use client";

import { useState } from "react";

const categories = [
  { id: "all", name: "All Products", icon: "🛒" },
  { id: "fruits", name: "Fruits & Vegetables", icon: "🥬" },
  { id: "dairy", name: "Dairy & Eggs", icon: "🥛" },
  { id: "meat", name: "Meat & Seafood", icon: "🥩" },
  { id: "bakery", name: "Bakery", icon: "🍞" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "household", name: "Household", icon: "🧹" },
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <section className="w-full border-b bg-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-[#1a6b2f] text-white"
                  : "bg-[#f5f6f8] text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
