import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from 'date-fns';

// Local type definitions (replacing Prisma types)
type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  branchId: string;
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  subtotal: number;
  orderId: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
};

type Branch = {
  id: string;
  name: string;
};

// Mock data for reports
const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-001',
    total: 150.0,
    status: 'FULFILLED',
    createdAt: new Date(),
    branchId: 'branch-1',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-002',
    total: 250.0,
    status: 'CONFIRMED',
    createdAt: subDays(new Date(), 1),
    branchId: 'branch-1',
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-003',
    total: 100.0,
    status: 'FULFILLED',
    createdAt: subDays(new Date(), 2),
    branchId: 'branch-2',
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-004',
    total: 350.0,
    status: 'PENDING',
    createdAt: subDays(new Date(), 3),
    branchId: 'branch-1',
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-005',
    total: 200.0,
    status: 'CANCELLED',
    createdAt: subDays(new Date(), 4),
    branchId: 'branch-2',
  },
];

const mockOrderItems: OrderItem[] = [
  { id: 'oi-1', productId: 'prod-1', quantity: 5, subtotal: 17.5, orderId: 'ord-1' },
  { id: 'oi-2', productId: 'prod-2', quantity: 10, subtotal: 25.0, orderId: 'ord-1' },
  { id: 'oi-3', productId: 'prod-3', quantity: 3, subtotal: 18.0, orderId: 'ord-2' },
  { id: 'oi-4', productId: 'prod-4', quantity: 20, subtotal: 40.0, orderId: 'ord-3' },
];

const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Milk 1L', sku: 'MLK-001' },
  { id: 'prod-2', name: 'Yogurt 500g', sku: 'YGT-001' },
  { id: 'prod-3', name: 'Cheese 200g', sku: 'CHS-001' },
  { id: 'prod-4', name: 'Bread Loaf', sku: 'BRD-001' },
];

const mockBranches: Branch[] = [
  { id: 'branch-1', name: 'Main Branch' },
  { id: 'branch-2', name: 'North Branch' },
  { id: 'branch-3', name: 'South Branch' },
];

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !can(session.user.role, 'view_sales_reports')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const interval = searchParams.get('interval') || 'daily';

    // TODO: Replace with Spring Boot API call
    // GET /api/reports?range={range}&interval={interval}

    // Calculate date range
    let startDate: Date;
    const now = new Date();

    switch (range) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7d':
        startDate = subDays(startOfDay(now), 6);
        break;
      case '30d':
        startDate = subDays(startOfDay(now), 29);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      default:
        startDate = subDays(startOfDay(now), 6);
    }

    const endDate = endOfDay(now);

    // Filter orders by date range and branch
    let filteredOrders = mockOrders.filter(
      (order) => order.createdAt >= startDate && order.createdAt <= endDate
    );

    // Role-based branch filtering
    if (session.user.role !== 'superadmin' && session.user.branchId) {
      filteredOrders = filteredOrders.filter((order) => order.branchId === session.user.branchId);
    }

    const nonCancelledOrders = filteredOrders.filter((order) => order.status !== 'CANCELLED');

    // Calculate summary stats
    const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;

    // Find top product by revenue
    const productRevenue = new Map<string, number>();
    mockOrderItems.forEach((item: OrderItem) => {
      const order = nonCancelledOrders.find((o) => o.id === item.orderId);
      if (order) {
        const current = productRevenue.get(item.productId) || 0;
        productRevenue.set(item.productId, current + item.subtotal);
      }
    });

    let topProduct: { productId: string; revenue: number } | null = null;
    let maxRevenue = 0;
    productRevenue.forEach((revenue: number, productId: string) => {
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
        topProduct = { productId, revenue };
      }
    });

    // Group revenue over time by interval
    const dateMap = new Map<string, number>();
    nonCancelledOrders.forEach((order) => {
      let dateKey: string;
      const orderDate = order.createdAt;

      if (interval === 'daily') {
        dateKey = orderDate.toISOString().split('T')[0];
      } else if (interval === 'weekly') {
        const weekStart = startOfWeek(orderDate);
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = orderDate.toISOString().slice(0, 7); // YYYY-MM
      }

      const current = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, current + order.total);
    });

    const groupedRevenue = Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top products
    const topProductsMap = new Map<
      string,
      { productId: string; revenue: number; quantity: number }
    >();

    mockOrderItems.forEach((item: OrderItem) => {
      const order = nonCancelledOrders.find((o) => o.id === item.orderId);
      if (order) {
        const existing = topProductsMap.get(item.productId) || {
          productId: item.productId,
          revenue: 0,
          quantity: 0,
        };
        existing.revenue += item.subtotal;
        existing.quantity += item.quantity;
        topProductsMap.set(item.productId, existing);
      }
    });

    const topProductsWithDetails = Array.from(topProductsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => {
        const product = mockProducts.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || '',
          revenue: item.revenue,
          quantity: item.quantity,
        };
      });

    // Calculate sales by branch
    const branchSales = mockBranches
      .filter((branch) =>
        session.user.role === 'superadmin'
          ? true
          : session.user.branchId
            ? branch.id === session.user.branchId
            : false
      )
      .map((branch) => {
        const branchOrders = nonCancelledOrders.filter((o) => o.branchId === branch.id);
        return {
          branchId: branch.id,
          name: branch.name,
          revenue: branchOrders.reduce((sum, o) => sum + o.total, 0),
          orders: branchOrders.length,
        };
      });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        topProduct: topProduct
          ? {
              productId: (topProduct as { productId: string; revenue: number }).productId,
              revenue: (topProduct as { productId: string; revenue: number }).revenue,
            }
          : null,
      },
      revenueOverTime: groupedRevenue,
      topProducts: topProductsWithDetails,
      salesByBranch: branchSales,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
