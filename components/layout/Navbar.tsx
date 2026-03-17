'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Globe,
  DollarSign,
  Package,
  Phone,
  X,
  Menu,
  Leaf,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount] = useState(3);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products', hasDropdown: true },
    { label: 'Fruits & Vegetables', href: '/categories/fruits-vegetables' },
    { label: 'Beverages', href: '/categories/beverages' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Row 1: Utility Bar */}
      <div className="hidden border-b border-gray-100 bg-brand-pale/50 px-8 py-2 lg:block">
        <div className="flex items-center justify-between">
          {/* Left: Utility Links */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="/about" className="hover:text-brand">
              About Us
            </a>
            <span className="text-gray-300">|</span>
            <a href="/account" className="hover:text-brand">
              My Account
            </a>
            <span className="text-gray-300">|</span>
            <a href="/wishlist" className="hover:text-brand">
              Wishlist
            </a>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-brand-dark">
              <Phone className="h-3 w-3" />
              We deliver to you every day from 7:00am-11:00pm
            </span>
          </div>

          {/* Right: Language, Currency, Tracking */}
          <div className="flex items-center gap-4 text-xs">
            <button className="flex items-center gap-1 text-gray-600 hover:text-brand">
              <Globe className="h-3.5 w-3.5" />
              English
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-brand">
              <DollarSign className="h-3.5 w-3.5" />
              USD
              <ChevronDown className="h-3 w-3" />
            </button>
            <a href="/orders" className="flex items-center gap-1 text-gray-600 hover:text-brand">
              <Package className="h-3.5 w-3.5" />
              Order Tracking
            </a>
          </div>
        </div>
      </div>

      {/* Row 2: Main Nav */}
      <div className="border-b border-gray-100 px-4 py-3 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light">
              <Leaf className="h-6 w-6 text-brand" />
            </div>
            <span className="font-display text-xl font-bold text-brand">E-Wingshop</span>
          </Link>

          {/* Location Pill - Desktop */}
          <button className="hidden items-center gap-2 rounded-full bg-brand-pale px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-light md:flex">
            <MapPin className="h-4 w-4" />
            Deliver to Dubai
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden w-[45%] md:block">
            <Input
              type="text"
              placeholder="Search for products, categories or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white pr-12 text-sm focus:border-brand focus:ring-brand"
            />
            <button className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-transform hover:scale-105">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden flex-col items-center gap-1 text-gray-600 transition-colors hover:text-brand lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Account</span>
            </button>

            <button className="hidden flex-col items-center gap-1 text-gray-600 transition-colors hover:text-brand lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Wishlist</span>
            </button>

            <button className="relative flex flex-col items-center gap-1 text-gray-600 transition-colors hover:text-brand">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Free Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-full border border-gray-200 bg-white pr-12 text-sm focus:border-brand focus:ring-brand"
            />
            <button className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Category Nav */}
      <div className="hidden border-b border-gray-100 px-8 py-2 lg:block">
        <div className="flex items-center justify-between">
          {/* Left Nav Links */}
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-brand"
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
            ))}
          </nav>

          {/* Right: Trending & Almost Finished */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-full border-2 border-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50">
              🔥 Trending Products
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white animate-pulse">
              ⏰ Almost Finished
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white lg:hidden">
          <nav className="flex flex-col space-y-3 p-4">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Shop
            </Link>
            <Link
              href="/categories/fruits-vegetables"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Fruits & Vegetables
            </Link>
            <Link
              href="/categories/beverages"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Beverages
            </Link>
            <Link
              href="/blog"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
            >
              Contact
            </Link>
            <div className="border-t pt-3">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-pale hover:text-brand"
              >
                <Package className="h-4 w-4" />
                Order Tracking
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
