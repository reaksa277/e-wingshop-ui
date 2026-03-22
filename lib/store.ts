import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  close: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      isMobileOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      close: () => set({ isOpen: false }),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ isOpen: state.isOpen }),
    }
  )
);

interface NotificationState {
  unreadAlertsCount: number;
  setUnreadAlertsCount: (count: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadAlertsCount: 0,
  setUnreadAlertsCount: (count) => set({ unreadAlertsCount: count }),
  reset: () => set({ unreadAlertsCount: 0 }),
}));
