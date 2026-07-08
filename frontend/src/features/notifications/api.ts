import { apiClient } from '@/lib/api-client';
import type { AppNotification } from '@/types/notification';

export const notificationsApi = {
  list: (cursor?: string, limit?: number) =>
    apiClient
      .get<AppNotification[]>('/notifications', { params: { cursor, limit } })
      .then((r) => r.data),
  unreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  markRead: (id: string) =>
    apiClient.patch<AppNotification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};
