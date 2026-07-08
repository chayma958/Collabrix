import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/features/tasks/api';
import type { TaskPriority } from '@/types/board';

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { columnId: string; title: string; priority?: TaskPriority }) =>
      tasksApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
