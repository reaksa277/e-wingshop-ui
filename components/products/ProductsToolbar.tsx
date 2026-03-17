'use client';

import { Grid, List, ChevronDown } from 'lucide-react';

interface ProductsToolbarProps {
  totalProducts: number;
  currentPage: number;
  itemsPerPage: number;
  sortOption: string;
  onSortChange: (option: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ProductsToolbar({
  totalProducts,
  currentPage,
  itemsPerPage,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ProductsToolbarProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      {/* Left: Showing count */}
      <p className="text-sm text-gray-600">
        Showing{' '}
        <span className="font-semibold text-gray-900">
          {startItem}–{endItem}
        </span>{' '}
        of <span className="font-semibold text-gray-900">{totalProducts}</span> results
      </p>

      {/* Right: Sort + View Toggle */}
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest Arrivals</option>
            <option value="bestselling">Best Selling</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              viewMode === 'grid'
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              viewMode === 'list'
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
