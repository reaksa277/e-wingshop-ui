// ─────────────────────────────────────────────────────────────────────────────
// hooks/index.ts  — barrel export: import everything from one place
//
// Usage:
//   import { useProducts, useCreateProduct, useMe } from "@/hooks";
// ─────────────────────────────────────────────────────────────────────────────

export * from "./use-auth";
export * from "./use-users";
export * from "./use-branches";
export * from "./use-categories";
export * from "./use-products";
export * from "./use-inventory";
// export * from "./use-orders";
// export * from "./use-payments";
export * from "./use-discounts";
export * from "./use-reports";
export * from "./use-audit";
export * from "./use-alerts";
