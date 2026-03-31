// services/discount.service.ts

import { api } from "@/lib/api-client";
import {
  AutoApplyDiscountRequest,
  CreateDiscountRequest,
  DiscountTierInfo,
  ExpiryDiscountResponse,
  PageResponse,
} from "@/types";

export const discountService = {
  getActive: (branchId?: number, page = 0, size = 20) =>
    api.get<PageResponse<ExpiryDiscountResponse>>("/api/v1/discounts/active", {
      branchId,
      page,
      size,
    }),

  getById: (id: number) =>
    api.get<ExpiryDiscountResponse>(`/api/v1/discounts/${id}`),

  getByInventory: (inventoryId: number) =>
    api.get<ExpiryDiscountResponse[]>(`/api/v1/discounts/inventory/${inventoryId}`),

  getActiveForInventory: (inventoryId: number) =>
    api.get<ExpiryDiscountResponse>(`/api/v1/discounts/inventory/${inventoryId}/active`),

  getTiers: () =>
    api.get<DiscountTierInfo[]>("/api/v1/discounts/tiers"),

  create: (data: CreateDiscountRequest) =>
    api.post<ExpiryDiscountResponse>("/api/v1/discounts", data),

  autoApply: (data: AutoApplyDiscountRequest) =>
    api.post<{ tier: string; created: number; message: string }>(
      "/api/v1/discounts/auto-apply",
      data
    ),

  revoke: (id: number, reason = "Manually revoked") =>
    api.delete<ExpiryDiscountResponse>(
      `/api/v1/discounts/${id}/revoke`,
      { reason }
    ),
};
