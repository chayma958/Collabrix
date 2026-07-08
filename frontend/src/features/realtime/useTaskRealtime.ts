import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import type { DomainEvent } from '@/types/activity';

export function useTaskRealtime(taskId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!taskId) return;
    const socket = getSocket();
    if (!socket) return;

    function handleActivity(event: DomainEvent) {
      if (event.entityType === 'COMMENT' && event.metadata?.taskId === taskId) {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      }
      if (event.action.startsWith('checklist_item_') && event.entityId === taskId) {
        queryClient.invalidateQueries({ queryKey: ['checklist-items', taskId] });
      }
      if (event.action.startsWith('attachment_') && event.entityId === taskId) {
        queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      }
    }

    socket.on('activity', handleActivity);
    return () => {
      socket.off('activity', handleActivity);
    };
  }, [taskId, queryClient]);
}
