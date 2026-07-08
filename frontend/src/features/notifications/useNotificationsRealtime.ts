import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { getSocket } from '@/lib/socket';

export function useNotificationsRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    function handleNotification() {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user, queryClient]);
}
