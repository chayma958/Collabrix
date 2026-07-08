import { apiClient } from '@/lib/api-client';
import type { Label } from '@/types/board';

export const labelsApi = {
  listByWorkspace: (workspaceId: string) =>
    apiClient.get<Label[]>('/labels', { params: { workspaceId } }).then((r) => r.data),
  create: (data: { workspaceId: string; name: string; color: string }) =>
    apiClient.post<Label>('/labels', data).then((r) => r.data),
};
