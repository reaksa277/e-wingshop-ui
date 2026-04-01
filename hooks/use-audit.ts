// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-audit.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";
import { queryKeys } from "@/lib/query-keys";

// ── Recent 50 audit events ────────────────────────────────────────────────────

export function useRecentAuditLogs() {
  return useQuery({
    queryKey: queryKeys.audit.recent(),
    queryFn:  auditService.recent,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,  // refresh every 2 minutes
  });
}

// ── Audit trail for a specific entity (e.g. inventory record, order) ──────────

export function useEntityAuditLogs(
  entityType: string,
  entityId: number,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: queryKeys.audit.byEntity(entityType, entityId, page),
    queryFn:  () => auditService.byEntity(entityType, entityId, page, size),
    enabled:  !!entityType && !!entityId,
  });
}

// ── Audit trail for a specific user ──────────────────────────────────────────

export function useUserAuditLogs(userId: number, page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.audit.byUser(userId, page),
    queryFn:  () => auditService.byUser(userId, page, size),
    enabled:  !!userId,
  });
}
