import { apiClient } from '@/lib/api-client';
import type { ChecklistItem } from '@/types/checklist';

export const checklistApi = {
  list: (taskId: string) =>
    apiClient.get<ChecklistItem[]>(`/tasks/${taskId}/checklist-items`).then((r) => r.data),
  create: (taskId: string, label: string) =>
    apiClient
      .post<ChecklistItem>(`/tasks/${taskId}/checklist-items`, { label })
      .then((r) => r.data),
  update: (itemId: string, data: { label?: string; isDone?: boolean }) =>
    apiClient.patch<ChecklistItem>(`/checklist-items/${itemId}`, data).then((r) => r.data),
  remove: (itemId: string) => apiClient.delete(`/checklist-items/${itemId}`),
};
