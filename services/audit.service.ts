// services/audit.service.ts

import { api } from "@/lib/api-client";
import { AuditLog, PageResponse } from "@/types";

export const auditService = {
  recent: () =>
    api.get<AuditLog[]>("/api/v1/audit/recent"),

  byEntity: (type: string, id: number, page = 0, size = 20) =>
    api.get<PageResponse<AuditLog>>(`/api/v1/audit/entity/${type}/${id}`, {
      page,
      size,
    }),

  byUser: (userId: number, page = 0, size = 20) =>
    api.get<PageResponse<AuditLog>>(`/api/v1/audit/user/${userId}`, {
      page,
      size,
    }),
};
