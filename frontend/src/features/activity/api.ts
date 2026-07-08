import { apiClient } from '@/lib/api-client';
import type { ActivityLogEntry } from '@/types/activity';

export const activityApi = {
  list: (workspaceId: string, cursor?: string, limit?: number) =>
    apiClient
      .get<ActivityLogEntry[]>(`/workspaces/${workspaceId}/activity`, {
        params: { cursor, limit },
      })
      .then((r) => r.data),
};
