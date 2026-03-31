// services/category.service.ts

import { api } from "@/lib/api-client";
import { CategoryRequest, CategoryResponse } from "@/types";

export const categoryService = {
  getAll: () =>
    api.get<CategoryResponse[]>("/api/v1/categories"),

  getById: (id: number) =>
    api.get<CategoryResponse>(`/api/v1/categories/${id}`),

  create: (data: CategoryRequest) =>
    api.post<CategoryResponse>("/api/v1/categories", data),

  update: (id: number, data: CategoryRequest) =>
    api.put<CategoryResponse>(`/api/v1/categories/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/api/v1/categories/${id}`),
};
