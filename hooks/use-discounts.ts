// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-discounts.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discountService } from "@/services/discount.service";
import { queryKeys } from "@/lib/query-keys";
import {
  AutoApplyDiscountRequest,
  CreateDiscountRequest,
} from "@/types";

// ── Active discounts (paginated, optional branch filter) ──────────────────────

export function useActiveDiscounts(branchId?: number, page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.discounts.active(branchId, page, size),
    queryFn:  () => discountService.getActive(branchId, page, size),
    staleTime: 60 * 1000,
  });
}

// ── Single discount ───────────────────────────────────────────────────────────

export function useDiscount(id: number) {
  return useQuery({
    queryKey: queryKeys.discounts.detail(id),
    queryFn:  () => discountService.getById(id),
    enabled:  !!id,
  });
}

// ── Full discount history for one inventory record ────────────────────────────

export function useDiscountHistory(inventoryId: number) {
  return useQuery({
    queryKey: queryKeys.discounts.byInventory(inventoryId),
    queryFn:  () => discountService.getByInventory(inventoryId),
    enabled:  !!inventoryId,
  });
}

// ── Active discount on one inventory record ───────────────────────────────────

export function useActiveDiscountForInventory(inventoryId: number) {
  return useQuery({
    queryKey: queryKeys.discounts.activeInventory(inventoryId),
    queryFn:  () => discountService.getActiveForInventory(inventoryId),
    enabled:  !!inventoryId,
    retry:    false,    // 204 No Content = no active discount, not an error
  });
}

// ── Discount tiers (for UI dropdowns) ────────────────────────────────────────

export function useDiscountTiers() {
  return useQuery({
    queryKey: queryKeys.discounts.tiers(),
    queryFn:  discountService.getTiers,
    staleTime: Infinity,   // tiers never change at runtime
  });
}

// ── Create discount ───────────────────────────────────────────────────────────

export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiscountRequest) => discountService.create(data),
    onSuccess: (created) => {
      // Invalidate the active list for that branch
      queryClient.invalidateQueries({ queryKey: ["discounts", "active"] });
      // Update the specific inventory's active discount cache
      queryClient.setQueryData(
        queryKeys.discounts.activeInventory(created.inventoryId),
        created
      );
      // Invalidate history for that inventory
      queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.byInventory(created.inventoryId),
      });
    },
  });
}

// ── Auto-apply tier to all qualifying items ───────────────────────────────────

export function useAutoApplyDiscounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AutoApplyDiscountRequest) => discountService.autoApply(data),
    onSuccess: () => {
      // Broad invalidation — multiple inventory records may now have discounts
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// ── Revoke discount ───────────────────────────────────────────────────────────

export function useRevokeDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      discountService.revoke(id, reason),
    onSuccess: (revoked) => {
      queryClient.setQueryData(queryKeys.discounts.detail(revoked.id), revoked);
      queryClient.invalidateQueries({ queryKey: ["discounts", "active"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.activeInventory(revoked.inventoryId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.discounts.byInventory(revoked.inventoryId),
      });
    },
  });
}
