// ─────────────────────────────────────────────────────────────────────────────
// services/branch.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import { BranchRequest, BranchResponse } from "@/types";

export const branchService = {
  getAll: () =>
    api.get<BranchResponse[]>("/api/v1/branches"),

  getById: (id: number) =>
    api.get<BranchResponse>(`/api/v1/branches/${id}`),

  getNearby: (lat: number, lng: number, radiusKm = 10) =>
    api.get<BranchResponse[]>("/api/v1/branches/nearby", { lat, lng, radiusKm }),

  create: (data: BranchRequest) =>
    api.post<BranchResponse>("/api/v1/branches", data),

  update: (id: number, data: BranchRequest) =>
    api.put<BranchResponse>(`/api/v1/branches/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/api/v1/branches/${id}`),
};
