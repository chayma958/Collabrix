import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '@/features/checklist/api';

export function useChecklistItems(taskId: string) {
  return useQuery({
    queryKey: ['checklist-items', taskId],
    queryFn: () => checklistApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => checklistApi.create(taskId, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist-items', taskId] }),
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: { label?: string; isDone?: boolean };
    }) => checklistApi.update(itemId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist-items', taskId] }),
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistApi.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist-items', taskId] }),
  });
}
