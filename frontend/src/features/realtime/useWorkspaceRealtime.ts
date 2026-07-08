import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import type { DomainEvent } from '@/types/activity';

export function useWorkspaceRealtime(workspaceId: string, boardId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workspaceId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join-workspace', workspaceId);

    function handleActivity(event: DomainEvent) {
      if (event.workspaceId !== workspaceId) return;
      queryClient.invalidateQueries({ queryKey: ['activity', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['analytics', workspaceId] });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      }
    }

    socket.on('activity', handleActivity);

    return () => {
      socket.off('activity', handleActivity);
      socket.emit('leave-workspace', workspaceId);
    };
  }, [workspaceId, boardId, queryClient]);
}
