'use client';

import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { unreadAlertsCount, setUnreadAlertsCount } = useNotificationStore();

  // Fetch unread alerts count
  const { data: alertsData } = useQuery({
    queryKey: ['alerts-count'],
    queryFn: async () => {
      const res = await fetch('/api/alerts/count');
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if (alertsData?.count !== undefined) {
      setUnreadAlertsCount(alertsData.count);
    }
  }, [alertsData, setUnreadAlertsCount]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadAlertsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]"
                >
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Expiry Alerts</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-64">
              <div className="space-y-2 p-2">
                {unreadAlertsCount === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No active alerts
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    {unreadAlertsCount} alert(s) pending review
                  </p>
                )}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/alerts')}
              className="cursor-pointer"
            >
              View all alerts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col text-left text-sm md:flex">
                <span className="font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.role?.toLowerCase()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
