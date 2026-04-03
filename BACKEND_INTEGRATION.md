# Backend Integration Guide - Role System

## Your Backend Response Format

Your backend returns authentication responses like:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "userId": 1,
  "fullName": "System Owner",
  "email": "owner@grocery.local",
  "role": "SUPERADMIN"
}
```

## Role Type Mapping

Your backend role names map to internal permission system:

| Backend Role   | Internal Role | Permissions                                                        |
| -------------- | ------------- | ------------------------------------------------------------------ |
| **SUPERADMIN** | `superadmin`  | Full system access - everything                                    |
| **ADMIN**      | `manager`     | Branches, Products, Categories, Inventory, Orders, Reports, Alerts |
| **STAFF**      | `staff`       | Products, Inventory, Orders                                        |

## How It Works

1. **User logs in** → Backend returns response with `userId` and `role`
2. **Frontend stores** → Logs tokens to localStorage
3. **Sidebar filters** → Based on role, shows appropriate menu items
4. **Components respect** → RoleGuard components enforce permissions

## Current Implementation

### Types (types/index.ts)

```tsx
export type RoleName = 'SUPERADMIN' | 'ADMIN' | 'STAFF';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: RoleName; // ← One of: SUPERADMIN, ADMIN, STAFF
}
```

### Auth Service (services/auth.service.ts)

```tsx
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.postPublic<AuthResponse>('/auth/login', data);
    tokenStore.setTokens(res.accessToken, res.refreshToken);
    return res;
  },
  // ...
};
```

### Role Mapping (in DashboardLayout)

```tsx
function mapRoleNameToRole(roleName: RoleName): Role {
  const roleMap: Record<RoleName, Role> = {
    SUPERADMIN: 'superadmin', // Full permissions
    ADMIN: 'manager', // Branch manager permissions
    STAFF: 'staff', // Staff permissions
  };
  return roleMap[roleName];
}
```

## Sidebar Visibility

When a user with `role: "SUPERADMIN"` logs in:

✅ **Visible menu items:**

- Dashboard
- Categories
- Products
- Branches
- Inventory
- Orders
- Reports
- Alerts
- Users

When a user with `role: "ADMIN"` logs in:

✅ **Visible menu items:**

- Dashboard
- Categories
- Products
- Branches
- Inventory
- Orders
- Reports
- Alerts

❌ **Hidden:**

- Users (requires SUPERADMIN)

When a user with `role: "STAFF"` logs in:

✅ **Visible menu items:**

- Dashboard
- Products
- Inventory
- Orders

## Testing

1. **Log in as SUPERADMIN** - Should see all menu items
2. **Log in as ADMIN** - Should see all except Users
3. **Log in as STAFF** - Should see only Products, Inventory, Orders

## How to Get User ID

In any component:

```tsx
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';

export function MyComponent() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!tokenStore.getAccess());
  }, []);

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: hasToken,
  });

  return (
    <div>
      <p>User ID: {userData?.id}</p>
      <p>Role: {userData?.role}</p>
      <p>Name: {userData?.fullName}</p>
    </div>
  );
}
```

## Key Points

✅ No `roleId` field needed - role name is sufficient  
✅ Role string (`SUPERADMIN`, `ADMIN`, `STAFF`) maps to internal permission system  
✅ Frontend enforces UI permissions (sidebar, RoleGuard components)  
✅ Backend must enforce API permissions  
✅ User ID (`userId`) is returned on login  
✅ Tokens are persisted in localStorage for session management
