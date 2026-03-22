import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Store, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Local type definitions (replacing Prisma types)
type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  branchId: string;
  branch: { id: string; name: string };
};

// Mock data for dashboard
const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-001',
    total: 150.0,
    status: 'FULFILLED',
    branchId: 'branch-1',
    branch: { id: 'branch-1', name: 'Main Branch' },
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-002',
    total: 250.0,
    status: 'CONFIRMED',
    branchId: 'branch-1',
    branch: { id: 'branch-1', name: 'Main Branch' },
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-003',
    total: 100.0,
    status: 'PENDING',
    branchId: 'branch-2',
    branch: { id: 'branch-2', name: 'North Branch' },
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-004',
    total: 350.0,
    status: 'FULFILLED',
    branchId: 'branch-1',
    branch: { id: 'branch-1', name: 'Main Branch' },
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-005',
    total: 200.0,
    status: 'CANCELLED',
    branchId: 'branch-2',
    branch: { id: 'branch-2', name: 'North Branch' },
  },
];

export default async function DashboardPage() {
  const session = await auth();

  // TODO: Replace with Spring Boot API calls
  // GET /api/dashboard/stats

  // Mock stats data
  const productCount = 25;
  const branchCount = session?.user?.role === 'superadmin' ? 3 : 1;
  const orderCount = 150;
  const alertCount = 3;

  // Get recent orders (mock data)
  const recentOrders = mockOrders.slice(0, 5);

  const stats = [
    {
      title: 'Total Products',
      value: productCount,
      icon: Package,
      description: 'Active products',
    },
    {
      title: 'Branches',
      value: branchCount,
      icon: Store,
      description: 'Active locations',
    },
    {
      title: 'Total Orders',
      value: orderCount,
      icon: ShoppingCart,
      description: 'All time orders',
    },
    {
      title: 'Expiry Alerts',
      value: alertCount,
      icon: AlertTriangle,
      description: 'Active alerts',
      variant: alertCount > 0 ? 'warning' : 'default',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders across all branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.branch.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        order.status === 'FULFILLED'
                          ? 'success'
                          : order.status === 'CANCELLED'
                            ? 'destructive'
                            : order.status === 'CONFIRMED'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard/orders"
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View all orders →
          </Link>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>Add New Product</span>
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Create Order</span>
            </Link>
            <Link
              href="/dashboard/inventory"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Check Inventory</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
