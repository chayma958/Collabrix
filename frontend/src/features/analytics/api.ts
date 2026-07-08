import { apiClient } from '@/lib/api-client';
import type { TaskPriority } from '@/types/board';

export interface AnalyticsDashboard {
  statusBreakdown: { name: string; count: number }[];
  priorityBreakdown: { priority: TaskPriority; count: number }[];
  workload: { userId: string; name: string; count: number }[];
  completionTrend: { date: string; count: number }[];
}

export const analyticsApi = {
  getDashboard: (workspaceId: string) =>
    apiClient
      .get<AnalyticsDashboard>(`/workspaces/${workspaceId}/analytics`)
      .then((r) => r.data),
};
