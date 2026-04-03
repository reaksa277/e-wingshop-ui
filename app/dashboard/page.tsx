'use client';

import { useLowStock, useExpiringSoon, useReportSummary, useActiveDiscounts } from '@/hooks';
import { useAuth } from '@/lib/auth-context';

// Last 30 days
const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export default function DashboardHome() {
  const { user, canManage, role } = useAuth();

  const { data: summary } = useReportSummary({ from: daysAgo(30), to: today() });
  const { data: lowStock } = useLowStock();
  const { data: expiring } = useExpiringSoon(undefined, 7);
  const { data: discounts } = useActiveDiscounts(undefined, 0, 5);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.fullName} 👋</h1>
        <p className="dashboard-subtitle">{`Here's what's happening across all branches today.`}</p>
      </div>

      {/* KPI row — admin/owner only */}
      {canManage && summary && (
        <div className="kpi-grid">
          <KpiCard label="Revenue (30d)" value={`$${Number(summary.totalRevenue).toFixed(2)}`} />
          <KpiCard label="Orders (30d)" value={String(summary.totalOrders)} />
          <KpiCard
            label="Avg order value"
            value={`$${Number(summary.averageOrderValue).toFixed(2)}`}
          />
        </div>
      )}

      {/* Alert row */}
      {canManage && (
        <div className="alert-grid">
          <AlertCard
            title="⚠ Low stock items"
            count={lowStock?.length ?? 0}
            href="/dashboard/inventory?tab=low"
          >
            <div className="space-y-2">
              {lowStock?.slice(0, 4).map((inv) => (
                <div key={inv.id} className="alert-item">
                  <span className="alert-item-name">{inv.productName}</span>
                  <span className="alert-item-detail"> — {inv.branchName}: </span>
                  <span className="alert-item-quantity">{inv.quantity}</span>
                  <span className="alert-item-detail">
                    {' '}
                    left (threshold: {inv.lowStockThreshold})
                  </span>
                </div>
              ))}
            </div>
          </AlertCard>

          <AlertCard
            title="⏰ Expiring within 7 days"
            count={expiring?.length ?? 0}
            href="/dashboard/inventory?tab=expiring"
          >
            <div className="space-y-2">
              {expiring?.slice(0, 4).map((inv) => (
                <div key={inv.id} className="alert-item">
                  <span className="alert-item-name">{inv.productName}</span>
                  <span className="alert-item-detail"> — {inv.branchName}: </span>
                  <span className="alert-item-warning">{inv.daysUntilExpiry}d left</span>
                  <span className="alert-item-detail"> ({inv.quantity} units)</span>
                </div>
              ))}
            </div>
          </AlertCard>
        </div>
      )}

      {/* Active discounts snapshot */}
      {role && discounts && discounts.totalElements > 0 && (
        <div className="discount-card">
          <div className="discount-header">
            <div>
              <div className="discount-header-title">🏷 Active discounts</div>
              <div className="discount-header-description">
                Current branch discounts and promotional pricing
              </div>
            </div>

            <button
              className="discount-view-all"
              onClick={() => (window.location.href = '/dashboard/discounts')}
            >
              View all ({discounts?.totalElements}) →
            </button>
          </div>

          <div className="discount-content">
            {discounts.content.map((d) => (
              <div key={d.id} className="discount-item">
                <span>
                  <span className="discount-item-name">{d.productName}</span>
                  <span className="discount-item-branch"> — {d.branchName}</span>
                </span>

                <span className="discount-pricing">
                  <span className="discount-original">${d.originalPrice.toFixed(2)}</span>
                  <span className="discount-price">${d.discountedPrice.toFixed(2)}</span>
                  <span className="discount-badge">-{d.discountPct}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="quick-links-grid">
        {[
          { label: 'Browse products', href: '/dashboard/products' },
          { label: 'Place an order', href: '/dashboard/orders/new' },
          ...(canManage
            ? [
                { label: 'Manage inventory', href: '/dashboard/inventory' },
                { label: 'Sales reports', href: '/dashboard/reports' },
                { label: 'Manage discounts', href: '/dashboard/discounts' },
              ]
            : []),
        ].map((link) => (
          <button
            key={link.href}
            className="quick-link-button"
            onClick={() => (window.location.href = link.href)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

function AlertCard({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="alert-card">
      <div className="alert-header">
        <div className="alert-title">{title}</div>
        <div className={`alert-count ${count === 0 ? 'secondary' : 'destructive'}`}>{count}</div>
      </div>

      <div className="alert-content">
        {count === 0 ? <p className="alert-empty">No issues right now 🎉</p> : children}

        {count > 4 && (
          <button className="alert-view-all" onClick={() => (window.location.href = href)}>
            View all {count} →
          </button>
        )}
      </div>
    </div>
  );
}
