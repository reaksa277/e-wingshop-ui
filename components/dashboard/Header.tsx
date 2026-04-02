'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlertsCount, useRecentAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead } from '@/hooks/use-alerts';
import { getRelativeTime } from '@/lib/utils';

export function DashboardHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: alertCount = 0 } = useAlertsCount();
  const { data: recentAlertsResponse, isLoading: isLoadingAlerts } = useRecentAlerts(5);
  const markAsReadMutation = useMarkAlertAsRead();
  const markAllAsReadMutation = useMarkAllAlertsAsRead();

  const recentAlerts = recentAlertsResponse?.data?.alerts || [];

  const handleAlertClick = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
    setIsOpen(false);
    router.push(`/dashboard/alerts/${alertId}`);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-end gap-4 px-6">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6 p-0 flex items-center justify-center text-xs"
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-80">
            {/* Header */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Alerts</h3>
                {alertCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>

            {/* Alerts List */}
            {isLoadingAlerts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No alerts</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1 p-2">
                  {recentAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => handleAlertClick(alert.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        alert.isRead
                          ? 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          : 'bg-blue-50 dark:bg-blue-950/30 text-foreground hover:bg-blue-100 dark:hover:bg-blue-900/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium line-clamp-1">
                            {alert.product?.name || 'Product'} - Expiring Soon
                          </h4>
                          {!alert.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Expiry: {new Date(alert.expiryDate).toLocaleDateString()} • {alert.daysRemaining || 0} days
                        </p>
                        {alert.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(new Date(alert.createdAt))}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Footer */}
            {recentAlerts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/alerts');
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>View all alerts</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
