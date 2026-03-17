"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  expandOnFocus?: boolean;
}

export function SearchBar({
  placeholder = "Search for products, categories or brands...",
  onSearch,
  className,
  expandOnFocus = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div
      className={cn(
        "relative",
        expandOnFocus && "search-expand",
        isFocused && "border-brand",
        className
      )}
    >
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-12 pr-12 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      
      {/* Search icon */}
      <Search
        className={cn(
          "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors",
          isFocused && "text-brand"
        )}
      />

      {/* Animated search button */}
      <button
        className={cn(
          "absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-all duration-300 hover:scale-105 hover:bg-brand-dark",
          isFocused && "scale-110"
        )}
        onClick={() => onSearch?.(query)}
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}
