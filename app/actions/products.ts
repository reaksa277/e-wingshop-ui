'use server';

import { apiGet, apiPost, apiPut, apiDelete, type PaginatedResponse } from '@/lib/api-client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

const productSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  sku:      z.string().min(1, 'SKU is required'),
  price:    z.coerce.number().positive('Price must be positive'),
  stock:    z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  branchId: z.string().min(1, 'Branch is required'),
});

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  page?:     number;
  size?:     number;
  search?:   string;
  category?: string;
  branchId?: string;
}) {
  const result = await apiGet<PaginatedResponse<Product>>('/products', {
    page:     params?.page     ?? 0,
    size:     params?.size     ?? 20,
    search:   params?.search,
    category: params?.category,
    branchId: params?.branchId,
  });

  if (!result.success) {
    return { success: false, error: result.error, data: null };
  }

  return { success: true, data: result.data! };
}

export async function getProductById(id: string) {
  const result = await apiGet<Product>(`/products/${id}`);

  if (!result.success) {
    return { success: false, error: result.error, data: null };
  }

  return { success: true, data: result.data! };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    name:     formData.get('name'),
    sku:      formData.get('sku'),
    price:    formData.get('price'),
    stock:    formData.get('stock'),
    category: formData.get('category'),
    branchId: formData.get('branchId'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await apiPost<Product>('/products', parsed.data);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/products');
  return { success: true, data: result.data };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, formData: FormData) {
  const parsed = productSchema.partial().safeParse({
    name:     formData.get('name'),
    sku:      formData.get('sku'),
    price:    formData.get('price'),
    stock:    formData.get('stock'),
    category: formData.get('category'),
    branchId: formData.get('branchId'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await apiPut<Product>(`/products/${id}`, parsed.data);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/${id}`);
  return { success: true, data: result.data };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  const result = await apiDelete(`/products/${id}`);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath('/dashboard/products');
  return { success: true };
}