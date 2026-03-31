// ─────────────────────────────────────────────────────────────────────────────
// services/branch.service.ts
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "@/lib/api-client";
import { BranchRequest, BranchResponse } from "@/types";

export const branchService = {
  getAll: () =>
    api.get<BranchResponse[]>("/branches"),

  getById: (id: number) =>
    api.get<BranchResponse>(`/branches/${id}`),

  getNearby: (lat: number, lng: number, radiusKm = 10) =>
    api.get<BranchResponse[]>("/branches/nearby", { lat, lng, radiusKm }),

  create: (data: BranchRequest) =>
    api.post<BranchResponse>("/branches", data),

  update: (id: number, data: BranchRequest) =>
    api.put<BranchResponse>(`/branches/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/branches/${id}`),
};
