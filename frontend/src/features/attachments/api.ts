import { apiClient } from '@/lib/api-client';
import type { Attachment } from '@/types/attachment';

export const attachmentsApi = {
  list: (taskId: string) =>
    apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`).then((r) => r.data),
  upload: (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<Attachment>(`/tasks/${taskId}/attachments`, formData)
      .then((r) => r.data);
  },
  remove: (id: string) => apiClient.delete(`/attachments/${id}`),
};
