// lib/role-utils.ts
// Utility functions for handling role names

import type { RoleName } from '@/types';

/**
 * Extract role name from various formats
 * Handles both string and object formats that backend might return
 */
export function getRoleName(role: any): string | null {
  if (!role) return null;

  // If it's a string, return it directly
  if (typeof role === 'string') {
    return role;
  }

  // If it's an object, try to extract the name
  if (typeof role === 'object') {
    // Try common property names for role
    if (role.name) return role.name;
    if (role.roleName) return role.roleName;
    if (role.role) return role.role;
    if (role.type) return role.type;
  }

  return null;
}

/**
 * Format role name for display (lowercase)
 */
export function formatRoleName(role: any): string {
  const roleName = getRoleName(role);
  return roleName ? roleName.toLowerCase() : 'user';
}

/**
 * Format role name for badge display (uppercase)
 */
export function formatRoleNameBadge(role: any): string {
  const roleName = getRoleName(role);
  return roleName || 'USER';
}

/**
 * Get badge variant based on role
 * Handles both API role names (SUPERADMIN, ADMIN, STAFF) and internal names
 */
export function getRoleBadgeVariant(
  role: any
): 'destructive' | 'default' | 'secondary' | 'outline' {
  const roleName = getRoleName(role);
  if (!roleName) return 'secondary';

  const lowerRole = roleName.toLowerCase();

  // Map both API names and internal names
  switch (lowerRole) {
    case 'superadmin':
    case 'owner':
      return 'destructive';
    case 'admin':
    case 'manager':
      return 'default';
    case 'staff':
      return 'secondary';
    case 'customer':
    case 'viewer':
      return 'outline';
    default:
      return 'secondary';
  }
}
