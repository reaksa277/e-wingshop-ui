// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-reports.ts
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { queryKeys } from '@/lib/query-keys';
import { ReportParams } from '@/types';

interface ReportsResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProduct: { name: string; revenue: number };
  };
  revenueOverTime: { date: string; revenue: number }[];
  topProducts: { name: string; revenue: number }[];
  salesByBranch: { name: string; revenue: number }[];
}

function fetchReports(range: string, interval: string): Promise<ReportsResponse> {
  return fetch(`/api/reports?range=${range}&interval=${interval}`).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  });
}

// ── Full reports dashboard (used by /dashboard/reports) ───────────────────────

export function useReports(range = '7d', interval = 'daily') {
  return useQuery({
    queryKey: queryKeys.reports.dashboard(range, interval),
    queryFn: () => fetchReports(range, interval),
    staleTime: 2 * 60 * 1000,
  });
}

// ── Summary KPIs (used by dashboard home) ─────────────────────────────────────

export function useReportSummary(_params?: ReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.dashboard('30d', 'daily'),
    queryFn: () => fetchReports('30d', 'daily'),
    select: (data) => data.summary,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Daily revenue line chart ──────────────────────────────────────────────────

export function useDailyRevenue(_params?: ReportParams) {
  return useQuery({
    queryKey: queryKeys.reports.dashboard('7d', 'daily'),
    queryFn: () => fetchReports('7d', 'daily'),
    select: (data) => data.revenueOverTime,
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
