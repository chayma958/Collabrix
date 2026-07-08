import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { AppNotification } from '@/types/notification';

const PAGE_SIZE = 20;

export function useNotifications() {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      notificationsApi.list(pageParam, PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: AppNotification[]) =>
      Array.isArray(lastPage) && lastPage.length === PAGE_SIZE
        ? lastPage[lastPage.length - 1].id
        : undefined,
    enabled: !!user,
  });
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
