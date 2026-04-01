// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-inventory.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { queryKeys } from "@/lib/query-keys";
import {
  AdjustStockParams,
  InventoryRequest,
  TransferStockParams,
} from "@/types";

// ── Inventory by branch ───────────────────────────────────────────────────────

export function useInventoryByBranch(branchId: number, page = 0, size = 50) {
  return useQuery({
    queryKey: queryKeys.inventory.byBranch(branchId, page, size),
    queryFn:  () => inventoryService.getByBranch(branchId, page, size),
    enabled:  !!branchId,
    staleTime: 30 * 1000,
  });
}

// ── List all inventory ────────────────────────────────────────────────────────

export function useListAllInventory(page = 0, size = 20, branchId?: number) {
  return useQuery({
    queryKey: queryKeys.inventory.all(page, size, branchId),
    queryFn:  () => inventoryService.listAll(page, size, branchId),
    staleTime: 30 * 1000,
  });
}

// ── Low stock ─────────────────────────────────────────────────────────────────

export function useLowStock(branchId?: number) {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(branchId),
    queryFn:  () => inventoryService.getLowStock(branchId),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,  // auto-refresh every 5 minutes
  });
}

// ── Expiring soon ─────────────────────────────────────────────────────────────

export function useExpiringSoon(branchId?: number, daysAhead = 30) {
  return useQuery({
    queryKey: queryKeys.inventory.expiringSoon(branchId, daysAhead),
    queryFn:  () => inventoryService.getExpiringSoon(branchId, daysAhead),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Expired items ─────────────────────────────────────────────────────────────

export function useExpiredInventory() {
  return useQuery({
    queryKey: queryKeys.inventory.expired(),
    queryFn:  inventoryService.getExpired,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Upsert (create or update) ─────────────────────────────────────────────────

export function useUpsertInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryRequest) => inventoryService.upsert(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byBranch(vars.branchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "expiring-soon"] });
    },
  });
}

// ── Adjust stock ──────────────────────────────────────────────────────────────

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AdjustStockParams) => inventoryService.adjust(params),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byBranch(vars.branchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] });
    },
  });
}

// ── Transfer between branches ─────────────────────────────────────────────────

export function useTransferStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: TransferStockParams) => inventoryService.transfer(params),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byBranch(vars.fromBranchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.byBranch(vars.toBranchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
      queryClient.invalidateQueries({ queryKey: ["inventory", "low-stock"] });
    },
  });
}
