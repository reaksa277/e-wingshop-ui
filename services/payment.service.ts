// services/payment.service.ts

import { api } from "@/lib/api-client";
import { PaymentResponse } from "@/types";

export const paymentService = {
  getByOrder: (orderId: number) =>
    api.get<PaymentResponse>(`/payments/order/${orderId}`),

  confirm: (orderId: number) =>
    api.post<PaymentResponse>(`/payments/order/${orderId}/confirm`),

  refund: (orderId: number) =>
    api.post<PaymentResponse>(`/payments/order/${orderId}/refund`),
};
