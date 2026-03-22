'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Category type definition
export type Category = {
  id: string;
  name: string;
  description?: string | null;
  productCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

// Mock data for categories
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Dairy',
    description: 'Milk, cheese, yogurt and dairy products',
    productCount: 15,
  },
  {
    id: 'cat-2',
    name: 'Bakery',
    description: 'Fresh bread, pastries and baked goods',
    productCount: 8,
  },
  {
    id: 'cat-3',
    name: 'Beverages',
    description: 'Juices, sodas, water and drinks',
    productCount: 12,
  },
  { id: 'cat-4', name: 'Snacks', description: 'Chips, cookies and snack items', productCount: 20 },
  { id: 'cat-5', name: 'Frozen', description: 'Frozen foods and ice cream', productCount: 10 },
];

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export async function getCategories() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/categories

    return { success: true, data: mockCategories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function getCategoryById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/categories/{id}

    const category = mockCategories.find((c) => c.id === id);

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

export async function createCategory(data: CategoryFormData) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = categorySchema.parse(data);

    // TODO: Replace with Spring Boot API call
    // POST /api/categories with body { name, description }

    // Check if category name already exists
    const existing = mockCategories.find(
      (c) => c.name.toLowerCase() === validated.name.toLowerCase()
    );

    if (existing) {
      return { success: false, error: 'Category with this name already exists' };
    }

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: validated.name,
      description: validated.description || null,
      productCount: 0,
    };

    // Add to mock data (in production, this would be done via API)
    mockCategories.push(newCategory);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/categories');
    return { success: true, data: newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = categorySchema.partial().parse(data);

    // TODO: Replace with Spring Boot API call
    // PUT /api/categories/{id} with body { name, description }

    const categoryIndex = mockCategories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) {
      return { success: false, error: 'Category not found' };
    }

    // Check if name is being changed and if it already exists
    if (validated.name) {
      const existing = mockCategories.find(
        (c) => c.id !== id && c.name.toLowerCase() === validated.name.toLowerCase()
      );

      if (existing) {
        return { success: false, error: 'Category with this name already exists' };
      }
    }

    const updatedCategory: Category = {
      ...mockCategories[categoryIndex],
      ...validated,
    };

    // Update mock data (in production, this would be done via API)
    mockCategories[categoryIndex] = updatedCategory;

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/categories');
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // DELETE /api/categories/{id}

    const categoryIndex = mockCategories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) {
      return { success: false, error: 'Category not found' };
    }

    const category = mockCategories[categoryIndex];

    // Check if category has products
    if (category.productCount && category.productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category.productCount} products. Please reassign or delete products first.`,
      };
    }

    // Remove from mock data (in production, this would be done via API)
    mockCategories.splice(categoryIndex, 1);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
