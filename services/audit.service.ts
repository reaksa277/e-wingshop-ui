// services/audit.service.ts

import { api } from "@/lib/api-client";
import { AuditLog, PageResponse } from "@/types";

export const auditService = {
  recent: () =>
    api.get<AuditLog[]>("/audit/recent"),

  byEntity: (type: string, id: number, page = 0, size = 20) =>
    api.get<PageResponse<AuditLog>>(`/audit/entity/${type}/${id}`, {
      page,
      size,
    }),

  byUser: (userId: number, page = 0, size = 20) =>
    api.get<PageResponse<AuditLog>>(`/audit/user/${userId}`, {
      page,
      size,
    }),
};
