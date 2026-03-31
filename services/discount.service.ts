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
    api.get<PageResponse<ExpiryDiscountResponse>>("/discounts/active", {
      branchId,
      page,
      size,
    }),

  getById: (id: number) =>
    api.get<ExpiryDiscountResponse>(`/discounts/${id}`),

  getByInventory: (inventoryId: number) =>
    api.get<ExpiryDiscountResponse[]>(`/discounts/inventory/${inventoryId}`),

  getActiveForInventory: (inventoryId: number) =>
    api.get<ExpiryDiscountResponse>(`/discounts/inventory/${inventoryId}/active`),

  getTiers: () =>
    api.get<DiscountTierInfo[]>("/discounts/tiers"),

  create: (data: CreateDiscountRequest) =>
    api.post<ExpiryDiscountResponse>("/discounts", data),

  autoApply: (data: AutoApplyDiscountRequest) =>
    api.post<{ tier: string; created: number; message: string }>(
      "/discounts/auto-apply",
      data
    ),

  revoke: (id: number, reason = "Manually revoked") =>
    api.delete<ExpiryDiscountResponse>(
      `/discounts/${id}/revoke`,
      { reason }
    ),
};
