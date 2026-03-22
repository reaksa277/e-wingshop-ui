import bcrypt from 'bcryptjs';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'superadmin' | 'manager' | 'staff' | 'viewer';
  branchId?: string | null;
  image?: string;
}

// Pre-hashed password for "password123"
const HASHED_PASSWORD = '$2b$10$PsfkXCWb86FSsc3Q1JTa5uqWb8AHmm/AFvsjWSNqNDyq0zCADCYkW';

// Mock users for testing different roles
export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'superadmin@ewingshop.com',
    name: 'Super Admin',
    password: HASHED_PASSWORD,
    role: 'superadmin',
    branchId: null,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
  },
  {
    id: '2',
    email: 'manager1@ewingshop.com',
    name: 'Manager One',
    password: HASHED_PASSWORD,
    role: 'manager',
    branchId: 'branch-1',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager1',
  },
  {
    id: '3',
    email: 'manager2@ewingshop.com',
    name: 'Manager Two',
    password: HASHED_PASSWORD,
    role: 'manager',
    branchId: 'branch-2',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager2',
  },
  {
    id: '4',
    email: 'staff1@ewingshop.com',
    name: 'Staff One',
    password: HASHED_PASSWORD,
    role: 'staff',
    branchId: 'branch-1',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff1',
  },
  {
    id: '5',
    email: 'staff2@ewingshop.com',
    name: 'Staff Two',
    password: HASHED_PASSWORD,
    role: 'staff',
    branchId: 'branch-2',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff2',
  },
  {
    id: '6',
    email: 'staff3@ewingshop.com',
    name: 'Staff Three',
    password: HASHED_PASSWORD,
    role: 'staff',
    branchId: 'branch-1',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff3',
  },
  {
    id: '7',
    email: 'viewer@ewingshop.com',
    name: 'Viewer',
    password: HASHED_PASSWORD,
    role: 'viewer',
    branchId: null,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
  },
];

export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === id);
}

export function getAllUsers(): Omit<MockUser, 'password'>[] {
  return mockUsers.map(({ password, ...user }) => user);
}
