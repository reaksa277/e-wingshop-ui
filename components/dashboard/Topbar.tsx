'use client';

import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api-client';

export function Topbar() {
  const router = useRouter();
  const { unreadAlertsCount } = useNotificationStore();

  // Fetch current user
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.me(),
    enabled: !!tokenStore.getAccess(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSignOut = () => {
    authService.logout();
  };

  const userInitials = userData?.fullName
    ? userData.fullName
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
                  <p className="text-center text-sm text-muted-foreground py-4">No active alerts</p>
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
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col text-left text-sm md:flex">
                <span className="font-medium">{userLoading ? 'Loading...' : userData?.fullName || 'User'}</span>
                <span className="text-xs text-muted-foreground">
                  {userData && userData.role ? String(userData.role).toLowerCase() : 'user'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs">
              <p className="text-muted-foreground font-medium">Email</p>
              <p className="text-foreground wrap-break-word">{userData?.email}</p>
            </div>
            <div className="px-2 py-1.5 text-xs">
              <p className="text-muted-foreground font-medium">Role</p>
              <p className="text-foreground capitalize">{userData && userData.role ? String(userData.role).toLowerCase() : 'N/A'}</p>
            </div>
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
