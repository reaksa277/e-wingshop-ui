'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Local type definitions (replacing Prisma types)
export type Inventory = {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  lowStockThreshold: number;
  product?: Product;
  branch?: Branch;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  isActive?: boolean;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
};

// Mock data for inventory
const mockInventory: Inventory[] = [
  {
    id: 'inv-1',
    productId: 'prod-1',
    branchId: 'branch-1',
    quantity: 50,
    lowStockThreshold: 10,
    product: { id: 'prod-1', name: 'Milk 1L', sku: 'MLK-001', category: 'Dairy' },
    branch: { id: 'branch-1', name: 'Main Branch', address: '123 Main St' },
  },
  {
    id: 'inv-2',
    productId: 'prod-2',
    branchId: 'branch-1',
    quantity: 5,
    lowStockThreshold: 10,
    product: { id: 'prod-2', name: 'Yogurt 500g', sku: 'YGT-001', category: 'Dairy' },
    branch: { id: 'branch-1', name: 'Main Branch', address: '123 Main St' },
  },
  {
    id: 'inv-3',
    productId: 'prod-3',
    branchId: 'branch-1',
    quantity: 0,
    lowStockThreshold: 10,
    product: { id: 'prod-3', name: 'Cheese 200g', sku: 'CHS-001', category: 'Dairy' },
    branch: { id: 'branch-1', name: 'Main Branch', address: '123 Main St' },
  },
  {
    id: 'inv-4',
    productId: 'prod-1',
    branchId: 'branch-2',
    quantity: 30,
    lowStockThreshold: 10,
    product: { id: 'prod-1', name: 'Milk 1L', sku: 'MLK-001', category: 'Dairy' },
    branch: { id: 'branch-2', name: 'North Branch', address: '456 North Ave' },
  },
  {
    id: 'inv-5',
    productId: 'prod-4',
    branchId: 'branch-2',
    quantity: 100,
    lowStockThreshold: 15,
    product: { id: 'prod-4', name: 'Bread Loaf', sku: 'BRD-001', category: 'Bakery' },
    branch: { id: 'branch-2', name: 'North Branch', address: '456 North Ave' },
  },
];

// Mock data for products
const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Milk 1L', sku: 'MLK-001', category: 'Dairy' },
  { id: 'prod-2', name: 'Yogurt 500g', sku: 'YGT-001', category: 'Dairy' },
  { id: 'prod-3', name: 'Cheese 200g', sku: 'CHS-001', category: 'Dairy' },
  { id: 'prod-4', name: 'Bread Loaf', sku: 'BRD-001', category: 'Bakery' },
  { id: 'prod-5', name: 'Orange Juice 1L', sku: 'OJ-001', category: 'Beverages' },
];

// Mock data for branches
const mockBranchesForInventory: { id: string; name: string }[] = [
  { id: 'branch-1', name: 'Main Branch' },
  { id: 'branch-2', name: 'North Branch' },
  { id: 'branch-3', name: 'South Branch' },
];

export async function getInventory(
  branchId?: string,
  category?: string,
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
    // GET /api/inventory?branchId={branchId}&category={category}&status={status}&page={page}&limit={limit}

    let filtered = [...mockInventory];

    // Role-based branch filtering
    if (session.user.role === 'staff' && session.user.branchId) {
      filtered = filtered.filter((item) => item.branchId === session.user.branchId);
    } else if (session.user.role === 'manager' && session.user.branchId) {
      filtered = filtered.filter((item) => item.branchId === session.user.branchId);
    } else if (branchId && session.user.role === 'superadmin') {
      filtered = filtered.filter((item) => item.branchId === branchId);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((item) => item.product?.category === category);
    }

    // Filter by status (OK, Low, Out)
    if (status) {
      if (status === 'out') {
        filtered = filtered.filter((i) => i.quantity === 0);
      } else if (status === 'low') {
        filtered = filtered.filter(
          (i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold
        );
      } else if (status === 'ok') {
        filtered = filtered.filter((i) => i.quantity > i.lowStockThreshold);
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedInventory = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        inventory: paginatedInventory,
        total: filtered.length,
        page,
      },
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

const adjustInventorySchema = z.object({
  inventoryId: z.string(),
  quantity: z.number().int(),
  note: z.string().optional(),
});

export async function adjustInventory(
  inventoryId: string,
  newQuantity: number,
  note?: string
) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'view_inventory')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // POST /api/inventory/{inventoryId}/adjust with body { quantity, note }

    const inventoryIndex = mockInventory.findIndex((i) => i.id === inventoryId);

    if (inventoryIndex === -1) {
      return { success: false, error: 'Inventory record not found' };
    }

    const inventory = mockInventory[inventoryIndex];
    const delta = newQuantity - inventory.quantity;

    // Update mock data (in production, this would be done via API)
    const updated: Inventory = {
      ...inventory,
      quantity: newQuantity,
    };
    mockInventory[inventoryIndex] = updated;

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/inventory');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return { success: false, error: 'Failed to adjust inventory' };
  }
}

const stockTransferSchema = z.object({
  productId: z.string(),
  fromBranchId: z.string(),
  toBranchId: z.string(),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export async function transferStock(
  productId: string,
  fromBranchId: string,
  toBranchId: string,
  quantity: number,
  note?: string
) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'view_inventory')) {
      return { success: false, error: 'Unauthorized' };
    }

    if (fromBranchId === toBranchId) {
      return { success: false, error: 'Cannot transfer to the same branch' };
    }

    // TODO: Replace with Spring Boot API call
    // POST /api/inventory/transfer with body { productId, fromBranchId, toBranchId, quantity, note }

    // Check source inventory
    const sourceInventoryIndex = mockInventory.findIndex(
      (i) => i.productId === productId && i.branchId === fromBranchId
    );

    if (sourceInventoryIndex === -1) {
      return {
        success: false,
        error: 'Insufficient stock. Available: 0',
      };
    }

    const sourceInventory = mockInventory[sourceInventoryIndex];

    if (sourceInventory.quantity < quantity) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${sourceInventory.quantity}`,
      };
    }

    // Perform transfer (in production, this would be done via API transaction)
    mockInventory[sourceInventoryIndex] = {
      ...sourceInventory,
      quantity: sourceInventory.quantity - quantity,
    };

    // Find or create destination inventory
    const destInventoryIndex = mockInventory.findIndex(
      (i) => i.productId === productId && i.branchId === toBranchId
    );

    if (destInventoryIndex !== -1) {
      mockInventory[destInventoryIndex] = {
        ...mockInventory[destInventoryIndex],
        quantity: mockInventory[destInventoryIndex].quantity + quantity,
      };
    } else {
      mockInventory.push({
        id: `inv-${Date.now()}`,
        productId,
        branchId: toBranchId,
        quantity,
        lowStockThreshold: 10,
      });
    }

    // TODO: Create audit logs via Spring Boot API
    // POST /api/audit-logs for transfer out
    // POST /api/audit-logs for transfer in

    revalidatePath('/dashboard/inventory');
    return { success: true };
  } catch (error) {
    console.error('Error transferring stock:', error);
    return { success: false, error: 'Failed to transfer stock' };
  }
}

export async function getBranchesForInventory() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/branches?active=true

    let filtered = mockBranchesForInventory;

    if (session.user.role !== 'superadmin') {
      if (session.user.branchId) {
        filtered = filtered.filter((branch) => branch.id === session.user.branchId);
      }
    }

    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching branches:', error);
    return { success: false, error: 'Failed to fetch branches' };
  }
}

const createInventorySchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  branchId: z.string().min(1, 'Branch is required'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  lowStockThreshold: z.number().int().min(1).default(10),
});

export async function createInventory(data: {
  productId: string;
  branchId: string;
  quantity: number;
  lowStockThreshold?: number;
}) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'view_inventory')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // POST /api/inventory with body { productId, branchId, quantity, lowStockThreshold }

    const validated = createInventorySchema.parse(data);

    // Check if inventory already exists for this product-branch combination
    const existing = mockInventory.find(
      (i) => i.productId === validated.productId && i.branchId === validated.branchId
    );

    if (existing) {
      return {
        success: false,
        error: 'Inventory record already exists for this product at this branch. Use adjust instead.',
      };
    }

    // Find product details
    const product = mockProducts.find((p) => p.id === validated.productId);
    const branch = mockBranchesForInventory.find((b) => b.id === validated.branchId);

    if (!product || !branch) {
      return { success: false, error: 'Invalid product or branch' };
    }

    const newInventory: Inventory = {
      id: `inv-${Date.now()}`,
      productId: validated.productId,
      branchId: validated.branchId,
      quantity: validated.quantity,
      lowStockThreshold: validated.lowStockThreshold || 10,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
      },
      branch: {
        id: branch.id,
        name: branch.name,
        address: '',
      },
    };

    // Add to mock data (in production, this would be done via API)
    mockInventory.push(newInventory);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/inventory');
    return { success: true, data: newInventory };
  } catch (error) {
    console.error('Error creating inventory:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create inventory record' };
  }
}

export async function getProductsForInventory() {
  try {
    // TODO: Replace with Spring Boot API call
    // GET /api/products?active=true

    const activeProducts = mockProducts.filter((p) => p.isActive);
    return { success: true, data: activeProducts };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}
