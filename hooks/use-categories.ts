'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { categoryService } from '@/services/category.service';
import type { CategoryBody } from '@/types';

/** GET /api/v1/categories */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: categoryService.getAll,
    staleTime: 60_000,
  });
}

/** GET /api/v1/categories/{id} */
export function useCategory(id: number) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

/** POST /api/v1/categories  (OWNER|ADMIN) */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryBody) => categoryService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

/** PUT /api/v1/categories/{id}  (OWNER|ADMIN) */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CategoryBody }) =>
      categoryService.update(id, body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.categories.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

/** DELETE /api/v1/categories/{id}  (OWNER) */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}
