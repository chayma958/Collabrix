import { apiClient } from '@/lib/api-client';
import type { Comment } from '@/types/comment';

export const commentsApi = {
  list: (taskId: string) =>
    apiClient.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data),
  create: (taskId: string, body: string) =>
    apiClient.post<Comment>(`/tasks/${taskId}/comments`, { body }).then((r) => r.data),
  remove: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
};
