// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-products.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { productService, ProductSearchParams } from "@/services/product.service";
import { queryKeys } from "@/lib/query-keys";
import { ProductRequest, ProductResponse } from "@/types";

// ── List / search ─────────────────────────────────────────────────────────────

export function useProducts(params?: ProductSearchParams) {
  return useQuery({
    queryKey: queryKeys.products.all(params),
    queryFn:  () => productService.search(params),
    staleTime: 30 * 1000,
  });
}

// ── Single product ────────────────────────────────────────────────────────────

export function useProduct(id: number): UseQueryResult<ProductResponse | undefined> {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn:  () => productService.getById(id),
    enabled:  !!id,
  });
}

// ── Barcode lookup ────────────────────────────────────────────────────────────

export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: queryKeys.products.byBarcode(barcode),
    queryFn:  () => productService.getByBarcode(barcode),
    enabled:  barcode.length >= 3,
    staleTime: 60 * 1000,
    retry:    false,   // 404 is expected for unknown barcodes
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductRequest) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductRequest) => productService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.products.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
