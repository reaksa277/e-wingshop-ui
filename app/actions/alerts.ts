'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Local type definitions (replacing Prisma types)
export type ExpiryAlert = {
  id: string;
  productId: string;
  branchId: string;
  expiryDate: Date;
  status: 'ACTIVE' | 'DISMISSED' | 'EXPIRED';
  daysRemaining?: number;
  product?: Product;
  branch?: Branch;
  dismissedByUser?: { name: string } | null;
  dismissedBy?: string | null;
  dismissedAt?: Date | null;
  note?: string | null;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
};

// Mock data for expiry alerts
const mockExpiryAlerts: ExpiryAlert[] = [
  {
    id: 'alert-1',
    productId: 'prod-1',
    branchId: 'branch-1',
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
    product: { id: 'prod-1', name: 'Milk 1L', sku: 'MLK-001', category: 'Dairy' },
    branch: { id: 'branch-1', name: 'Main Branch', address: '123 Main St' },
  },
  {
    id: 'alert-2',
    productId: 'prod-2',
    branchId: 'branch-1',
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
    product: { id: 'prod-2', name: 'Yogurt 500g', sku: 'YGT-001', category: 'Dairy' },
    branch: { id: 'branch-1', name: 'Main Branch', address: '123 Main St' },
  },
  {
    id: 'alert-3',
    productId: 'prod-3',
    branchId: 'branch-2',
    expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'EXPIRED',
    product: { id: 'prod-3', name: 'Cheese 200g', sku: 'CHS-001', category: 'Dairy' },
    branch: { id: 'branch-2', name: 'North Branch', address: '456 North Ave' },
  },
];

export async function getExpiryAlerts(
  branchId?: string,
  status?: string,
  page: number = 1,
  limit: number = 50
) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/alerts?branchId={branchId}&status={status}&page={page}&limit={limit}

    let filtered = [...mockExpiryAlerts];

    // Role-based branch filtering
    if (session.user.role === 'staff' && session.user.branchId) {
      filtered = filtered.filter((alert) => alert.branchId === session.user.branchId);
    } else if (session.user.role === 'manager' && session.user.branchId) {
      filtered = filtered.filter((alert) => alert.branchId === session.user.branchId);
    } else if (branchId && session.user.role === 'superadmin') {
      filtered = filtered.filter((alert) => alert.branchId === branchId);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((alert) => alert.status === status);
    }

    // Add days remaining calculation
    const now = new Date();
    const alertsCalculated = filtered.map((alert) => {
      const daysRemaining = Math.ceil(
        (alert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...alert, daysRemaining };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedAlerts = alertsCalculated.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        alerts: paginatedAlerts,
        total: alertsCalculated.length,
        page,
      },
    };
  } catch (error) {
    console.error('Error fetching expiry alerts:', error);
    return { success: false, error: 'Failed to fetch expiry alerts' };
  }
}

export async function dismissExpiryAlert(alertId: string, note?: string) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'dismiss_expiry_alerts')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // POST /api/alerts/{alertId}/dismiss with body { note }

    const alert = mockExpiryAlerts.find((a) => a.id === alertId);

    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    // Update mock data (in production, this would be done via API)
    alert.status = 'DISMISSED';
    alert.dismissedBy = session.user.id;
    alert.dismissedAt = new Date();
    alert.note = note;

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/alerts');
    return { success: true, data: alert };
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return { success: false, error: 'Failed to dismiss alert' };
  }
}

export async function getExpiryAlertsCount() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/alerts/count

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let filtered = mockExpiryAlerts.filter(
      (alert) => alert.status === 'ACTIVE' && alert.expiryDate <= thirtyDaysFromNow
    );

    // Role-based filtering
    if (session.user.role !== 'superadmin' && session.user.branchId) {
      filtered = filtered.filter((alert) => alert.branchId === session.user.branchId);
    }

    return { success: true, count: filtered.length };
  } catch (error) {
    console.error('Error fetching alerts count:', error);
    return { success: false, count: 0 };
  }
}

// Cron job to auto-expire alerts
export async function processExpiredAlerts() {
  try {
    const now = new Date();

    // TODO: Replace with Spring Boot API call
    // POST /api/alerts/process-expired

    let count = 0;
    mockExpiryAlerts.forEach((alert) => {
      if (alert.status === 'ACTIVE' && alert.expiryDate < now) {
        alert.status = 'EXPIRED';
        count++;
      }
    });

    return { success: true, count };
  } catch (error) {
    console.error('Error processing expired alerts:', error);
    return { success: false, error: 'Failed to process expired alerts' };
  }
}
