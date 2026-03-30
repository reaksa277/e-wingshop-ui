'use server';

import { auth } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  mockUsers,
  findUserByEmail,
  getUserById as getUserByIdMock,
  getAllUsers,
  type MockUser,
} from '@/lib/mock-users';
import bcrypt from 'bcryptjs';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager' | 'staff' | 'viewer';
  branchId?: string | null;
  image?: string;
};

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['superadmin', 'manager', 'staff', 'viewer']),
  branchId: z.string().optional().nullable(),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;

export async function getUsers(
  search: string = '',
  role: string = 'all',
  branchId: string = 'all',
  page: number = 1
) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check permission
    if (!can(session.user.role as any, 'manage_users')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    let filtered = [...mockUsers];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role !== 'all') {
      filtered = filtered.filter((user) => user.role === role);
    }

    if (branchId !== 'all') {
      filtered = filtered.filter((user) => user.branchId === branchId);
    }

    // Pagination
    const itemsPerPage = 10;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedUsers = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Remove passwords from response
    const usersWithoutPassword = paginatedUsers.map(({ password, ...user }) => user);

    return {
      success: true,
      data: {
        users: usersWithoutPassword,
        totalItems,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!can(session.user.role as any, 'manage_users')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const user = getUserByIdMock(id);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function createUser(data: UserFormData) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!can(session.user.role as any, 'manage_users')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const validated = userSchema.parse(data);

    // Check if email already exists
    const existingUser = findUserByEmail(validated.email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Hash password
    if (!validated.password) {
      return { success: false, error: 'Password is required' };
    }
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create new user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      role: validated.role,
      branchId: validated.branchId || null,
      image: validated.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${validated.email}`,
    };

    // Add to mock data
    mockUsers.push(newUser);

    revalidatePath('/dashboard/users');
    return { success: true, data: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, data: Partial<UserFormData>) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!can(session.user.role as any, 'manage_users')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const validated = userSchema.partial().parse(data);

    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Check if email is being changed and if it already exists
    if (validated.email && validated.email !== mockUsers[userIndex].email) {
      const existingUser = findUserByEmail(validated.email);
      if (existingUser && existingUser.id !== id) {
        return { success: false, error: 'Email already exists' };
      }
    }

    // Hash password if provided
    let hashedPassword = mockUsers[userIndex].password;
    if (validated.password && validated.password.length > 0) {
      hashedPassword = await bcrypt.hash(validated.password, 10);
    }

    const updatedUser: MockUser = {
      ...mockUsers[userIndex],
      name: validated.name ?? mockUsers[userIndex].name,
      email: validated.email ?? mockUsers[userIndex].email,
      role: validated.role ?? mockUsers[userIndex].role,
      branchId: validated.branchId ?? mockUsers[userIndex].branchId,
      image: validated.image ?? mockUsers[userIndex].image,
      password: hashedPassword,
    };

    // Update mock data
    mockUsers[userIndex] = updatedUser;

    revalidatePath('/dashboard/users');
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!can(session.user.role as any, 'manage_users')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Prevent deleting superadmin
    const user = getUserByIdMock(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role === 'superadmin') {
      return { success: false, error: 'Cannot delete superadmin user' };
    }

    // Prevent deleting yourself
    if (user.id === session.user.id) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Remove from mock data
    mockUsers.splice(userIndex, 1);

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function getBranchesForUserForm() {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // Import branches dynamically to avoid circular dependency
    const { getBranches } = await import('./branches');
    const result = await getBranches();

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: 'Failed to fetch branches' };
  } catch (error) {
    console.error('Error fetching branches:', error);
    return { success: false, error: 'Failed to fetch branches' };
  }
}
