"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@/hooks";
import { clearAuth } from "@/lib/auth-helpers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", roles: ["OWNER", "ADMIN", "CUSTOMER"] },
  { label: "Products", href: "/dashboard/products", roles: ["OWNER", "ADMIN", "CUSTOMER"] },
  { label: "Branches", href: "/dashboard/branches", roles: ["OWNER", "ADMIN"] },
  { label: "Inventory", href: "/dashboard/inventory", roles: ["OWNER", "ADMIN"] },
  { label: "Orders", href: "/dashboard/orders", roles: ["OWNER", "ADMIN", "CUSTOMER"] },
  { label: "Discounts", href: "/dashboard/discounts", roles: ["OWNER", "ADMIN"] },
  { label: "Reports", href: "/dashboard/reports", roles: ["OWNER", "ADMIN"] },
  { label: "Users", href: "/dashboard/users", roles: ["OWNER", "ADMIN"] },
  { label: "Audit log", href: "/dashboard/audit", roles: ["OWNER", "ADMIN"] },
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
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            🛒 FreshMart
          </Link>
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <nav className="grid gap-1 p-3">
            {visibleNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className="justify-start"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <Card className="shadow-none">
            <CardContent className="space-y-3 p-4">
              <div>
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>

              <Badge variant="secondary" className="w-fit">
                {role}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                {logout.isPending ? "Signing out…" : "Sign out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
