'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { ProductsToolbar } from '@/components/products/ProductsToolbar';
import { Pagination } from '@/components/products/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const products = [
  {
    id: '1',
    image: '🍎',
    badge: 'Organic' as const,
    discount: '20% OFF',
    name: 'Fresh Organic Apples',
    weight: '1000gm',
    origin: 'Imported from South Africa',
    rating: 4.8,
    reviewCount: 124,
    price: 12.99,
    originalPrice: 16.99,
    category: 'fruits',
  },
  {
    id: '2',
    image: '🥛',
    badge: 'Best Sale' as const,
    name: 'Full Cream Milk',
    weight: '1L',
    rating: 4.5,
    reviewCount: 89,
    price: 5.99,
    category: 'dairy',
  },
  {
    id: '3',
    image: '🍦',
    badge: 'Frozen' as const,
    discount: '15% OFF',
    name: 'Vanilla Ice Cream',
    weight: '500ml',
    origin: 'Local',
    rating: 4.7,
    reviewCount: 56,
    price: 8.99,
    originalPrice: 10.99,
    category: 'snacks',
  },
  {
    id: '4',
    image: '🥖',
    name: 'Whole Wheat Bread',
    weight: '400gm',
    rating: 4.3,
    reviewCount: 201,
    price: 3.99,
    category: 'bakery',
  },
  {
    id: '5',
    image: '🥚',
    badge: 'Organic' as const,
    name: 'Farm Fresh Eggs',
    weight: '12 pack',
    origin: 'Local Farm',
    rating: 4.9,
    reviewCount: 312,
    price: 14.99,
    category: 'dairy',
  },
  {
    id: '6',
    image: '🧀',
    discount: '10% OFF',
    name: 'Cheddar Cheese Slices',
    weight: '200gm',
    rating: 4.6,
    reviewCount: 78,
    price: 9.99,
    originalPrice: 11.99,
    category: 'dairy',
  },
  {
    id: '7',
    image: '🥤',
    name: 'Orange Juice',
    weight: '1.5L',
    origin: 'Imported',
    rating: 4.4,
    reviewCount: 145,
    price: 7.99,
    category: 'beverages',
  },
  {
    id: '8',
    image: '🍗',
    badge: 'Frozen' as const,
    name: 'Chicken Breast',
    weight: '500gm',
    rating: 4.7,
    reviewCount: 234,
    price: 18.99,
    category: 'meat',
  },
  {
    id: '9',
    image: '🍌',
    badge: 'Organic' as const,
    name: 'Organic Bananas',
    weight: '1 bunch',
    rating: 4.8,
    reviewCount: 156,
    price: 4.99,
    category: 'fruits',
  },
  {
    id: '10',
    image: '🥬',
    name: 'Fresh Lettuce',
    weight: '1 head',
    rating: 4.5,
    reviewCount: 78,
    price: 2.99,
    category: 'fruits',
  },
  {
    id: '11',
    image: '🥩',
    badge: 'Best Sale' as const,
    name: 'Beef Steak',
    weight: '300gm',
    rating: 4.9,
    reviewCount: 89,
    price: 35.99,
    category: 'meat',
  },
  {
    id: '12',
    image: '🥐',
    name: 'Butter Croissant',
    weight: '4 pack',
    rating: 4.6,
    reviewCount: 112,
    price: 8.99,
    category: 'bakery',
  },
  {
    id: '13',
    image: '🍇',
    badge: 'Organic' as const,
    name: 'Red Grapes',
    weight: '500gm',
    origin: 'Imported from Chile',
    rating: 4.7,
    reviewCount: 98,
    price: 8.99,
    category: 'fruits',
  },
  {
    id: '14',
    image: '🧈',
    name: 'Salted Butter',
    weight: '250gm',
    rating: 4.5,
    reviewCount: 67,
    price: 6.49,
    category: 'dairy',
  },
  {
    id: '15',
    image: '🍊',
    discount: '25% OFF',
    name: 'Fresh Oranges',
    weight: '1kg',
    origin: 'Local Farm',
    rating: 4.6,
    reviewCount: 143,
    price: 5.99,
    originalPrice: 7.99,
    category: 'fruits',
  },
  {
    id: '16',
    image: '🥤',
    badge: 'Best Seller' as const,
    name: 'Apple Juice',
    weight: '1L',
    rating: 4.4,
    reviewCount: 89,
    price: 6.99,
    category: 'beverages',
  },
  {
    id: '17',
    image: '🍓',
    badge: 'Organic' as const,
    name: 'Fresh Strawberries',
    weight: '250gm',
    origin: 'Local Farm',
    rating: 4.8,
    reviewCount: 176,
    price: 7.99,
    category: 'fruits',
  },
  {
    id: '18',
    image: '🧊',
    name: 'Frozen Peas',
    weight: '500gm',
    rating: 4.3,
    reviewCount: 45,
    price: 3.49,
    category: 'frozen',
  },
  {
    id: '19',
    image: '🍚',
    name: 'Basmati Rice',
    weight: '2kg',
    rating: 4.7,
    reviewCount: 234,
    price: 12.99,
    category: 'grocery',
  },
  {
    id: '20',
    image: '🍝',
    discount: '15% OFF',
    name: 'Spaghetti Pasta',
    weight: '500gm',
    origin: 'Imported from Italy',
    rating: 4.5,
    reviewCount: 112,
    price: 4.99,
    originalPrice: 5.99,
    category: 'grocery',
  },
  {
    id: '21',
    image: '🥫',
    name: 'Tomato Sauce',
    weight: '400gm',
    rating: 4.4,
    reviewCount: 78,
    price: 3.99,
    category: 'grocery',
  },
  {
    id: '22',
    image: '🍫',
    badge: 'Best Sale' as const,
    name: 'Dark Chocolate Bar',
    weight: '100gm',
    rating: 4.8,
    reviewCount: 189,
    price: 5.49,
    category: 'snacks',
  },
  {
    id: '23',
    image: '🥜',
    name: 'Roasted Almonds',
    weight: '200gm',
    rating: 4.7,
    reviewCount: 156,
    price: 9.99,
    category: 'snacks',
  },
  {
    id: '24',
    image: '🍯',
    badge: 'Organic' as const,
    name: 'Pure Honey',
    weight: '500gm',
    origin: 'Local Farm',
    rating: 4.9,
    reviewCount: 267,
    price: 15.99,
    category: 'grocery',
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [sortOption, setSortOption] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [totalCartItems, setTotalCartItems] = useState(0);
  const itemsPerPage = 24;

  const handleAddToCart = (productId: string, quantity: number) => {
    setCartItems((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity,
    }));
    setTotalCartItems((prev) => prev + quantity);
  };

  const clearFilters = () => {
    setSortOption('default');
    setCurrentPage(1);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return parseInt(b.id) - parseInt(a.id);
      case 'bestselling':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <FilterSidebar onClearFilters={clearFilters} />
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-xl text-gray-600">×</span>
              </button>
            </div>
            <div className="h-[calc(100%-60px)] overflow-y-auto">
              <FilterSidebar onClearFilters={clearFilters} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Back Button */}
        <div className="border-b border-gray-100 bg-white px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        {/* Toolbar */}
        <ProductsToolbar
          totalProducts={products.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Cart Summary */}
        {totalCartItems > 0 && (
          <div className="sticky top-0 z-40 bg-brand px-6 py-3 text-center text-white shadow-md">
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {totalCartItems} item{totalCartItems > 1 ? 's' : ''} added to cart
              </span>
            </div>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <span className="text-sm text-gray-500">{products.length} products</span>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div
              className={`p-6 ${
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4'
                  : 'flex flex-col gap-4'
              }`}
            >
              {paginatedProducts.map((product) => (
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
                  onAddToCart={(quantity) => handleAddToCart(product.id, quantity)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="text-lg font-semibold text-gray-900">No products found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
