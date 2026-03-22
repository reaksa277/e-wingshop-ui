'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import type { Role } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number(),
});

const createOrderSchema = z.object({
  branchId: z.string(),
  customerId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;

// Mock orders data
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-00001',
    branchId: 'branch-1',
    status: 'PENDING' as OrderStatus,
    total: 150.0,
    createdAt: new Date().toISOString(),
    branch: { id: 'branch-1', name: 'Main Branch' },
    items: [
      { id: 'item-1', productId: '1', productName: 'Product A', quantity: 2, unitPrice: 50, subtotal: 100 },
      { id: 'item-2', productId: '2', productName: 'Product B', quantity: 1, unitPrice: 50, subtotal: 50 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-00002',
    branchId: 'branch-2',
    status: 'CONFIRMED' as OrderStatus,
    total: 200.0,
    createdAt: new Date().toISOString(),
    branch: { id: 'branch-2', name: 'Downtown Branch' },
    items: [
      { id: 'item-3', productId: '3', productName: 'Product C', quantity: 4, unitPrice: 50, subtotal: 200 },
    ],
  },
];

export async function getOrders(
  status?: OrderStatus | 'all',
  branchId?: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // Filter mock data based on role and parameters
    let filteredOrders = mockOrders;

    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    // Role-based branch filtering
    if (session.user.role === 'staff' && session.user.branchId) {
      filteredOrders = filteredOrders.filter(o => o.branchId === session.user.branchId);
    } else if (branchId && session.user.role === 'superadmin') {
      filteredOrders = filteredOrders.filter(o => o.branchId === branchId);
    } else if (session.user.role === 'manager' && session.user.branchId) {
      filteredOrders = filteredOrders.filter(o => o.branchId === session.user.branchId);
    }

    const total = filteredOrders.length;
    const orders = filteredOrders.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function getOrderById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const order = mockOrders.find(o => o.id === id);

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: 'Failed to fetch order' };
  }
}

export async function createOrder(data: CreateOrderData) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'process_orders')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = createOrderSchema.parse(data);

    // Calculate total
    let total = 0;
    for (const item of validated.items) {
      total += item.quantity * item.unitPrice;
    }

    const newOrder = {
      id: `${Date.now()}`,
      orderNumber: `ORD-${String(mockOrders.length + 1).padStart(5, '0')}`,
      branchId: validated.branchId,
      status: 'PENDING' as OrderStatus,
      total,
      createdAt: new Date().toISOString(),
      branch: { id: validated.branchId, name: 'Branch' },
      items: validated.items.map((item, i) => ({
        id: `item-${i}`,
        productId: item.productId,
        productName: 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
    };

    mockOrders.push(newOrder);

    revalidatePath('/dashboard/orders');
    return { success: true, data: newOrder };
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create order' };
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'process_orders')) {
      return { success: false, error: 'Unauthorized' };
    }

    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found' };
    }

    const oldStatus = mockOrders[orderIndex].status;
    mockOrders[orderIndex].status = status;

    revalidatePath('/dashboard/orders');
    return { success: true, data: { ...mockOrders[orderIndex], previousStatus: oldStatus } };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function getBranchesForOrder() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // Mock branches data
    const allBranches = [
      { id: 'branch-1', name: 'Main Branch' },
      { id: 'branch-2', name: 'Downtown Branch' },
      { id: 'branch-3', name: 'Uptown Branch' },
    ];

    const branches = session.user.role === 'superadmin'
      ? allBranches
      : session.user.branchId
      ? allBranches.filter(b => b.id === session.user.branchId)
      : allBranches;

    return { success: true, data: branches };
  } catch (error) {
    console.error('Error fetching branches:', error);
    return { success: false, error: 'Failed to fetch branches' };
  }
}
