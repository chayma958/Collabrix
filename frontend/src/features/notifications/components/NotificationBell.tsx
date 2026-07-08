import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/features/notifications/hooks/useNotifications';
import { useNotificationsRealtime } from '@/features/notifications/useNotificationsRealtime';
import { describeNotification } from '@/features/notifications/describeNotification';
import { BellIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import type { AppNotification } from '@/types/notification';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  useNotificationsRealtime();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = data?.pages.flat() ?? [];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleClick(n: AppNotification) {
    if (!n.readAt) markRead.mutate(n.id);
    const workspaceId = n.payload.workspaceId as string | undefined;
    const boardId = n.payload.boardId as string | undefined;
    setOpen(false);
    if (boardId && workspaceId) {
      navigate(`/workspaces/${workspaceId}/boards/${boardId}`);
    } else if (workspaceId) {
      navigate(`/workspaces/${workspaceId}`);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted hover:bg-surface hover:text-text"
        aria-label="Notifications"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-priority-urgent px-1 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-md border border-border bg-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium text-text">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted">No notifications yet</li>
            )}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface ${
                    n.readAt ? 'text-muted' : 'text-text'
                  }`}
                >
                  <p>{describeNotification(n)}</p>
                  <span className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                </button>
              </li>
            ))}
            {hasNextPage && (
              <li className="p-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full"
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
