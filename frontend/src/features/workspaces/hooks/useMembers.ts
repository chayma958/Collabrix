import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/features/workspaces/api';
import type { WorkspaceRole } from '@/types/workspace';

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspacesApi.listMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: WorkspaceRole }) =>
      workspacesApi.invite(workspaceId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] }),
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] }),
  });
}
