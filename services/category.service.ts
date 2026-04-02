// services/category.service.ts

import { api } from '@/lib/api-client';
import { CategoryRequest, CategoryResponse } from '@/types';

export const categoryService = {
  getAll: () => api.get<CategoryResponse[]>('/categories'),

  getById: (id: number) => api.get<CategoryResponse>(`/categories/${id}`),

  create: (data: CategoryRequest) => api.post<CategoryResponse>('/categories', data),

  update: (id: number, data: CategoryRequest) =>
    api.put<CategoryResponse>(`/categories/${id}`, data),

  delete: (id: number) => api.delete<void>(`/categories/${id}`),
};
