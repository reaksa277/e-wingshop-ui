// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-users.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { queryKeys } from '@/lib/query-keys';
import { CreateStaffRequest, RoleName } from '@/types';

// ── List all users (OWNER / ADMIN) ────────────────────────────────────────────

export function useUsers(page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.users.all(page, size),
    queryFn: () => userService.list(page, size),
  });
}

// ── Single user ───────────────────────────────────────────────────────────────

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

// ── Current authenticated user ────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ── Update own profile ────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string }) => userService.updateMe(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.users.me(), updated);
    },
  });
}

// ── Create staff account (OWNER) ──────────────────────────────────────────────

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => userService.createStaff(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ── Change role (OWNER) ───────────────────────────────────────────────────────

export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: RoleName }) => userService.changeRole(id, role),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(queryKeys.users.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ── Reset password (OWNER / ADMIN) ────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      userService.resetPassword(id, password),
  });
}

// ── Assign manager to branch ──────────────────────────────────────────────────

export function useAssignManagerBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, branchId }: { id: number; branchId: number }) =>
      userService.assignManagerBranch(id, branchId),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(queryKeys.users.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
