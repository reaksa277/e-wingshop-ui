// ─────────────────────────────────────────────────────────────────────────────
// services/auth.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { api, tokenStore } from "@/lib/api-client";
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from "@/types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.postPublic<AuthResponse>("/api/v1/auth/login", data);
    tokenStore.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.postPublic<AuthResponse>("/api/v1/auth/register", data);
    tokenStore.setTokens(res.accessToken, res.refreshToken);
    return res;
  },

  logout: () => {
    tokenStore.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
  },

  me: () => api.get<UserResponse>("/api/v1/users/me"),
};
