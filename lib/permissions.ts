export type Role = 'superadmin' | 'manager' | 'staff' | 'viewer';

export type Permission =
  | 'manage_users'
  | 'manage_roles'
  | 'manage_branches'
  | 'manage_products'
  | 'manage_categories'
  | 'view_inventory'
  | 'process_orders'
  | 'view_sales_reports'
  | 'dismiss_expiry_alerts';

export const rolePermissions: Record<Role, Permission[]> = {
  superadmin: [
    'manage_users',
    'manage_roles',
    'manage_branches',
    'manage_products',
    'manage_categories',
    'view_inventory',
    'process_orders',
    'view_sales_reports',
    'dismiss_expiry_alerts',
  ],
  manager: [
    'manage_branches',
    'manage_products',
    'manage_categories',
    'view_inventory',
    'process_orders',
    'view_sales_reports',
    'dismiss_expiry_alerts',
  ],
  staff: ['manage_products', 'view_inventory', 'process_orders'],
  viewer: ['view_inventory'],
};

/**
 * Check if a role has a specific permission
 */
export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user has any of the specified permissions
 */
export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function canAll(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => can(role, permission));
}
