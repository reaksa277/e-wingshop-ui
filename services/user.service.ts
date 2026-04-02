// services/user.service.ts

import { api } from "@/lib/api-client";
import { CreateStaffRequest, PageResponse, RoleName, UserResponse } from "@/types";

export const userService = {
  list: (page = 0, size = 20) =>
    api.get<PageResponse<UserResponse>>("/users", { page, size }),

  getById: (id: number) =>
    api.get<UserResponse>(`/users/${id}`),

  me: () =>
    api.get<UserResponse>("/users/me"),

  updateMe: (data: { fullName?: string; phone?: string }) =>
    api.patch<UserResponse>("/users/me", data),

  createStaff: (data: CreateStaffRequest) =>
    api.post<UserResponse>("/users/staff", data),

  changeRole: (id: number, role: RoleName) =>
    api.patch<UserResponse>(`/users/${id}/role`, { role }),

  resetPassword: (id: number, password: string) =>
    api.patch<void>(`/users/${id}/reset-password`, { password }),

  deleteUser: (id: number) =>
    api.delete<void>(`/users/${id}`),

  assignManagerBranch: (id: number, branchId: number) =>
    api.patch<UserResponse>(`/users/${id}/manager-branch`, { branchId }),
};
