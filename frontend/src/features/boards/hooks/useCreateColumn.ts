import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnsApi } from '@/features/boards/api';

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => columnsApi.create({ boardId, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, name }: { columnId: string; name: string }) =>
      columnsApi.update(columnId, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnId: string) => columnsApi.remove(columnId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
