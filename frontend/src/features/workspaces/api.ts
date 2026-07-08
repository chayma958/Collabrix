import { apiClient } from '@/lib/api-client';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types/workspace';

export const workspacesApi = {
  list: () => apiClient.get<Workspace[]>('/workspaces').then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<Workspace>('/workspaces', data).then((r) => r.data),
  get: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`).then((r) => r.data),
  listMembers: (id: string) =>
    apiClient.get<WorkspaceMember[]>(`/workspaces/${id}/members`).then((r) => r.data),
  invite: (id: string, data: { email: string; role: WorkspaceRole }) =>
    apiClient.post<WorkspaceMember>(`/workspaces/${id}/invite`, data).then((r) => r.data),
  removeMember: (id: string, memberId: string) =>
    apiClient.delete(`/workspaces/${id}/members/${memberId}`),
  remove: (id: string) => apiClient.delete(`/workspaces/${id}`),
};
