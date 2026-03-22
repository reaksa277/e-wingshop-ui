'use client';

import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { isOpen } = useSidebarStore();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar role={session.user.role} />
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
