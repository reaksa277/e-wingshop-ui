"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  ClipboardList,
  Users,
  LogOut,
  Percent,
  Bell,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@/hooks";
import { clearAuth } from "@/lib/auth-helpers";

import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import type { UserResponse } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPERADMIN", "MANAGER", "STAFF"] },
  { label: "Categories", href: "/dashboard/categories", icon: Package, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Products", href: "/dashboard/products", icon: Package, roles: ["SUPERADMIN", "MANAGER", "STAFF"] },
  { label: "Branches", href: "/dashboard/branches", icon: Store, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: ClipboardList, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Discounts", href: "/dashboard/discounts", icon: Percent, roles: ["SUPERADMIN", "MANAGER", "STAFF"] },
//   { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Users", href: "/dashboard/users", icon: Users, roles: ["SUPERADMIN"] },
//   { label: "Audit log", href: "/dashboard/audit", icon: BookOpen, roles: ["SUPERADMIN", "MANAGER"] },
] as const;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isLoggedIn, role } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  async function handleLogout() {
    await logout.mutateAsync();
    clearAuth();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        Loading…
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const visibleNav = NAV_ITEMS.filter(
    (item) => role && (item.roles as readonly string[]).includes(role)
  );

  return (
    <SidebarProvider>
      <AppSidebar user={user} role={role ?? null} pathname={pathname} visibleNav={visibleNav} onLogout={handleLogout} logoutPending={logout.isPending} />
      <SidebarInset>
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Welcome back, {user?.fullName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Badge variant="secondary" className="hidden md:flex">
              {role}
            </Badge>
          </div>
        </header>
        <main className="dashboard-main">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Sidebar Component ─────────────────────────────────────────────────────────

type NavItem = (typeof NAV_ITEMS)[number];

interface AppSidebarProps {
  user: UserResponse | undefined;
  role: string | null;
  pathname: string;
  visibleNav: NavItem[];
  onLogout: () => void;
  logoutPending: boolean;
}

function AppSidebar({ user, role, pathname, visibleNav, onLogout, logoutPending }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="sidebar-brand">
        <div className="flex items-center gap-2">
          🛒 Grocery Stock Management
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => window.location.href = item.href}
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="sidebar-user-info">
          {user && (
            <div className="flex flex-col gap-2">
              <p className="sidebar-user-name">{user.fullName}</p>
              <Badge variant="secondary" className="sidebar-user-role">
                {role}
              </Badge>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                disabled={logoutPending}
                tooltip="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutPending ? "Signing out…" : "Sign out"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
