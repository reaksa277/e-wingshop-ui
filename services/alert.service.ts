import { api } from '@/lib/api-client';

export interface ExpiryAlert {
  id: string;
  productId: string;
  branchId: string;
  expiryDate: Date;
  status: 'ACTIVE' | 'DISMISSED' | 'EXPIRED';
  daysRemaining?: number;
  product?: any;
  branch?: any;
  dismissedBy?: string | null;
  dismissedAt?: Date | null;
  note?: string | null;
  isRead?: boolean;
  createdAt?: Date;
}

export interface AlertsResponse {
  data: {
    alerts: ExpiryAlert[];
    total: number;
    totalPages: number;
  };
}

export const alertService = {
  async getAll(page = 0, size = 20, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (status && status !== 'all') {
      params.append('status', status);
    }
    return api.get<AlertsResponse>(`/alerts?${params}`);
  },

  async getRecent(limit = 5) {
    return api.get<{ data: { alerts: ExpiryAlert[] } }>(`/alerts/recent?limit=${limit}`);
  },

  async getCount(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    return api.get<{ count: number }>(`/alerts/count?${params}`);
  },

  async dismiss(alertId: string, note?: string) {
    return api.post(`/alerts/${alertId}/dismiss`, { note });
  },

  async markAsRead(alertId: string) {
    return api.patch(`/alerts/${alertId}/read`, {});
  },

  async markAllAsRead() {
    return api.patch(`/alerts/read-all`, {});
  },
};
