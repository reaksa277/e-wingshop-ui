'use client';

import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { tokenStore } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { Role } from '@/lib/permissions';
import type { RoleName } from '@/types';

// Map API RoleName to internal Role type
function mapRoleNameToRole(roleName: RoleName): Role {
  const roleMap: Record<RoleName, Role> = {
    OWNER: 'superadmin',
    ADMIN: 'manager',
    CUSTOMER: 'viewer',
  };
  return roleMap[roleName];
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const hasCheckedAuth = useRef(false);
  const token = tokenStore.getAccess();

  // Fetch current user
  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // Check authentication on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    console.log('[Dashboard Auth Check]', { hasToken: !!token });

    if (!token) {
      console.warn('[Dashboard] No authentication token found, redirecting to login');
      router.push('/auth/login');
    }
  }, [router, token]);

  // Return null while checking auth or if no token
  // The effect will handle navigation if needed
  if (!token) {
    return null;
  }

  // Get mapped role for Sidebar
  const role = userData?.role ? mapRoleNameToRole(userData.role) : 'viewer';

  return (
    <ReactQueryProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar role={role} />
          <div
            className={cn(
              'flex flex-1 flex-col transition-all duration-300',
              'ml-16',
              isOpen && 'ml-64'
            )}
          >
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </ReactQueryProvider>
  );
}
