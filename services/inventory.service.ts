// services/inventory.service.ts

import { api } from "@/lib/api-client";
import {
  AdjustStockParams,
  InventoryRequest,
  InventoryResponse,
  PageResponse,
  TransferStockParams,
} from "@/types";

export const inventoryService = {
  getByBranch: (branchId: number, page = 0, size = 50) =>
    api.get<PageResponse<InventoryResponse>>(
      `/api/v1/inventory/branch/${branchId}`,
      { page, size }
    ),

  upsert: (data: InventoryRequest) =>
    api.post<InventoryResponse>("/api/v1/inventory", data),

  adjust: ({ branchId, productId, delta, reason }: AdjustStockParams) =>
    api.patch<InventoryResponse>("/api/v1/inventory/adjust", undefined, {
      branchId,
      productId,
      delta,
      reason,
    }),

  transfer: ({ fromBranchId, toBranchId, productId, quantity }: TransferStockParams) =>
    api.post<void>("/api/v1/inventory/transfer", undefined, {
      fromBranchId,
      toBranchId,
      productId,
      quantity,
    } as any),

  getLowStock: (branchId?: number) =>
    api.get<InventoryResponse[]>("/api/v1/inventory/low-stock", { branchId }),

  getExpiringSoon: (branchId?: number, daysAhead = 30) =>
    api.get<InventoryResponse[]>("/api/v1/inventory/expiring-soon", {
      branchId,
      daysAhead,
    }),

  getExpired: () =>
    api.get<InventoryResponse[]>("/api/v1/inventory/expired"),
};
