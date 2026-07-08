import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchTasksParams } from '@/features/search/api';

export function useSearchTasks(workspaceId: string, params: SearchTasksParams, enabled: boolean) {
  return useQuery({
    queryKey: ['search-tasks', workspaceId, params],
    queryFn: () => searchApi.searchTasks(workspaceId, params),
    enabled: enabled && !!workspaceId,
  });
}
