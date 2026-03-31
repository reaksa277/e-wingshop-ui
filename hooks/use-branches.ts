// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-branches.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/services/branch.service";
import { queryKeys } from "@/lib/query-keys";
import { BranchRequest } from "@/types";

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.all(),
    queryFn:  branchService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn:  () => branchService.getById(id),
    enabled:  !!id,
  });
}

export function useNearbyBranches(lat: number, lng: number, radiusKm = 10) {
  return useQuery({
    queryKey: queryKeys.branches.nearby(lat, lng, radiusKm),
    queryFn:  () => branchService.getNearby(lat, lng, radiusKm),
    enabled:  !!lat && !!lng,
    staleTime: 60 * 1000,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchRequest) => branchService.create(data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });
}

export function useUpdateBranch(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchRequest) => branchService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.branches.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchService.delete(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });
}
