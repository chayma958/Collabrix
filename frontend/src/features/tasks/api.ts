import { apiClient } from '@/lib/api-client';
import type { Task, TaskPriority } from '@/types/board';

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export const tasksApi = {
  create: (data: { columnId: string; title: string; priority?: TaskPriority }) =>
    apiClient.post<Task>('/tasks', data).then((r) => r.data),
  update: (taskId: string, data: UpdateTaskInput) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data),
  move: (taskId: string, data: { targetColumnId: string; targetIndex: number }) =>
    apiClient.patch<Task>(`/tasks/${taskId}/move`, data).then((r) => r.data),
  assign: (taskId: string, userIds: string[]) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assignees`, { userIds }).then((r) => r.data),
  setLabels: (taskId: string, labelIds: string[]) =>
    apiClient.patch<Task>(`/tasks/${taskId}/labels`, { labelIds }).then((r) => r.data),
  remove: (taskId: string) => apiClient.delete(`/tasks/${taskId}`),
};
