// services/inventory.service.ts

import { api } from '@/lib/api-client';
import {
  AdjustStockParams,
  InventoryRequest,
  InventoryResponse,
  PageResponse,
  TransferStockParams,
} from '@/types';

export const inventoryService = {
  getByBranch: (branchId: number, page = 0, size = 50) =>
    api.get<PageResponse<InventoryResponse>>(`/inventory/branch/${branchId}`, { page, size }),

  listAll: (page = 0, size = 20, branchId?: number) =>
    api.get<PageResponse<InventoryResponse>>('/inventory', {
      page,
      size,
      ...(branchId && { branchId }),
    }),

  upsert: (data: InventoryRequest) => api.post<InventoryResponse>('/inventory', data),

  addStock: (data: {
    branchId: number;
    productId: number;
    quantity: number;
    lowStockThreshold?: number;
    expiryDate?: string;
  }) => api.post<InventoryResponse>('/inventory/add-stock', data),

  adjust: ({ branchId, productId, delta, reason }: AdjustStockParams) =>
    api.patch<InventoryResponse>('/inventory/adjust', undefined, {
      branchId,
      productId,
      delta,
      reason,
    }),

  transfer: ({ fromBranchId, toBranchId, productId, quantity }: TransferStockParams) =>
    api.post<void>('/inventory/transfer', {
      fromBranchId,
      toBranchId,
      productId,
      quantity,
    }),

  getLowStock: (branchId?: number) =>
    api.get<InventoryResponse[]>('/inventory/low-stock', { branchId }),

  getExpiringSoon: (branchId?: number, daysAhead = 30) =>
    api.get<InventoryResponse[]>('/inventory/expiring-soon', {
      branchId,
      daysAhead,
    }),

  getExpired: () => api.get<InventoryResponse[]>('/inventory/expired'),
};
