import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type UpdateTaskInput } from '@/features/tasks/api';

export function useUpdateTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskInput) => tasksApi.update(taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useAssignTask(boardId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => tasksApi.assign(taskId, userIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useSetTaskLabels(boardId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelIds: string[]) => tasksApi.setLabels(taskId, labelIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
