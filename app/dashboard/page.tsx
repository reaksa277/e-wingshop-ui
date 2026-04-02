"use client";

import { useLowStock, useExpiringSoon, useReportSummary, useActiveDiscounts } from "@/hooks";
import { useAuth } from "@/lib/auth-context";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Last 30 days
const today = () => new Date().toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export default function DashboardHome() {
  const { user, canManage } = useAuth();

  const { data: summary } = useReportSummary({ from: daysAgo(30), to: today() });
  const { data: lowStock } = useLowStock();
  const { data: expiring } = useExpiringSoon(undefined, 7);
  const { data: discounts } = useActiveDiscounts(undefined, 0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {`Here's what's happening across all branches today.`}
        </p>
      </div>

      {/* KPI row — admin/owner only */}
      {canManage && summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard
            label="Revenue (30d)"
            value={`$${Number(summary.totalRevenue).toFixed(2)}`}
          />
          <KpiCard
            label="Orders (30d)"
            value={String(summary.totalOrders)}
          />
          <KpiCard
            label="Avg order value"
            value={`$${Number(summary.averageOrderValue).toFixed(2)}`}
          />
        </div>
      )}

      {/* Alert row */}
      {canManage && (
        <div className="grid gap-4 lg:grid-cols-2">
          <AlertCard
            title="⚠ Low stock items"
            count={lowStock?.length ?? 0}
            href="/dashboard/inventory?tab=low"
          >
            <div className="space-y-2">
              {lowStock?.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="border-b pb-2 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="font-semibold">{inv.productName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {inv.branchName}:{" "}
                  </span>
                  <span className="font-semibold text-amber-600">
                    {inv.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
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
                <div
                  key={inv.id}
                  className="border-b pb-2 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="font-semibold">{inv.productName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — {inv.branchName}:{" "}
                  </span>
                  <span className="font-semibold text-red-600">
                    {inv.daysUntilExpiry}d left
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({inv.quantity} units)
                  </span>
                </div>
              ))}
            </div>
          </AlertCard>
        </div>
      )}

      {/* Active discounts snapshot */}
      {canManage && discounts && discounts.totalElements > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>🏷 Active discounts</CardTitle>
              <CardDescription>
                Current branch discounts and promotional pricing
              </CardDescription>
            </div>

            <Button variant="link" className="px-0" onClick={() => window.location.href = '/dashboard/discounts'}>
              View all ({discounts?.totalElements}) →
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {discounts.content.map((d) => (
              <div
                key={d.id}
                className="flex flex-col justify-between gap-2 border-b pb-3 text-sm last:border-b-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <span>
                  <span className="font-semibold">{d.productName}</span>
                  <span className="text-muted-foreground"> — {d.branchName}</span>
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">
                    ${d.originalPrice.toFixed(2)}
                  </span>
                  <span className="font-semibold text-green-600">
                    ${d.discountedPrice.toFixed(2)}
                  </span>
                  <Badge variant="destructive">-{d.discountPct}%</Badge>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Browse products", href: "/dashboard/products" },
          { label: "Place an order", href: "/dashboard/orders/new" },
          ...(canManage
            ? [
                { label: "Manage inventory", href: "/dashboard/inventory" },
                { label: "Sales reports", href: "/dashboard/reports" },
                { label: "Manage discounts", href: "/dashboard/discounts" },
              ]
            : []),
        ].map((link) => (
          <Button key={link.href} variant="outline" className="h-12 w-full justify-center" onClick={() => window.location.href = link.href}>
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant={count === 0 ? "secondary" : "destructive"}>{count}</Badge>
      </CardHeader>

      <CardContent>
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">No issues right now 🎉</p>
        ) : (
          children
        )}

        {count > 4 && (
          <Button variant="link" className="mt-3 h-auto p-0" onClick={() => window.location.href = href}>
            View all {count} →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
