"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import { LoginRequest, RegisterRequest } from "@/types";
import { tokenStore } from "@/lib/api-client";

// ── Current user ──────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey:  queryKeys.users.me(),
    queryFn:   authService.me,
    enabled:   !!tokenStore.getAccess(),
    staleTime: 5 * 60 * 1000,   // 5 minutes
    retry:     false,
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.me(), {
        id:       data.userId,
        fullName: data.fullName,
        email:    data.email,
        role:     data.role,
      });
    },
  });
}

// ── Register ──────────────────────────────────────────────────────────────────

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.me(), {
        id:       data.userId,
        fullName: data.fullName,
        email:    data.email,
        role:     data.role,
      });
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => authService.logout(),
    onSuccess:  () => queryClient.clear(),
  });
}
