## Role-Based Permission Management

This document outlines the role-based access control (RBAC) system for E-WingShop.

### Role Hierarchy

| Role       | API Name   | Level       | Description                            |
| ---------- | ---------- | ----------- | -------------------------------------- |
| Superadmin | `OWNER`    | 5 (Highest) | Full system access, manages everything |
| Manager    | `ADMIN`    | 3           | Branch management, inventory, products |
| Staff      | `STAFF`    | 2           | Product and inventory management       |
| Viewer     | `CUSTOMER` | 1 (Lowest)  | Read-only inventory access             |

### Permissions by Role

#### Superadmin (OWNER)

Can perform all actions:

- ✅ manage_users - Create/edit/delete user accounts and staff
- ✅ manage_roles - Assign and modify user roles
- ✅ manage_branches - Create/edit/delete branches
- ✅ manage_products - Add/edit/delete products
- ✅ manage_categories - Create/manage product categories
- ✅ manage_inventory - Create/update inventory records
- ✅ view_inventory - View inventory and stock levels
- ✅ process_orders - Confirm, deliver, cancel orders
- ✅ view_sales_reports - Access analytics and reports
- ✅ dismiss_expiry_alerts - Manage expiry notifications

#### Manager (ADMIN)

Can manage branch operations:

- ✅ manage_branches - Create/edit/delete branches
- ✅ manage_products - Add/edit/delete products
- ✅ manage_categories - Create/manage product categories
- ✅ manage_inventory - Track and modify inventory
- ✅ view_inventory - View all inventory
- ✅ process_orders - Handle customer orders
- ✅ view_sales_reports - Monitor sales data
- ✅ dismiss_expiry_alerts - Manage product alerts
- ❌ manage_users - Cannot manage staff
- ❌ manage_roles - Cannot change roles

#### Staff (STAFF)

Can manage products and inventory:

- ✅ manage_products - Add/edit/delete products
- ✅ manage_inventory - Update stock levels
- ✅ view_inventory - Check stock availability
- ✅ process_orders - Process customer orders
- ❌ manage_branches - Cannot manage branches
- ❌ manage_categories - Cannot create categories
- ❌ manage_users - Cannot manage users
- ❌ view_sales_reports - Cannot view reports
- ❌ dismiss_expiry_alerts - Cannot manage alerts

#### Viewer (CUSTOMER)

Read-only access:

- ✅ view_inventory - Can see available products and stock
- ❌ All management permissions - No write access

### Dashboard Navigation

The sidebar automatically filters menu items based on user role and permissions:

| Menu Item  | Required Permission   | Accessible Roles           |
| ---------- | --------------------- | -------------------------- |
| Dashboard  | None                  | All                        |
| Categories | manage_categories     | Superadmin, Manager        |
| Products   | manage_products       | Superadmin, Manager, Staff |
| Branches   | manage_branches       | Superadmin, Manager        |
| Inventory  | view_inventory        | All                        |
| Orders     | process_orders        | Superadmin, Manager, Staff |
| Reports    | view_sales_reports    | Superadmin, Manager        |
| Alerts     | dismiss_expiry_alerts | Superadmin, Manager        |
| Users      | manage_users          | Superadmin                 |

### Using Permission Guards in Components

#### 1. RoleGuard Component

Conditionally render content based on permissions:

```tsx
import { RoleGuard } from '@/components/dashboard/RoleGuard';

export function ProductActions() {
  return (
    <>
      {/* Everyone can see this button */}
      <button>View Details</button>

      {/* Only superadmin, manager, and staff can see this */}
      <RoleGuard permission="manage_products">
        <button>Edit Product</button>
      </RoleGuard>

      {/* Only superadmin and manager can see this */}
      <RoleGuard permission="manage_categories">
        <button>Manage Categories</button>
      </RoleGuard>

      {/* Fallback UI if no permission */}
      <RoleGuard
        permission="manage_users"
        fallback={<span className="text-gray-500">Requires Admin</span>}
      >
        <button>Manage Staff</button>
      </RoleGuard>
    </>
  );
}
```

#### 2. Permission Utility Functions

```tsx
import { can, canAny, canAll } from '@/lib/permissions';
import type { Role } from '@/lib/permissions';

// Single permission check
if (can(userRole, 'manage_products')) {
  // Show edit/delete buttons
}

// Check if user has ANY of the specified permissions
if (canAny(userRole, ['manage_products', 'manage_categories'])) {
  // Show general management UI
}

// Check if user has ALL specified permissions
if (canAll(userRole, ['manage_products', 'manage_inventory'])) {
  // Show advanced operations
}
```

#### 3. Get All Permissions for a Role

```tsx
import { getPermissionsForRole, type Role } from '@/lib/permissions';

const role: Role = 'manager';
const permissions = getPermissionsForRole(role);
console.log(permissions);
// Output: ['manage_branches', 'manage_products', 'manage_categories',
//          'manage_inventory', 'view_inventory', 'process_orders',
//          'view_sales_reports', 'dismiss_expiry_alerts']
```

### User Creation and Role Assignment

When creating users via the admin panel:

1. **Superadmin** - System owner, can only be created by database migration
2. **Manager** - Use: `api.post('/users/staff', { ..., role: 'ADMIN' })`
3. **Staff** - Use: `api.post('/users/staff', { ..., role: 'STAFF' })`
4. **Customer** - Self-register or invited with `role: 'CUSTOMER'`

### API Endpoints with Permission Requirements

| Endpoint           | Method   | Permission                         | Roles                              |
| ------------------ | -------- | ---------------------------------- | ---------------------------------- |
| `/users`           | GET      | manage_users                       | Superadmin                         |
| `/users/staff`     | POST     | manage_users                       | Superadmin                         |
| `/users/{id}/role` | PATCH    | manage_roles                       | Superadmin                         |
| `/branches`        | GET/POST | manage_branches                    | Superadmin, Manager                |
| `/categories`      | GET/POST | manage_categories                  | Superadmin, Manager                |
| `/products`        | GET/POST | manage_products                    | Superadmin, Manager, Staff         |
| `/inventory`       | GET/POST | manage_inventory or view_inventory | Superadmin, Manager, Staff, Viewer |
| `/orders`          | GET/POST | process_orders                     | Superadmin, Manager, Staff         |
| `/reports/*`       | GET      | view_sales_reports                 | Superadmin, Manager                |
| `/audit/*`         | GET      | manage_roles or manage_users       | Superadmin                         |

### Implementation Details

- **Type Mapping**: API role names (OWNER, ADMIN, STAFF, CUSTOMER) are mapped to internal role types (superadmin, manager, staff, viewer)
- **Location**: Mapping happens in `DashboardLayout.tsx` and `RoleGuard.tsx`
- **Sidebar Filtering**: Navigation items are automatically hidden for users without required permissions
- **Frontend Protection**: RoleGuard components prevent unauthorized UI access
- **Backend Enforcement**: The Spring Boot backend enforces all permission checks at the API level

### Security Notes

⚠️ **Important**: Frontend permission checks are for UX only. The backend API must enforce all permission checks:

- Frontend hides UI elements for users without permissions
- Backend validates permissions for all API requests
- Never trust client-side permission checks alone

### Testing Different Roles

To test each role locally:

1. **Create test users** with each role in the Spring Boot admin panel
2. **Log in** as each user
3. **Verify** that sidebar items and action buttons appear/disappear as expected
4. **Test API calls** to ensure backend also enforces permissions

### Extending Permissions

To add new permissions:

1. Add to `Permission` type in `lib/permissions.ts`:

   ```tsx
   export type Permission = '...' | 'new_permission';
   ```

2. Add to relevant roles in `rolePermissions`:

   ```tsx
   export const rolePermissions: Record<Role, Permission[]> = {
     superadmin: [..., 'new_permission'],
     manager: [..., 'new_permission'], // if applicable
     // ...
   };
   ```

3. Use in components:
   ```tsx
   <RoleGuard permission="new_permission">{/* content */}</RoleGuard>
   ```
