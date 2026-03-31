'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Store, ShoppingCart, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';
import { branchService } from '@/services/branch.service';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!tokenStore.getAccess());
  }, []);

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch products count
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'count'],
    queryFn: async () => {
      const data = await productService.search({ page: 0, size: 1 });
      return data;
    },
    enabled: isAuthenticated,
  });

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll(),
    enabled: isAuthenticated,
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      return orderService.myOrders(0, 5);
    },
    enabled: isAuthenticated,
  });

  // Fetch alerts count from server action
//   const { data: alertsData, isLoading: alertsLoading } = useQuery({
//     queryKey: ['alerts', 'count'],
//     queryFn: async () => {
//       const result = await getExpiryAlertsCount();
//       return result.success ? { count: result.count } : { count: 0 };
//     },
//     enabled: !!session,
//     refetchInterval: 60000, // Refetch every minute
//   });

  // Prepare stats
  const stats = [
    {
      title: 'Total Products',
      value: productsLoading ? '-' : productsData?.totalElements || 0,
      icon: Package,
      description: 'Active products',
    },
    {
      title: 'Branches',
      value: branchesLoading ? '-' : branchesData?.length || 0,
      icon: Store,
      description: 'Active locations',
    },
    {
      title: 'Total Orders',
      value: ordersLoading ? '-' : ordersData?.totalElements || 0,
      icon: ShoppingCart,
      description: 'All time orders',
    },
  ];

  const recentOrders = ordersData?.content || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userData?.fullName || 'User'}!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your business today.</p>
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
            {ordersLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    {/* <p className="font-medium">{order.orderNumber}</p> */}
                    <p className="text-sm text-muted-foreground">
                      {order.branch?.name || 'Branch'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
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
                    <span className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</span>
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
