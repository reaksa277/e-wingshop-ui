'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ArrowRight, Loader2, Calendar, Clock, AlertTriangle, XCircle } from 'lucide-react';
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
import {
  useAlertsByCategory,
  useMarkAlertAsRead,
  useMarkAllAlertsAsRead,
} from '@/hooks/use-alerts';
import { getRelativeTime } from '@/lib/utils';

export function DashboardHeader() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: alertsData, isLoading: isLoadingAlerts } = useAlertsByCategory();
  const markAsReadMutation = useMarkAlertAsRead();
  const markAllAsReadMutation = useMarkAllAlertsAsRead();

  const totalAlerts = alertsData?.totals.total || 0;
  const recentAlerts = [
    ...(alertsData?.expired || []),
    ...(alertsData?.oneWeek || []),
    ...(alertsData?.twoWeeks || []),
  ].slice(0, 5);

  const handleAlertClick = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
    setIsOpen(false);
    router.push(`/dashboard/alerts?id=${alertId}`);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ONE_MONTH':
        return <Calendar className="h-3 w-3 text-blue-500" />;
      case 'TWO_WEEKS':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'ONE_WEEK':
        return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      case 'EXPIRED':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ONE_MONTH':
        return 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50';
      case 'TWO_WEEKS':
        return 'bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50';
      case 'ONE_WEEK':
        return 'bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/50';
      case 'EXPIRED':
        return 'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50';
      default:
        return 'bg-muted/50 hover:bg-muted';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-end gap-4 px-6">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6 p-0 flex items-center justify-center text-xs"
                >
                  {totalAlerts > 99 ? '99+' : totalAlerts}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-96">
            {/* Header */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Alerts</h3>
                {totalAlerts > 0 && (
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
              {/* Category Summary */}
              {alertsData && (
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Calendar className="h-3 w-3 mr-1" />
                    {alertsData.totals.oneMonth}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {alertsData.totals.twoWeeks}
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {alertsData.totals.oneWeek}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    {alertsData.totals.expired}
                  </Badge>
                </div>
              )}
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
                          : getCategoryColor(alert.category)
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(alert.category)}
                            <h4 className="font-medium line-clamp-1">
                              {alert.product?.name || 'Product'}
                            </h4>
                          </div>
                          {!alert.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary" className="h-5 text-xs">
                            {alert.category === 'ONE_MONTH' && '1 Month'}
                            {alert.category === 'TWO_WEEKS' && '2 Weeks'}
                            {alert.category === 'ONE_WEEK' && '1 Week'}
                            {alert.category === 'EXPIRED' && 'Expired'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(alert.expiryDate).toLocaleDateString()} •{' '}
                            {alert.daysRemaining || 0}d
                          </span>
                        </div>
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
