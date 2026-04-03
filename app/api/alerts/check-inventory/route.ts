import { NextResponse } from 'next/server';
import { checkInventoryAlerts, sendAlertNotification } from '@/app/actions/inventory-alerts';

/**
 * GET /api/alerts/check-inventory
 * 
 * This endpoint should be called by an external cron job scheduler
 * Examples:
 * - GitHub Actions scheduled workflow
 * - AWS EventBridge/Cron
 * - Vercel Cron Jobs
 * - Custom cron: 0 7 * * * (daily at 7 AM)
 * 
 * In production, set up:
 * - Low stock check: Every 30 minutes
 * - Expiry check: Daily at 07:00
 */
export async function GET(request: Request) {
  try {
    // Verify secret key for security (prevent unauthorized calls)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run alert checks
    const summary = await checkInventoryAlerts();

    // Send notifications for critical alerts
    if (summary.lowStock.count > 0) {
      await sendAlertNotification('low-stock', summary.lowStock.items);
    }

    if (summary.expiringSoon.count > 0) {
      await sendAlertNotification('expiring', summary.expiringSoon.items);
    }

    if (summary.expired.count > 0) {
      await sendAlertNotification('expired', summary.expired.items);
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory alert check completed',
      summary: {
        lowStock: summary.lowStock.count,
        expiringSoon: summary.expiringSoon.count,
        expired: summary.expired.count,
        totalAlerts: summary.totalAlerts,
      },
      timestamp: summary.lastChecked,
    });
  } catch (error) {
    console.error('Scheduled inventory check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check inventory alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
