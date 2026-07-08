import { apiClient } from '@/lib/api-client';
import type { Board, BoardWithColumns, Column } from '@/types/board';

export const boardsApi = {
  listByWorkspace: (workspaceId: string) =>
    apiClient.get<Board[]>('/boards', { params: { workspaceId } }).then((r) => r.data),
  create: (data: { workspaceId: string; name: string; description?: string }) =>
    apiClient.post<Board>('/boards', data).then((r) => r.data),
  get: (boardId: string) =>
    apiClient.get<BoardWithColumns>(`/boards/${boardId}`).then((r) => r.data),
  update: (boardId: string, data: { name?: string; description?: string }) =>
    apiClient.patch<Board>(`/boards/${boardId}`, data).then((r) => r.data),
  remove: (boardId: string) => apiClient.delete(`/boards/${boardId}`),
};

export const columnsApi = {
  create: (data: { boardId: string; name: string }) =>
    apiClient.post<Column>('/columns', data).then((r) => r.data),
  update: (columnId: string, data: { name: string }) =>
    apiClient.patch<Column>(`/columns/${columnId}`, data).then((r) => r.data),
  remove: (columnId: string) => apiClient.delete(`/columns/${columnId}`),
};
