'use server';

import { inventoryService } from '@/services/inventory.service';
import type { InventoryResponse } from '@/types';

export interface AlertSummary {
  lowStock: {
    count: number;
    items: InventoryResponse[];
  };
  expiringSoon: {
    count: number;
    items: InventoryResponse[];
  };
  expired: {
    count: number;
    items: InventoryResponse[];
  };
  totalAlerts: number;
  lastChecked: Date;
}

/**
 * Check all inventory alerts (similar to Spring Boot @Scheduled methods)
 * This mimics the backend scheduled tasks:
 * - checkExpiryAlerts(): Daily at 07:00 - log items expiring within 7 days
 * - checkLowStockAlerts(): Every 30 minutes - log items below threshold
 */
export async function checkInventoryAlerts(): Promise<AlertSummary> {
  try {
    // Fetch all alert data in parallel
    const [lowStock, expiringSoon, expired] = await Promise.all([
      inventoryService.getLowStock(),
      inventoryService.getExpiringSoon(undefined, 7),
      inventoryService.getExpired(),
    ]);

    // Log warnings (in production, replace with email/push/webhook notifications)
    if (lowStock && lowStock.length > 0) {
      console.warn('LOW STOCK ALERT — %d item(s) below threshold:', lowStock.length);
      lowStock.forEach((inv) => {
        console.warn(
          '  Branch=%s Product=%s Qty=%d Threshold=%d',
          inv.branchName,
          inv.productName,
          inv.quantity,
          inv.lowStockThreshold
        );
      });
    }

    if (expiringSoon && expiringSoon.length > 0) {
      console.warn('EXPIRY ALERT — %d item(s) expire within 7 days:', expiringSoon.length);
      expiringSoon.forEach((inv) => {
        console.warn(
          '  Branch=%s Product=%s Qty=%d ExpiryDate=%s',
          inv.branchName,
          inv.productName,
          inv.quantity,
          inv.expiryDate
        );
      });
    }

    if (expired && expired.length > 0) {
      console.error('EXPIRED STOCK — %d item(s) past expiry date:', expired.length);
      expired.forEach((inv) => {
        console.error(
          '  Branch=%s Product=%s Qty=%d ExpiryDate=%s',
          inv.branchName,
          inv.productName,
          inv.quantity,
          inv.expiryDate
        );
      });
    }

    return {
      lowStock: {
        count: lowStock?.length ?? 0,
        items: lowStock ?? [],
      },
      expiringSoon: {
        count: expiringSoon?.length ?? 0,
        items: expiringSoon ?? [],
      },
      expired: {
        count: expired?.length ?? 0,
        items: expired ?? [],
      },
      totalAlerts: (lowStock?.length ?? 0) + (expiringSoon?.length ?? 0) + (expired?.length ?? 0),
      lastChecked: new Date(),
    };
  } catch (error) {
    console.error('Failed to check inventory alerts:', error);
    return {
      lowStock: { count: 0, items: [] },
      expiringSoon: { count: 0, items: [] },
      expired: { count: 0, items: [] },
      totalAlerts: 0,
      lastChecked: new Date(),
    };
  }
}

/**
 * Get formatted alert summary for notifications
 */
export async function getAlertNotifications() {
  const summary = await checkInventoryAlerts();

  // Generate notification messages
  const notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'low-stock' | 'expiring' | 'expired';
    severity: 'warning' | 'error';
  }> = [];

  // Low stock notifications
  summary.lowStock.items.slice(0, 5).forEach((item) => {
    notifications.push({
      id: `low-${item.id}`,
      title: '⚠️ Low Stock Alert',
      message: `${item.productName} at ${item.branchName} has only ${item.quantity} units (threshold: ${item.lowStockThreshold})`,
      type: 'low-stock',
      severity: 'warning',
    });
  });

  // Expiring soon notifications
  summary.expiringSoon.items.slice(0, 5).forEach((item) => {
    notifications.push({
      id: `exp-${item.id}`,
      title: '⏰ Product Expiring Soon',
      message: `${item.productName} at ${item.branchName} expires in ${item.daysUntilExpiry} days`,
      type: 'expiring',
      severity: 'warning',
    });
  });

  // Expired notifications
  summary.expired.items.slice(0, 5).forEach((item) => {
    notifications.push({
      id: `expd-${item.id}`,
      title: '🚨 Product Expired',
      message: `${item.productName} at ${item.branchName} expired ${Math.abs(item.daysUntilExpiry ?? 0)} days ago`,
      type: 'expired',
      severity: 'error',
    });
  });

  return {
    summary,
    notifications,
  };
}

/**
 * Send notification webhook (placeholder for production)
 * Replace with actual email/push/webhook implementation
 */
export async function sendAlertNotification(
  type: 'low-stock' | 'expiring' | 'expired',
  items: InventoryResponse[]
) {
  // TODO: Replace with actual notification service
  // Examples:
  // - Send email via SendGrid/AWS SES
  // - Push notification via Firebase Cloud Messaging
  // - Webhook to Slack/Discord/Teams
  // - SMS via Twilio

  const payload = {
    type,
    count: items.length,
    items: items.map((item) => ({
      product: item.productName,
      branch: item.branchName,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
    })),
    timestamp: new Date().toISOString(),
  };

  console.log('📧 Sending notification:', JSON.stringify(payload, null, 2));

  // Example webhook call:
  // await fetch(process.env.ALERT_WEBHOOK_URL!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });

  return { success: true };
}
