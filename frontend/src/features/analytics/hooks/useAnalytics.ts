import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/analytics/api';

export function useAnalytics(workspaceId: string) {
  return useQuery({
    queryKey: ['analytics', workspaceId],
    queryFn: () => analyticsApi.getDashboard(workspaceId),
    enabled: !!workspaceId,
  });
}
