import { useAuth } from '@/features/auth/AuthContext';
import { useWorkspaceMembers } from './useMembers';
import type { WorkspaceRole } from '@/types/workspace';

export function useMyWorkspaceRole(workspaceId: string): WorkspaceRole | undefined {
  const { user } = useAuth();
  const { data: members } = useWorkspaceMembers(workspaceId);
  return members?.find((m) => m.userId === user?.id)?.role;
}
