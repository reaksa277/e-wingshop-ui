import { useQuery, useMutation } from '@tanstack/react-query';
import { alertService } from '@/services/alert.service';

// Hook to fetch count of active/expired alerts
export function useAlertsCount() {
  return useQuery({
    queryKey: ['alerts-count'],
    queryFn: async () => {
      try {
        const result = await alertService.getCount();
        return result?.count || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

// Hook to fetch alerts categorized by expiry time
export function useAlertsByCategory(branchId?: number) {
  return useQuery({
    queryKey: ['alerts-by-category', branchId],
    queryFn: async () => {
      try {
        const result = await alertService.getByCategory(branchId);
        return result;
      } catch {
        return {
          oneMonth: [],
          twoWeeks: [],
          oneWeek: [],
          expired: [],
          totals: { oneMonth: 0, twoWeeks: 0, oneWeek: 0, expired: 0, total: 0 },
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

// Hook to fetch recent alerts
export function useRecentAlerts(limit = 5) {
  return useQuery({
    queryKey: ['alerts-recent', limit],
    queryFn: async () => {
      const result = await alertService.getRecent(limit);
      return result || { data: { alerts: [] } };
    },
    staleTime: 20 * 1000, // 20 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

// Hook to mark alert as read
export function useMarkAlertAsRead() {
  return useMutation({
    mutationFn: (alertId: string) => alertService.markAsRead(alertId),
  });
}

// Hook to mark all alerts as read
export function useMarkAllAlertsAsRead() {
  return useMutation({
    mutationFn: () => alertService.markAllAsRead(),
  });
}
