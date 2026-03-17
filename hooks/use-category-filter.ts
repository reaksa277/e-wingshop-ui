"use client";

import { useState, useCallback } from "react";

export function useCategoryFilter<T extends { id: string }>(items: T[]) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => (item as any).category === activeCategory);

  const selectCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  return { activeCategory, selectCategory, filteredItems };
}
