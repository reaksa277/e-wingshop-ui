// ─────────────────────────────────────────────────────────────────────────────
// services/product.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import { PageResponse, ProductRequest, ProductResponse } from "@/types";

export interface ProductSearchParams {
  categoryId?: number;
  keyword?:    string;
  page?:       number;
  size?:       number;
}

export const productService = {
  search: (params?: ProductSearchParams) =>
    api.get<PageResponse<ProductResponse>>("/api/v1/products", params),

  getById: (id: number) =>
    api.get<ProductResponse>(`/api/v1/products/${id}`),

  getByBarcode: (barcode: string) =>
    api.get<ProductResponse>(`/api/v1/products/barcode/${encodeURIComponent(barcode)}`),

  create: (data: ProductRequest) =>
    api.post<ProductResponse>("/api/v1/products", data),

  update: (id: number, data: ProductRequest) =>
    api.put<ProductResponse>(`/api/v1/products/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/api/v1/products/${id}`),
};
