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
  [key: string]: string | number | boolean | undefined | null;
}

export const productService = {
  search: (params?: ProductSearchParams) =>
    api.get<PageResponse<ProductResponse>>("/products", params),

  getById: (id: number) =>
    api.get<ProductResponse>(`/products/${id}`),

  getByBarcode: (barcode: string) =>
    api.get<ProductResponse>(`/products/barcode/${encodeURIComponent(barcode)}`),

  create: (data: ProductRequest) =>
    api.post<ProductResponse>("/products", data),

  update: (id: number, data: ProductRequest) =>
    api.put<ProductResponse>(`/products/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/products/${id}`),
};
