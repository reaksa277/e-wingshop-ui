// services/report.service.ts

import { api } from '@/lib/api-client';
import { BranchRevenue, ReportParams, TopProduct } from '@/types';

export const reportService = {
//   summary: ({ from, to, branchId }: ReportParams) =>
//     api.get<ReportSummary>('/reports/summary', { from, to, branchId }),

//   dailyRevenue: ({ from, to, branchId }: ReportParams) =>
//     api.get<DailyRevenuePoint[]>('/reports/daily-revenue', {
//       from,
//       to,
//       branchId,
//     }),

  topProducts: ({ from, to, branchId }: ReportParams, limit = 10) =>
    api.get<TopProduct[]>('/reports/top-products', {
      from,
      to,
      branchId,
      limit,
    }),

  byBranch: ({ from, to }: Omit<ReportParams, 'branchId'>) =>
    api.get<BranchRevenue[]>('/reports/by-branch', { from, to }),
};
