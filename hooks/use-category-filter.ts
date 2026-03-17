'use client';

import { useState, useCallback } from 'react';

export function useCategoryFilter<T extends { id: string; category?: string }>(items: T[]) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems =
    activeCategory === 'all' ? items : items.filter((item) => item.category === activeCategory);

  const selectCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  return { activeCategory, selectCategory, filteredItems };
}
