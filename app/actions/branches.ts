'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Local type definitions (replacing Prisma types)
export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string | null;
  isActive: boolean;
  manager?: { id: string; name: string; email: string } | null;
  staff?: Array<{ id: string; name: string; email: string; role: string }>;
  inventory?: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: { id: string; name: string; sku: string };
  }>;
  orders?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date;
    items: Array<{ id: string; productId: string; quantity: number; product: { id: string; name: string; sku: string } }>;
  }>;
  _count?: {
    orders: number;
    inventory: number;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

// Mock data for branches
const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Main Branch',
    address: '123 Main Street, Phnom Penh',
    phone: '+855-12-345-678',
    managerId: 'user-1',
    isActive: true,
    manager: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    _count: { orders: 25, inventory: 3 },
  },
  {
    id: 'branch-2',
    name: 'North Branch',
    address: '456 North Avenue, Siem Reap',
    phone: '+855-12-876-543',
    managerId: 'user-2',
    isActive: true,
    manager: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    _count: { orders: 18, inventory: 5 },
  },
  {
    id: 'branch-3',
    name: 'South Branch',
    address: '789 South Road, Sihanoukville',
    phone: '+855-12-111-222',
    managerId: null,
    isActive: false,
    _count: { orders: 5, inventory: 2 },
  },
];

// Mock data for managers
const mockManagers: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'MANAGER' },
  { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com', role: 'MANAGER' },
];

const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  managerId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type BranchFormData = z.infer<typeof branchSchema>;

export async function getBranches() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/branches

    let filtered = [...mockBranches];

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

export async function getBranchById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/branches/{id}

    const branch = mockBranches.find((b) => b.id === id);

    if (!branch) {
      return { success: false, error: 'Branch not found' };
    }

    return { success: true, data: branch };
  } catch (error) {
    console.error('Error fetching branch:', error);
    return { success: false, error: 'Failed to fetch branch' };
  }
}

export async function createBranch(data: BranchFormData) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'superadmin') {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = branchSchema.parse(data);

    // TODO: Replace with Spring Boot API call
    // POST /api/branches with body { name, address, phone, managerId, isActive }

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      ...validated,
      _count: { orders: 0, inventory: 0 },
    };

    // Add to mock data (in production, this would be done via API)
    mockBranches.push(newBranch);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/branches');
    return { success: true, data: newBranch };
  } catch (error) {
    console.error('Error creating branch:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create branch' };
  }
}

export async function updateBranch(id: string, data: Partial<BranchFormData>) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'superadmin') {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = branchSchema.partial().parse(data);

    // TODO: Replace with Spring Boot API call
    // PUT /api/branches/{id} with body { name, address, phone, managerId, isActive }

    const branchIndex = mockBranches.findIndex((b) => b.id === id);
    if (branchIndex === -1) {
      return { success: false, error: 'Branch not found' };
    }

    const updatedBranch: Branch = {
      ...mockBranches[branchIndex],
      ...validated,
    };

    // Update mock data (in production, this would be done via API)
    mockBranches[branchIndex] = updatedBranch;

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/branches');
    return { success: true, data: updatedBranch };
  } catch (error) {
    console.error('Error updating branch:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update branch' };
  }
}

export async function getManagers() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // GET /api/users?role=MANAGER

    return { success: true, data: mockManagers };
  } catch (error) {
    console.error('Error fetching managers:', error);
    return { success: false, error: 'Failed to fetch managers' };
  }
}

export async function deleteBranch(id: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'superadmin') {
      return { success: false, error: 'Unauthorized' };
    }

    // TODO: Replace with Spring Boot API call
    // DELETE /api/branches/{id}

    const branchIndex = mockBranches.findIndex((b) => b.id === id);
    if (branchIndex === -1) {
      return { success: false, error: 'Branch not found' };
    }

    // Remove from mock data (in production, this would be done via API)
    mockBranches.splice(branchIndex, 1);

    // TODO: Create audit log via Spring Boot API
    // POST /api/audit-logs with action data

    revalidatePath('/dashboard/branches');
    return { success: true };
  } catch (error) {
    console.error('Error deleting branch:', error);
    return { success: false, error: 'Failed to delete branch' };
  }
}
