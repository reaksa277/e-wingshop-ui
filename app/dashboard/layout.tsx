"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  ClipboardList,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@/hooks";
import { clearAuth } from "@/lib/auth-helpers";

import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/sidebar";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPERADMIN", "MANAGER", "STAFF"] },
  { label: "Products", href: "/dashboard/products", icon: Package, roles: ["SUPERADMIN", "MANAGER", "STAFF"] },
  { label: "Branches", href: "/dashboard/branches", icon: Store, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: ClipboardList, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Users", href: "/dashboard/users", icon: Users, roles: ["SUPERADMIN", "MANAGER"] },
  { label: "Audit log", href: "/dashboard/audit", icon: BookOpen, roles: ["SUPERADMIN", "MANAGER"] },
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
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Sidebar Component ─────────────────────────────────────────────────────────

type NavItem = (typeof NAV_ITEMS)[number];

interface AppSidebarProps {
  user: any;
  role: string | null;
  pathname: string;
  visibleNav: NavItem[];
  onLogout: () => void;
  logoutPending: boolean;
}

function AppSidebar({ user, role, pathname, visibleNav, onLogout, logoutPending }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 py-4">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          🛒 FreshMart
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
        <div className="flex flex-col gap-3 border-t pt-4">
          {user && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">{user.fullName}</p>
              <Badge variant="secondary" className="w-fit text-xs">
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
