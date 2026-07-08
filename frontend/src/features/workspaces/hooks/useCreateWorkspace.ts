import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/features/workspaces/api';

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}
