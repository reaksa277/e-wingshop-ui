'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Star, X } from 'lucide-react';

interface FilterSidebarProps {
  onClearFilters: () => void;
}

export function FilterSidebar({ onClearFilters }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    rating: false,
    brand: false,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = [
    { id: 'fruits', name: 'Fruits & Vegetables', count: 45 },
    { id: 'dairy', name: 'Dairy & Eggs', count: 32 },
    { id: 'meat', name: 'Meats & Seafood', count: 28 },
    { id: 'bakery', name: 'Bakery & Bread', count: 24 },
    { id: 'beverages', name: 'Beverages', count: 38 },
    { id: 'snacks', name: 'Snacks & Biscuits', count: 52 },
    { id: 'frozen', name: 'Frozen Foods', count: 19 },
    { id: 'grocery', name: 'Grocery & Staples', count: 67 },
  ];

  const brands = [
    { id: 'organic', name: 'Organic', count: 24 },
    { id: 'fresh', name: 'Fresh Farm', count: 18 },
    { id: 'premium', name: 'Premium Select', count: 15 },
    { id: 'natural', name: 'Natural Choice', count: 21 },
    { id: 'local', name: 'Local Harvest', count: 12 },
  ];

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-100 bg-white p-4">
      {/* Search Within Results */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search within results..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="rounded-xl border border-gray-100">
          <button
            onClick={() => toggleSection('category')}
            className="flex w-full items-center justify-between px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-gray-900">Filter by Category</span>
            {openSections.category ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {openSections.category && (
            <div className="space-y-2 px-3 pb-3">
              {categories.map((category) => (
                <label key={category.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="flex-1 text-sm text-gray-700">{category.name}</span>
                  <span className="text-xs text-gray-400">({category.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="rounded-xl border border-gray-100">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-gray-900">Filter by Price</span>
            {openSections.price ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {openSections.price && (
            <div className="px-3 pb-3">
              <div className="relative h-12">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="absolute h-full w-full appearance-none bg-transparent"
                  style={{
                    background: `linear-gradient(to right, #1a6b2f 0%, #1a6b2f ${priceRange[0]}%, #e5e7eb ${priceRange[0]}%, #e5e7eb ${priceRange[1]}%, #1a6b2f ${priceRange[1]}%, #1a6b2f 100%)`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">${priceRange[0]}</span>
                <span className="font-medium text-gray-700">${priceRange[1]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="rounded-xl border border-gray-100">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-gray-900">Filter by Rating</span>
            {openSections.rating ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {openSections.rating && (
            <div className="space-y-2 px-3 pb-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    selectedRating === rating ? 'bg-brand-pale' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {rating < 5 && <span className="text-xs text-gray-500">& up</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="rounded-xl border border-gray-100">
          <button
            onClick={() => toggleSection('brand')}
            className="flex w-full items-center justify-between px-3 py-2.5"
          >
            <span className="text-sm font-semibold text-gray-900">Filter by Brand</span>
            {openSections.brand ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {openSections.brand && (
            <div className="space-y-2 px-3 pb-3">
              {brands.map((brand) => (
                <label key={brand.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => toggleBrand(brand.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="flex-1 text-sm text-gray-700">{brand.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {brand.count}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* In Stock Toggle */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5">
          <span className="text-sm font-semibold text-gray-900">In Stock Only</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`h-6 w-11 rounded-full transition-colors ${
                inStockOnly ? 'bg-brand' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  inStockOnly ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
                style={{
                  transform: inStockOnly ? 'translateX(22px)' : 'translateX(2px)',
                }}
              />
            </div>
          </div>
        </label>
      </div>

      {/* Clear All Filters */}
      <button
        onClick={onClearFilters}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-pale"
      >
        <X className="h-4 w-4" />
        Clear All Filters
      </button>
    </aside>
  );
}
