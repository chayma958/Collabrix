import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/features/boards/api';

export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => boardsApi.listByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      boardsApi.create({ workspaceId, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] }),
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      boardsApi.update(boardId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.remove(boardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] }),
  });
}
