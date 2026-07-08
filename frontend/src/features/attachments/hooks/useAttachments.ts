import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/features/attachments/api';

export function useAttachments(taskId: string) {
  return useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => attachmentsApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useUploadAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsApi.upload(taskId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', taskId] }),
  });
}

export function useDeleteAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', taskId] }),
  });
}
