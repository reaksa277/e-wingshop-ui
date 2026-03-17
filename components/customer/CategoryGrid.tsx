'use client';

import { ChevronRight } from 'lucide-react';

const categories = [
  { id: '1', name: 'Fruits & Vegetables', icon: '🥬' },
  { id: '2', name: 'Baby & Pregnancy', icon: '👶' },
  { id: '3', name: 'Beverages', icon: '🧃' },
  { id: '4', name: 'Meats & Seafood', icon: '🍤' },
  { id: '5', name: 'Biscuits & Snacks', icon: '🍪' },
  { id: '6', name: 'Breads & Bakery', icon: '🥖' },
  { id: '7', name: 'Breakfast & Dairy', icon: '🥛' },
  { id: '8', name: 'Frozen Foods', icon: '🧊' },
  { id: '9', name: 'Grocery & Staples', icon: '🛒' },
];

export function CategoryGrid() {
  return (
    <section className="px-8 py-8">
      {/* Section Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Top Categories</h2>
          <p className="mt-1 text-xs text-gray-500">New products with updated stocks</p>
        </div>
        <a
          href="/categories"
          className="flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            className="group flex min-w-[100px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-center transition-all duration-200 hover:scale-[1.02] hover:border-brand hover:shadow-card active:bg-brand-pale active:border-brand"
          >
            {/* Category Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-2xl transition-transform group-hover:scale-110">
              {category.icon}
            </div>
            {/* Category Label */}
            <span className="text-xs font-semibold text-gray-700 group-hover:text-brand">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
