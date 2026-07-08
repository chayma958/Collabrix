import { useActivity } from '@/features/activity/hooks/useActivity';
import { describeActivity } from '@/features/activity/describeActivity';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ workspaceId }: { workspaceId: string }) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivity(workspaceId);

  const entries = data?.pages.flat() ?? [];

  if (isLoading) {
    return <p className="text-muted">Loading activity…</p>;
  }

  if (entries.length === 0) {
    return <p className="text-muted">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-2 text-sm">
            <Avatar user={entry.actor} size={20} />
            <span className="text-text">{describeActivity(entry)}</span>
            <span className="ml-auto shrink-0 text-xs text-muted">{timeAgo(entry.createdAt)}</span>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
