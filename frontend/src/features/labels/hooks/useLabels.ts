import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/features/labels/api';

export function useLabels(workspaceId: string) {
  return useQuery({
    queryKey: ['labels', workspaceId],
    queryFn: () => labelsApi.listByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateLabel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      labelsApi.create({ workspaceId, ...data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labels', workspaceId] }),
  });
}
