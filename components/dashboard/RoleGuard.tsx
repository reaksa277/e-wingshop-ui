'use client';

import { useSession } from 'next-auth/react';
import { can } from '@/lib/permissions';
import { Permission } from '@/lib/permissions';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

export function RoleGuard({ children, permission, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession();

  if (!session?.user?.role) {
    return <>{fallback}</>;
  }

  const hasPermission = can(session.user.role, permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
