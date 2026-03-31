// services/user.service.ts

import { api } from "@/lib/api-client";
import { CreateStaffRequest, PageResponse, RoleName, UserResponse } from "@/types";

export const userService = {
  list: (page = 0, size = 20) =>
    api.get<PageResponse<UserResponse>>("/api/v1/users", { page, size }),

  getById: (id: number) =>
    api.get<UserResponse>(`/api/v1/users/${id}`),

  me: () =>
    api.get<UserResponse>("/api/v1/users/me"),

  updateMe: (data: { fullName?: string; phone?: string }) =>
    api.patch<UserResponse>("/api/v1/users/me", data),

  createStaff: (data: CreateStaffRequest) =>
    api.post<UserResponse>("/api/v1/users/staff", data),

  changeRole: (id: number, role: RoleName) =>
    api.patch<UserResponse>(`/api/v1/users/${id}/role`, { role }),

  resetPassword: (id: number, password: string) =>
    api.patch<void>(`/api/v1/users/${id}/reset-password`, { password }),
};
