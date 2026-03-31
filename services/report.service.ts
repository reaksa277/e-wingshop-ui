// services/report.service.ts

import { api } from "@/lib/api-client";
import {
  BranchRevenue,
  DailyRevenuePoint,
  ReportParams,
  ReportSummary,
  TopProduct,
} from "@/types";

export const reportService = {
  summary: ({ from, to, branchId }: ReportParams) =>
    api.get<ReportSummary>("/api/v1/reports/summary", { from, to, branchId }),

  dailyRevenue: ({ from, to, branchId }: ReportParams) =>
    api.get<DailyRevenuePoint[]>("/api/v1/reports/daily-revenue", {
      from,
      to,
      branchId,
    }),

  topProducts: ({ from, to, branchId }: ReportParams, limit = 10) =>
    api.get<TopProduct[]>("/api/v1/reports/top-products", {
      from,
      to,
      branchId,
      limit,
    }),

  byBranch: ({ from, to }: Omit<ReportParams, "branchId">) =>
    api.get<BranchRevenue[]>("/api/v1/reports/by-branch", { from, to }),
};
