'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Local type definitions (replacing Prisma types)
export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  inventory?: Array<{ branchId: string; quantity: number }>;
  totalStock?: number;
};

// Mock data for products
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Milk 1L',
    sku: 'MLK-001',
    category: 'Dairy',
    unit: 'pcs',
    costPrice: 2.5,
    sellingPrice: 3.5,
    isActive: true,
    inventory: [
      { branchId: 'branch-1', quantity: 50 },
      { branchId: 'branch-2', quantity: 30 },
    ],
    totalStock: 80,
  },
  {
    id: 'prod-2',
    name: 'Yogurt 500g',
    sku: 'YGT-001',
    category: 'Dairy',
    unit: 'pcs',
    costPrice: 1.5,
    sellingPrice: 2.5,
    isActive: true,
    inventory: [{ branchId: 'branch-1', quantity: 25 }],
    totalStock: 25,
  },
  {
    id: 'prod-3',
    name: 'Cheese 200g',
    sku: 'CHS-001',
    category: 'Dairy',
    unit: 'pcs',
    costPrice: 4.0,
    sellingPrice: 6.0,
    isActive: true,
    inventory: [
      { branchId: 'branch-1', quantity: 15 },
      { branchId: 'branch-2', quantity: 20 },
    ],
    totalStock: 35,
  },
  {
    id: 'prod-4',
    name: 'Bread Loaf',
    sku: 'BRD-001',
    category: 'Bakery',
    unit: 'pcs',
    costPrice: 1.0,
    sellingPrice: 2.0,
    isActive: true,
    inventory: [{ branchId: 'branch-2', quantity: 100 }],
    totalStock: 100,
  },
  {
    id: 'prod-5',
    name: 'Orange Juice 1L',
    sku: 'OJ-001',
    category: 'Beverages',
    unit: 'pcs',
    costPrice: 3.0,
    sellingPrice: 4.5,
    isActive: false,
    inventory: [],
    totalStock: 0,
  },
];

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().default('pcs'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

export async function getProducts(
  search?: string,
  category?: string,
  status?: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/products?search={search}&category={category}&status={status}&page={page}&limit={limit}

    let filtered = [...mockProducts];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((product) => product.category === category);
    }

    if (status) {
      filtered = filtered.filter((product) =>
        status === 'active' ? product.isActive : !product.isActive
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        products: paginatedProducts,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

export async function getProductBySku(sku: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/products/sku/{sku}

    const product = mockProducts.find((p) => p.sku === sku);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

export async function createProduct(data: ProductFormData) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = productSchema.parse(data);

    // TODO: Replace with Spring Boot API call
    // POST /api/products with body { name, sku, category, unit, costPrice, sellingPrice, imageUrl, isActive }

    // Check if SKU already exists
    const existing = mockProducts.find((p) => p.sku === validated.sku);

    if (existing) {
      return { success: false, error: 'SKU already exists' };
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...validated,
      inventory: [],
      totalStock: 0,
    };

    // Add to mock data (in production, this would be done via API)
    mockProducts.push(newProduct);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/products');
    return { success: true, data: newProduct };
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // PUT /api/products/{id} with body { name, sku, category, unit, costPrice, sellingPrice, imageUrl, isActive }

    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    const validated = productSchema.partial().parse(data);

    const updatedProduct: Product = {
      ...mockProducts[productIndex],
      ...validated,
    };

    // Update mock data (in production, this would be done via API)
    mockProducts[productIndex] = updatedProduct;

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/products');
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // DELETE /api/products/{id}

    const productIndex = mockProducts.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      return { success: false, error: 'Product not found' };
    }

    // Remove from mock data (in production, this would be done via API)
    mockProducts.splice(productIndex, 1);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // DELETE /api/products/bulk with body { ids }

    // Remove from mock data (in production, this would be done via API)
    mockProducts.splice(0, mockProducts.length, ...mockProducts.filter((p) => !ids.includes(p.id)));

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    return { success: false, error: 'Failed to delete products' };
  }
}

export async function getCategories() {
  try {
    // TODO: Replace with Spring Boot API call
    // GET /api/products/categories

    const categories = [...new Set(mockProducts.map((p) => p.category))];
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}
