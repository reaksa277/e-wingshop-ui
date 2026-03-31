"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { userService } from "@/services/user.service";
import type {
  UserListParams,
  CreateStaffRequest,
  ChangeRoleBody,
  ResetPasswordBody,
  UpdateProfileBody,
  RoleName,
} from "@/types";

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey:        queryKeys.users.all(params?.page, params?.size),
    queryFn:         () => userService.list(params?.page, params?.size),
    placeholderData: keepPreviousData,
    staleTime:       30_000,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn:  () => userService.getById(id),
    enabled:  !!id,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey:  queryKeys.auth.me(),
    queryFn:   userService.me,
    staleTime: 5 * 60_000,
  });
}

/** POST /api/v1/users/staff  (OWNER) */
export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStaffRequest) => userService.createStaff(body),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

/** PATCH /api/v1/users/{id}/role  (OWNER) */
export function useChangeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ChangeRoleBody }) =>
      userService.changeRole(id, body.role as RoleName),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

/** PATCH /api/v1/users/{id}/reset-password  (OWNER|ADMIN) */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ResetPasswordBody }) =>
      userService.resetPassword(id, body.password),
  });
}

/** PATCH /api/v1/users/me */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) => userService.updateMe(body),
    onSuccess:  (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data);
    },
  });
}
