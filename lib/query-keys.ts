// ─────────────────────────────────────────────────────────────────────────────
// lib/query-keys.ts
// Single source of truth for all TanStack Query cache keys.
// Using factory functions ensures keys are always consistent and
// easy to invalidate at the right granularity.
// ─────────────────────────────────────────────────────────────────────────────

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    me: () => ["auth", "me"] as const,
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    all:    (page?: number, size?: number) => ["users", { page, size }] as const,
    detail: (id: number)                  => ["users", id] as const,
    me:     ()                            => ["users", "me"] as const,
  },

  // ── Branches ──────────────────────────────────────────────────────────────
  branches: {
    all:    () => ["branches"] as const,
    detail: (id: number)                        => ["branches", id] as const,
    nearby: (lat: number, lng: number, km: number) =>
      ["branches", "nearby", { lat, lng, km }] as const,
  },

  // ── Categories ────────────────────────────────────────────────────────────
  categories: {
    all:    () => ["categories"] as const,
    detail: (id: number) => ["categories", id] as const,
  },

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    all:        (params?: { categoryId?: number; keyword?: string; page?: number; size?: number }) =>
      ["products", params ?? {}] as const,
    detail:     (id: number)      => ["products", id] as const,
    byBarcode:  (barcode: string) => ["products", "barcode", barcode] as const,
  },

  // ── Inventory ─────────────────────────────────────────────────────────────
  inventory: {
    all:           (page?: number, size?: number, branchId?: number) =>
      ["inventory", "all", { page, size, branchId }] as const,
    byBranch:      (branchId: number, page?: number, size?: number) =>
      ["inventory", "branch", branchId, { page, size }] as const,
    lowStock:      (branchId?: number) => ["inventory", "low-stock", { branchId }] as const,
    expiringSoon:  (branchId?: number, daysAhead?: number) =>
      ["inventory", "expiring-soon", { branchId, daysAhead }] as const,
    expired:       ()                  => ["inventory", "expired"] as const,
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    mine:        (page?: number, size?: number) =>
      ["orders", "my", { page, size }] as const,
    byBranch:    (branchId: number, status?: string, page?: number, size?: number) =>
      ["orders", "branch", branchId, { status, page, size }] as const,
    detail:      (id: number) => ["orders", id] as const,
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    byOrder: (orderId: number) => ["payments", "order", orderId] as const,
  },

  // ── Expiry Discounts ──────────────────────────────────────────────────────
  discounts: {
    active:          (branchId?: number, page?: number, size?: number) =>
      ["discounts", "active", { branchId, page, size }] as const,
    detail:          (id: number)          => ["discounts", id] as const,
    byInventory:     (inventoryId: number) => ["discounts", "inventory", inventoryId] as const,
    activeInventory: (inventoryId: number) =>
      ["discounts", "inventory", inventoryId, "active"] as const,
    tiers:           ()                    => ["discounts", "tiers"] as const,
  },

  // ── Sales Reports ─────────────────────────────────────────────────────────
  reports: {
    summary:      (from: string, to: string, branchId?: number) =>
      ["reports", "summary", { from, to, branchId }] as const,
    dailyRevenue: (from: string, to: string, branchId?: number) =>
      ["reports", "daily-revenue", { from, to, branchId }] as const,
    topProducts:  (from: string, to: string, branchId?: number, limit?: number) =>
      ["reports", "top-products", { from, to, branchId, limit }] as const,
    byBranch:     (from: string, to: string) =>
      ["reports", "by-branch", { from, to }] as const,
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  audit: {
    recent:    ()                                          => ["audit", "recent"] as const,
    byEntity:  (type: string, id: number, page?: number)  => ["audit", type, id, { page }] as const,
    byUser:    (userId: number, page?: number)             => ["audit", "user", userId, { page }] as const,
  },
} as const;
