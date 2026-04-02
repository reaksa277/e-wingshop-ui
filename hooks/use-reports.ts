// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-reports.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { queryKeys } from '@/lib/query-keys';
import { ReportParams } from '@/types';

// ── Summary KPIs ──────────────────────────────────────────────────────────────

export function useReportSummary({ from, to, branchId }: ReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.summary(from, to, branchId),
    queryFn: () => reportService.summary({ from, to, branchId }),
    enabled: !!from && !!to,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Daily revenue line chart ──────────────────────────────────────────────────

export function useDailyRevenue({ from, to, branchId }: ReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.dailyRevenue(from, to, branchId),
    queryFn: () => reportService.dailyRevenue({ from, to, branchId }),
    enabled: !!from && !!to,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Top products bar chart ────────────────────────────────────────────────────

export function useTopProducts({ from, to, branchId }: ReportParams, limit = 10) {
  return useQuery({
    queryKey: queryKeys.reports.topProducts(from, to, branchId, limit),
    queryFn: () => reportService.topProducts({ from, to, branchId }, limit),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Revenue by branch ─────────────────────────────────────────────────────────

export function useRevenueByBranch({ from, to }: Omit<ReportParams, 'branchId'>) {
  return useQuery({
    queryKey: queryKeys.reports.byBranch(from, to),
    queryFn: () => reportService.byBranch({ from, to }),
    enabled: !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}
