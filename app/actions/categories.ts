'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

// Category type definition
export type Category = {
  id: string;
  name: string;
  description?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Get all categories
 * GET /api/v1/categories
 */
export async function getCategories() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await apiGet<Category[]>('/categories');

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get categories with pagination and filtering
 * GET /api/v1/categories?page=0&size=10&search=xxx
 */
export async function getCategoriesPaginated(
  page: number = 0,
  size: number = 10,
  search?: string,
  sort?: string
) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (search) {
      params.search = search;
    }

    if (sort) {
      params.sort = sort;
    }

    const result = await apiGet<any>('/categories', params);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: {
        categories: result.data.content || [],
        totalElements: result.data.totalElements,
        totalPages: result.data.totalPages,
        currentPage: result.data.pageable.pageNumber,
        pageSize: result.data.pageable.pageSize,
      },
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get a single category by ID
 * GET /api/v1/categories/{id}
 */
export async function getCategoryById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await apiGet<Category>(`/categories/${id}`);

    if (!result.success) {
      return { success: false, error: result.error || 'Category not found' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

/**
 * Create a new category
 * POST /api/v1/categories
 */
export async function createCategory(data: CategoryFormData) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = categorySchema.parse(data);

    const result = await apiPost<Category>('/categories', {
      name: validated.name,
      description: validated.description || null,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard/categories');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create category' };
  }
}

/**
 * Update an existing category
 * PUT /api/v1/categories/{id}
 */
export async function updateCategory(id: string, data: Partial<CategoryFormData>) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = categorySchema.partial().parse(data);

    const result = await apiPut<Category>(`/categories/${id}`, {
      name: validated.name,
      description: validated.description ?? null,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard/categories');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update category' };
  }
}

/**
 * Delete a category
 * DELETE /api/v1/categories/{id}
 */
export async function deleteCategory(id: string) {
  try {
    const session = await auth();
    if (!session || !can(session.user.role, 'manage_products')) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await apiDelete(`/categories/${id}`);

    if (!result.success) {
      // Check if error is about having products
      if (result.error?.includes('product') || result.error?.includes('assigned')) {
        return {
          success: false,
          error: 'Cannot delete category with products. Please reassign or delete products first.',
        };
      }
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
