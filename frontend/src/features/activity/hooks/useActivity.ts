import { useInfiniteQuery } from '@tanstack/react-query';
import { activityApi } from '@/features/activity/api';
import type { ActivityLogEntry } from '@/types/activity';

const PAGE_SIZE = 20;

export function useActivity(workspaceId: string) {
  return useInfiniteQuery({
    queryKey: ['activity', workspaceId],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      activityApi.list(workspaceId, pageParam, PAGE_SIZE),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ActivityLogEntry[]) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1].id : undefined,
    enabled: !!workspaceId,
  });
}
