// services/order.service.ts

import { api } from "@/lib/api-client";
import { OrderResponse, OrderStatus, PageResponse, PlaceOrderRequest } from "@/types";

export const orderService = {
  place: (data: PlaceOrderRequest) =>
    api.post<OrderResponse>("/api/v1/orders", data),

  myOrders: (page = 0, size = 10) =>
    api.get<PageResponse<OrderResponse>>("/api/v1/orders/my", { page, size }),

  getByBranch: (branchId: number, status?: OrderStatus, page = 0, size = 20) =>
    api.get<PageResponse<OrderResponse>>(`/api/v1/orders/branch/${branchId}`, {
      status,
      page,
      size,
    }),

  getById: (id: number) =>
    api.get<OrderResponse>(`/api/v1/orders/${id}`),

  confirm: (id: number) =>
    api.patch<OrderResponse>(`/api/v1/orders/${id}/confirm`),

  deliver: (id: number) =>
    api.patch<OrderResponse>(`/api/v1/orders/${id}/deliver`),

  cancel: (id: number) =>
    api.patch<OrderResponse>(`/api/v1/orders/${id}/cancel`),
};
