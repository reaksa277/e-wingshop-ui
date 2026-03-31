'use client';

import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { tokenStore } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { Role } from '@/lib/permissions';
import type { RoleName } from '@/types';

// Map API RoleName to internal Role type
function mapRoleNameToRole(roleName: RoleName): Role {
  const roleMap: Record<RoleName, Role> = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'manager',
    STAFF: 'staff',
  };
  return roleMap[roleName];
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const hasCheckedAuth = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check hydration and get token after mount
  useEffect(() => {
    setIsHydrated(true);
    const accessToken = tokenStore.getAccess();
    setToken(accessToken);
  }, []);

  // Fetch current user
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // Check authentication on mount
  useEffect(() => {
    if (hasCheckedAuth.current || !isHydrated) return;
    hasCheckedAuth.current = true;

    console.log('[Dashboard Auth Check]', { hasToken: !!token });

    if (!token) {
      console.warn('[Dashboard] No authentication token found, redirecting to login');
      router.push('/auth/login');
    }
  }, [router, token, isHydrated]);

  // Render nothing during hydration to match server output
  if (!isHydrated) {
    return null;
  }

  // Return null if no token (user will be redirected to login)
  if (!token) {
    return null;
  }

  // Wait for user data to load before rendering sidebar with role-based nav
  if (userLoading || !userData?.role) {
    return null;
  }

  // Get mapped role for Sidebar
  const role = mapRoleNameToRole(userData.role);

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
