"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatNumber = (num: number, digits: number = 2) => {
    return num.toString().padStart(digits, "0");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">

      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="shrink-0">
            <h1 className="font-display text-2xl font-bold text-brand">
              E-Wingshop
            </h1>
          </a>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-xl items-center gap-2 md:flex">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full border-gray-300 bg-[#f5f6f8] pr-10 text-sm focus:border-brand focus:ring-brand"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="/"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-brand"
              >
                Home
              </a>
              <a
                href="/products"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-brand"
              >
                Products
              </a>
              <a
                href="/deals"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-brand"
              >
                Deals
              </a>
            </nav>

            {/* User & Cart */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-brand-pale"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
              <a
                href="/cart"
                className="relative rounded-full hover:bg-brand-pale"
              > 
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                  0
                </span>
              </a>
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-full border-gray-300 bg-[#f5f6f8] pr-10 text-sm focus:border-brand focus:ring-brand"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="flex flex-col space-y-4 p-4">
            <a
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-brand"
            >
              Home
            </a>
            <a
              href="/categories"
              className="text-sm font-medium text-gray-700 hover:text-brand"
            >
              Categories
            </a>
            <a
              href="/deals"
              className="text-sm font-medium text-gray-700 hover:text-brand"
            >
              Deals
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
