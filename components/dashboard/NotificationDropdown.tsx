'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAlertsByCategory } from '@/hooks/use-alerts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'low-stock' | 'expiring' | 'expired';
  severity: 'warning' | 'error';
  read: boolean;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const { data: alertsData, isLoading: isLoadingAlerts, refetch } = useAlertsByCategory();

  const totalAlerts = Math.max(0, (alertsData?.totals.total ?? 0) - readIds.size);

  // Build notifications from alerts data
  useEffect(() => {
    if (!alertsData) return;

    const items: NotificationItem[] = [];

    // Combine all alerts from categories
    const allAlerts = [
      ...alertsData.oneMonth,
      ...alertsData.twoWeeks,
      ...alertsData.oneWeek,
      ...alertsData.expired,
    ];

    allAlerts.forEach((alert) => {
      let type: NotificationItem['type'] = 'expiring';
      let severity: NotificationItem['severity'] = 'warning';
      let title = '';

      if (alert.category === 'EXPIRED') {
        type = 'expired';
        severity = 'error';
        title = '🚨 Product Expired';
      } else if (alert.category === 'ONE_WEEK') {
        type = 'expiring';
        severity = 'warning';
        title = '⏰ Product Expiring Soon';
      } else if (alert.category === 'TWO_WEEKS') {
        type = 'expiring';
        severity = 'warning';
        title = '⏰ Product Expiring';
      } else {
        type = 'expiring';
        severity = 'warning';
        title = '📅 Product Expiring This Month';
      }

      const productName = alert.productName ?? alert.product?.name ?? 'Unknown Product';
      const branchName = alert.branchName ?? alert.branch?.name ?? 'Unknown Branch';
      const daysRemaining = alert.daysRemaining ?? 0;

      let message = '';
      if (alert.category === 'EXPIRED') {
        message = `${productName} at ${branchName} expired ${Math.abs(daysRemaining)} days ago`;
      } else {
        message = `${productName} at ${branchName} expires in ${daysRemaining} days`;
      }

      items.push({
        id: alert.id,
        title,
        message,
        timestamp: new Date(alert.createdAt ?? Date.now()),
        type,
        severity,
        read: alert.isRead ?? false,
      });
    });

    setNotifications(items.slice(0, 20)); // Limit to 20 notifications
  }, [alertsData]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setReadIds(new Set());
      refetch();
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  };

  const refreshAlerts = () => {
    refetch();
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getIcon = (type: NotificationItem['type'], severity: NotificationItem['severity']) => {
    switch (type) {
      case 'low-stock':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'expiring':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getSeverityBorder = (severity: NotificationItem['severity']) => {
    return severity === 'error' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500';
  };

  const handleViewAll = () => {
    router.push('/dashboard/alerts');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {totalAlerts > 99 ? '99+' : totalAlerts}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h4 className="text-sm font-semibold">Inventory Alerts</h4>
            <p className="text-xs text-muted-foreground">
              {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} requiring attention
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAlerts}
              disabled={isLoadingAlerts}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', isLoadingAlerts && 'animate-spin')} />
            </Button>
            {notifications.filter((n) => !n.read).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto px-2 py-1 text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all
              </Button>
            )}
          </div>
        </div>
        <Separator />

        {/* Alert List */}
        <ScrollArea className="h-96">
          {isLoadingAlerts ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">All inventory is in good condition</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer border-l-4',
                    getSeverityBorder(notification.severity),
                    !notification.read && 'bg-blue-50/50 dark:bg-blue-950/20'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type, notification.severity)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={handleViewAll}>
                View All Alerts ({totalAlerts})
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                💡 Alerts are checked automatically
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
