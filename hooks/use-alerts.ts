import { useQuery, useMutation } from '@tanstack/react-query';
import { alertService } from '@/services/alert.service';

// Hook to fetch count of active/expired alerts
export function useAlertsCount() {
  return useQuery({
    queryKey: ['alerts-count'],
    queryFn: async () => {
      try {
        const result = await alertService.getCount();
        return result.count || 0;
      } catch {
        return 0;
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
    queryFn: () => alertService.getRecent(limit),
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
