'use client';

import { useAuth } from '@/lib/auth-context';
import { type ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Role-based access control component
 * Only renders children if the user's role is in the allowedRoles array
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
