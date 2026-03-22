'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import {
  LayoutDashboard,
  Package,
  Store,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Bell,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { Role } from '@/lib/permissions';
import { can } from '@/lib/permissions';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Categories', href: '/dashboard/categories', icon: BarChart3, permission: 'manage_categories' },
    { title: 'Products', href: '/dashboard/products', icon: Package, permission: 'manage_products' },
    { title: 'Branches', href: '/dashboard/branches', icon: Store, permission: 'manage_branches' },
    { title: 'Inventory', href: '/dashboard/inventory', icon: ClipboardList, permission: 'view_inventory' },
    { title: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, permission: 'process_orders' },
    { title: 'Reports', href: '/dashboard/reports', icon: BarChart3, permission: 'view_sales_reports' },
    { title: 'Alerts', href: '/dashboard/alerts', icon: Bell, permission: 'dismiss_expiry_alerts' },
    { title: 'Users', href: '/dashboard/users', icon: Users, permission: 'manage_users' },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || can(role, item.permission as any)
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3">
          {isOpen && (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">🦅</span>
              <span>E-WingShop</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="ml-auto"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <nav className="space-y-1 p-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-2',
                          !isOpen && 'justify-center'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {isOpen && <span>{item.title}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 border-t p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2',
                  !isOpen && 'justify-center'
                )}
              >
                <Settings className="h-4 w-4" />
                {isOpen && <span>Settings</span>}
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Settings</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
