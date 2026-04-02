import { api } from '@/lib/api-client';

export type ExpiryCategory = 'ONE_MONTH' | 'TWO_WEEKS' | 'ONE_WEEK' | 'EXPIRED';

export interface ExpiryAlert {
  id: string;
  productId: string;
  branchId: string;
  expiryDate: Date;
  status: 'ACTIVE' | 'DISMISSED' | 'EXPIRED';
  category: ExpiryCategory;
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

export interface AlertsByCategory {
  oneMonth: ExpiryAlert[];
  twoWeeks: ExpiryAlert[];
  oneWeek: ExpiryAlert[];
  expired: ExpiryAlert[];
  totals: {
    oneMonth: number;
    twoWeeks: number;
    oneWeek: number;
    expired: number;
    total: number;
  };
}

interface InventoryItem {
  id: string;
  productId: string;
  branchId: string;
  product?: any;
  branch?: any;
  quantity?: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

export const alertService = {
  async getAll(page = 0, size = 20, status?: string) {
    try {
      const offset = page * size;
      const alerts: ExpiryAlert[] = [];

      // Fetch from all three endpoints
      const [lowStock, expiringSoon, expired] = await Promise.all([
        this._fetchLowStock(),
        this._fetchExpiringSoon(),
        this._fetchExpired(),
      ]);

      // Convert to ExpiryAlert format and combine
      alerts.push(...this._convertToAlerts(lowStock, 'LOW_STOCK'));
      alerts.push(...this._convertToAlerts(expiringSoon, 'EXPIRING'));
      alerts.push(...this._convertToAlerts(expired, 'EXPIRED'));

      // Filter by status if provided
      let filtered = alerts;
      if (status && status !== 'all') {
        filtered = alerts.filter((a) => this._mapStatusFilter(a, status));
      }

      // Apply pagination
      const paginated = filtered.slice(offset, offset + size);

      return {
        data: {
          alerts: paginated,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
        },
      };
    } catch {
      return { data: { alerts: [], total: 0, totalPages: 0 } };
    }
  },

  async getByCategory(branchId?: number): Promise<AlertsByCategory> {
    try {
      // Fetch expiring items for different time periods
      const [expiring30Days, expiring14Days, expiring7Days, expired] = await Promise.all([
        this._fetchExpiringByDays(branchId, 30),
        this._fetchExpiringByDays(branchId, 14),
        this._fetchExpiringByDays(branchId, 7),
        this._fetchExpired(),
      ]);

      // Categorize alerts
      const oneMonth = this._convertToAlerts(
        expiring30Days.filter((i) => (i.daysUntilExpiry || 0) > 14),
        'EXPIRING'
      ).map((a) => ({ ...a, category: 'ONE_MONTH' as ExpiryCategory }));

      const twoWeeks = this._convertToAlerts(
        expiring14Days.filter(
          (i) => (i.daysUntilExpiry || 0) > 7 && (i.daysUntilExpiry || 0) <= 14
        ),
        'EXPIRING'
      ).map((a) => ({ ...a, category: 'TWO_WEEKS' as ExpiryCategory }));

      const oneWeek = this._convertToAlerts(
        expiring7Days.filter((i) => (i.daysUntilExpiry || 0) > 0 && (i.daysUntilExpiry || 0) <= 7),
        'EXPIRING'
      ).map((a) => ({ ...a, category: 'ONE_WEEK' as ExpiryCategory }));

      const expiredAlerts = this._convertToAlerts(expired, 'EXPIRED').map((a) => ({
        ...a,
        category: 'EXPIRED' as ExpiryCategory,
      }));

      return {
        oneMonth,
        twoWeeks,
        oneWeek,
        expired: expiredAlerts,
        totals: {
          oneMonth: oneMonth.length,
          twoWeeks: twoWeeks.length,
          oneWeek: oneWeek.length,
          expired: expiredAlerts.length,
          total: oneMonth.length + twoWeeks.length + oneWeek.length + expiredAlerts.length,
        },
      };
    } catch {
      return {
        oneMonth: [],
        twoWeeks: [],
        oneWeek: [],
        expired: [],
        totals: { oneMonth: 0, twoWeeks: 0, oneWeek: 0, expired: 0, total: 0 },
      };
    }
  },

  async getRecent(limit = 5) {
    try {
      const [lowStock, expiringSoon, expired] = await Promise.all([
        this._fetchLowStock(),
        this._fetchExpiringSoon(),
        this._fetchExpired(),
      ]);

      const alerts: ExpiryAlert[] = [];
      alerts.push(...this._convertToAlerts(lowStock, 'LOW_STOCK'));
      alerts.push(...this._convertToAlerts(expiringSoon, 'EXPIRING'));
      alerts.push(...this._convertToAlerts(expired, 'EXPIRED'));

      const result = {
        data: {
          alerts: alerts.slice(0, limit),
        },
      };
      return result || { data: { alerts: [] } };
    } catch {
      return { data: { alerts: [] } };
    }
  },

  async getCount(status?: string) {
    try {
      const [lowStock, expiringSoon, expired] = await Promise.all([
        this._fetchLowStock(),
        this._fetchExpiringSoon(),
        this._fetchExpired(),
      ]);

      let count = 0;
      if (!status || status === 'all') {
        count = (lowStock?.length || 0) + (expiringSoon?.length || 0) + (expired?.length || 0);
      } else if (status === 'LOW_STOCK') {
        count = lowStock?.length || 0;
      } else if (status === 'EXPIRING') {
        count = expiringSoon?.length || 0;
      } else if (status === 'EXPIRED') {
        count = expired?.length || 0;
      }

      const result = { count };
      return result || { count: 0 };
    } catch {
      return { count: 0 };
    }
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

  // Private helper methods
  async _fetchLowStock() {
    try {
      const result = await api.get<InventoryItem[]>(`/inventory/low-stock`);
      return result || [];
    } catch {
      return [];
    }
  },

  async _fetchExpiringByDays(branchId?: number, daysAhead = 30) {
    try {
      const result = await api.get<InventoryItem[]>(`/inventory/expiring-soon`, {
        branchId,
        daysAhead,
      });
      return result || [];
    } catch {
      return [];
    }
  },

  async _fetchExpiringSoon() {
    try {
      const result = await api.get<InventoryItem[]>(`/inventory/expiring-soon?daysAhead=7`);
      return result || [];
    } catch {
      return [];
    }
  },

  async _fetchExpired() {
    try {
      const result = await api.get<InventoryItem[]>(`/inventory/expired`);
      return result || [];
    } catch {
      return [];
    }
  },

  _convertToAlerts(items: InventoryItem[], alertType: string): ExpiryAlert[] {
    return (items || []).map((item, index) => {
      const daysRemaining = item.daysUntilExpiry || 0;
      let category: ExpiryCategory = 'ONE_MONTH';

      if (daysRemaining <= 0) {
        category = 'EXPIRED';
      } else if (daysRemaining <= 7) {
        category = 'ONE_WEEK';
      } else if (daysRemaining <= 14) {
        category = 'TWO_WEEKS';
      } else {
        category = 'ONE_MONTH';
      }

      return {
        id: `${alertType}-${item.id}-${index}`,
        productId: item.productId || item.id,
        branchId: item.branchId || '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : new Date(),
        status: alertType === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
        category,
        daysRemaining: daysRemaining,
        product: item.product,
        branch: item.branch,
        isRead: false,
      };
    });
  },

  _mapStatusFilter(alert: ExpiryAlert, status: string): boolean {
    if (status === 'all') return true;
    if (status === 'ACTIVE') return alert.status === 'ACTIVE';
    if (status === 'EXPIRED') return alert.status === 'EXPIRED';
    if (status === 'DISMISSED') return alert.status === 'DISMISSED';
    return true;
  },
};
