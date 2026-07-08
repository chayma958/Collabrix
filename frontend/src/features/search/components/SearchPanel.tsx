import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchTasks } from '@/features/search/hooks/useSearchTasks';
import { useWorkspaceMembers } from '@/features/workspaces/hooks/useMembers';
import { useLabels } from '@/features/labels/hooks/useLabels';
import { Input } from '@/components/ui/Input';
import { Select, Option } from '@/components/ui/Select';
import { PriorityBadge } from '@/components/ui/Badge';
import { getFullName } from '@/lib/user';
import type { TaskPriority } from '@/types/board';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function SearchPanel({ workspaceId }: { workspaceId: string }) {
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelId, setLabelId] = useState('');

  const { data: members } = useWorkspaceMembers(workspaceId);
  const { data: labels } = useLabels(workspaceId);

  const hasFilter = !!q || !!priority || !!assigneeId || !!labelId;
  const { data: results, isFetching } = useSearchTasks(
    workspaceId,
    {
      q: q || undefined,
      priority: priority || undefined,
      assigneeId: assigneeId || undefined,
      labelId: labelId || undefined,
    },
    hasFilter,
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          placeholder="Search tasks…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs flex-1"
        />
        <Select
          value={priority}
          onChange={(value) => setPriority(value as TaskPriority | '')}
          className="w-36"
        >
          <Option value="">Any priority</Option>
          {PRIORITIES.map((p) => (
            <Option key={p} value={p}>
              {p}
            </Option>
          ))}
        </Select>
        <Select value={assigneeId} onChange={(value) => setAssigneeId(value)} className="w-40">
          <Option value="">Any assignee</Option>
          {members?.map((m) => (
            <Option key={m.userId} value={m.userId}>
              {getFullName(m.user)}
            </Option>
          ))}
        </Select>
        <Select value={labelId} onChange={(value) => setLabelId(value)} className="w-36">
          <Option value="">Any label</Option>
          {labels?.map((l) => (
            <Option key={l.id} value={l.id}>
              {l.name}
            </Option>
          ))}
        </Select>
      </div>

      {!hasFilter && (
        <p className="text-sm text-muted">
          Type a search term or pick a filter to find tasks across all boards.
        </p>
      )}
      {hasFilter && isFetching && <p className="text-sm text-muted">Searching…</p>}
      {hasFilter && !isFetching && results?.length === 0 && (
        <p className="text-sm text-muted">No matching tasks.</p>
      )}
      <ul className="space-y-2">
        {results?.map((task) => (
          <li key={task.id}>
            <Link
              to={`/workspaces/${workspaceId}/boards/${task.column.board.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 hover:border-primary"
            >
              <span className="text-sm text-text">{task.title}</span>
              <span className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                <span className="text-xs text-muted">
                  {task.column.board.name} / {task.column.name}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
