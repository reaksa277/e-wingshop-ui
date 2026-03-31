'use client';

import { useQuery } from '@tanstack/react-query';
import { can, type Role } from '@/lib/permissions';
import { Permission } from '@/lib/permissions';
import { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';
import type { UserResponse, RoleName } from '@/types';

// Map API RoleName to internal Role type
function mapRoleNameToRole(roleName: RoleName): Role {
  const roleMap: Record<RoleName, Role> = {
    OWNER: 'superadmin',
    ADMIN: 'manager',
    CUSTOMER: 'viewer',
  };
  return roleMap[roleName];
}

interface RoleGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function RoleGuard({ children, permission, fallback = null }: RoleGuardProps) {
  const isAuthenticated = !!tokenStore.getAccess();

  const { data: userData } = useQuery<UserResponse | undefined>({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  if (!userData?.role) {
    return <>{fallback}</>;
  }

  const mappedRole = mapRoleNameToRole(userData.role);
  const hasPermission = can(mappedRole, permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
