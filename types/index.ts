// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
// Mirror every Spring Boot DTO response/request type
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────────────────

export type RoleName    = "SUPERADMIN" | "MANAGER" | "STAFF";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CASH" | "QR";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type DiscountStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "SOLD_OUT";
export type DiscountTier   = "ONE_MONTH" | "TWO_WEEKS" | "ONE_WEEK" | "THREE_DAYS" | "CUSTOM";

// ── Shared ───────────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  first:         boolean;
  last:          boolean;
}

export interface ApiError {
  timestamp: string;
  status:    number;
  error:     string;
  message:   string;
  path:      string;
  details?:  Record<string, string>;  // validation field errors
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  userId:       number;
  fullName:     string;
  email:        string;
  role:         RoleName;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email:    string;
  password: string;
  phone?:   string;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id:        number;
  fullName:  string;
  email:     string;
  phone?:    string;
  role:      RoleName;
  createdAt: string;
}

export interface CreateStaffRequest {
  fullName: string;
  email:    string;
  password: string;
  phone?:   string;
  role:     RoleName;
}

// ── Branches ──────────────────────────────────────────────────────────────────

export interface BranchResponse {
  id:        number;
  name:      string;
  address:   string;
  latitude?: number;
  longitude?: number;
  phone?:    string;
  createdAt: string;
}

export interface BranchRequest {
  name:      string;
  address:   string;
  latitude?: number;
  longitude?: number;
  phone?:    string;
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id:          number;
  name:        string;
  description?: string;
}

export interface CategoryRequest {
  name:         string;
  description?: string;
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ProductResponse {
  id:           number;
  name:         string;
  description?: string;
  barcode?:     string;
  imageUrl?:    string;
  costPrice:    number;
  sellingPrice: number;
  isActive:     boolean;
  createdAt:    string;
  category?:    CategoryResponse;
}

export interface ProductRequest {
  name:         string;
  description?: string;
  barcode?:     string;
  imageUrl?:    string;
  categoryId:   number;
  costPrice:    number;
  sellingPrice: number;
  isActive?:    boolean;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryResponse {
  id:                number;
  branchId:          number;
  branchName:        string;
  productId:         number;
  productName:       string;
  productBarcode?:   string;
  quantity:          number;
  lowStockThreshold: number;
  expiryDate?:       string;
  daysUntilExpiry?:  number;
  lowStock:          boolean;
  expired:           boolean;
  updatedAt:         string;
}

export interface InventoryRequest {
  branchId:           number;
  productId:          number;
  quantity:           number;
  lowStockThreshold?: number;
  expiryDate?:        string;
}

export interface AdjustStockParams {
  branchId:  number;
  productId: number;
  delta:     number;
  reason?:   string;
}

export interface TransferStockParams {
  fromBranchId: number;
  toBranchId:   number;
  productId:    number;
  quantity:     number;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id:             number;
  productId:      number;
  productName:    string;
  productBarcode?: string;
  quantity:       number;
  price:          number;
  subtotal:       number;
}

export interface PaymentResponse {
  id:            number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?:       string;
}

export interface OrderResponse {
  id:          number;
  user:        UserResponse;
  branch:      BranchResponse;
  totalAmount: number;
  status:      OrderStatus;
  createdAt:   string;
  orderItems:  OrderItemResponse[];
  payment?:    PaymentResponse;
  image?:       string;
}

export interface OrderItemRequest {
  productId: number;
  quantity:  number;
}

export interface PlaceOrderRequest {
  branchId:      number;
  items:         OrderItemRequest[];
  paymentMethod: PaymentMethod;
}

// ── Expiry Discounts ──────────────────────────────────────────────────────────

export interface ExpiryDiscountResponse {
  id:             number;
  inventoryId:    number;
  branchId:       number;
  branchName:     string;
  productId:      number;
  productName:    string;
  productBarcode?: string;
  currentStock:   number;
  tier:           DiscountTier;
  tierLabel:      string;
  originalPrice:  number;
  discountPct:    number;
  discountedPrice: number;
  savingsAmount:  number;
  expiryDate?:    string;
  validUntil:     string;
  daysUntilExpiry?: number;
  status:         DiscountStatus;
  note?:          string;
  createdByEmail?: string;
  createdAt:      string;
  revokedAt?:     string;
}

export interface CreateDiscountRequest {
  inventoryId:  number;
  tier:         DiscountTier;
  discountPct?: number;
  validUntil?:  string;
  note?:        string;
}

export interface AutoApplyDiscountRequest {
  tier:      DiscountTier;
  branchId?: number;
}

export interface DiscountTierInfo {
  tier:           DiscountTier;
  label:          string;
  daysWindow:     number;
  defaultRatePct: number;
}

// ── Sales Reports ─────────────────────────────────────────────────────────────

export interface ReportSummary {
  totalRevenue:      number;
  totalOrders:       number;
  averageOrderValue: number;
  period:            { from: string; to: string };
}

export interface DailyRevenuePoint {
  date:    string;
  revenue: number;
}

export interface TopProduct {
  product:  string;
  revenue:  number;
  unitsSold: number;
}

export interface BranchRevenue {
  branch:  string;
  revenue: number;
  orders:  number;
}

export interface ReportParams {
  from:      string;   // YYYY-MM-DD
  to:        string;
  branchId?: number;
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id:          number;
  userId?:     number;
  userEmail?:  string;
  action:      string;
  entityType:  string;
  entityId?:   number;
  detail?:     string;
  createdAt:   string;
}

export interface UserListParams {
  page?: number; // 0-based
  size?: number; // default 20
}

export interface ChangeRoleBody {
  role: string; // RoleName string — controller does RoleName.valueOf(body.get("role"))
}

export interface ResetPasswordBody {
  password: string;
}

export interface UpdateProfileBody {
  fullName?: string;
  phone?:    string;
}

export interface CategoryBody {
  name:         string;
  description?: string;
}
