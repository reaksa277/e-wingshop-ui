// services/order.service.ts

import { api } from '@/lib/api-client';
import { OrderResponse, OrderStatus, PageResponse, PlaceOrderRequest } from '@/types';

export const orderService = {
  place: (data: PlaceOrderRequest) => api.post<OrderResponse>('/orders', data),

  myOrders: (page = 0, size = 10) =>
    api.get<PageResponse<OrderResponse>>('/orders/my', { page, size }),

  getByBranch: (branchId: number, status?: OrderStatus, page = 0, size = 20) =>
    api.get<PageResponse<OrderResponse>>(`/orders/branch/${branchId}`, {
      status,
      page,
      size,
    }),

  getById: (id: number) => api.get<OrderResponse>(`/orders/${id}`),

  confirm: (id: number) => api.patch<OrderResponse>(`/orders/${id}/confirm`),

  deliver: (id: number) => api.patch<OrderResponse>(`/orders/${id}/deliver`),

  cancel: (id: number) => api.patch<OrderResponse>(`/orders/${id}/cancel`),
};
