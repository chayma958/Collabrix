import { apiClient } from '@/lib/api-client';
import type { Task, TaskPriority } from '@/types/board';

export interface SearchResultTask extends Task {
  column: {
    id: string;
    name: string;
    board: { id: string; name: string };
  };
}

export interface SearchTasksParams {
  q?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  labelId?: string;
}

export const searchApi = {
  searchTasks: (workspaceId: string, params: SearchTasksParams) =>
    apiClient
      .get<SearchResultTask[]>(`/workspaces/${workspaceId}/tasks/search`, { params })
      .then((r) => r.data),
};
