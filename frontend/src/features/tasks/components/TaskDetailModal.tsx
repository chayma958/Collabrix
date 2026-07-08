import { useEffect, useState, type FormEvent } from 'react';
import { useBoard } from '@/features/boards/hooks/useBoard';
import {
  useUpdateTask,
  useAssignTask,
  useSetTaskLabels,
  useDeleteTask,
} from '@/features/tasks/hooks/useUpdateTask';
import { useWorkspaceMembers } from '@/features/workspaces/hooks/useMembers';
import { useMyWorkspaceRole } from '@/features/workspaces/hooks/useMyWorkspaceRole';
import { useAuth } from '@/features/auth/AuthContext';
import { useLabels, useCreateLabel } from '@/features/labels/hooks/useLabels';
import { ChecklistSection } from '@/features/checklist/components/ChecklistSection';
import { CommentsSection } from '@/features/comments/components/CommentsSection';
import { AttachmentsSection } from '@/features/attachments/components/AttachmentsSection';
import { useTaskRealtime } from '@/features/realtime/useTaskRealtime';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select, Option } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { getFullName } from '@/lib/user';
import { hasMinRole } from '@/lib/roles';
import type { TaskPriority } from '@/types/board';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TaskDetailModal({
  boardId,
  taskId,
  onClose,
}: {
  boardId: string;
  taskId: string;
  onClose: () => void;
}) {
  const { data: board } = useBoard(boardId);
  const task = board?.columns.flatMap((column) => column.tasks).find((t) => t.id === taskId);

  useTaskRealtime(taskId);

  const { user } = useAuth();
  const updateTask = useUpdateTask(boardId, taskId);
  const assignTask = useAssignTask(boardId, taskId);
  const setTaskLabels = useSetTaskLabels(boardId, taskId);
  const deleteTask = useDeleteTask(boardId);

  const workspaceId = board?.workspaceId ?? '';
  const { data: members } = useWorkspaceMembers(workspaceId);
  const myRole = useMyWorkspaceRole(workspaceId);
  const { data: labels } = useLabels(workspaceId);
  const createLabel = useCreateLabel(workspaceId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [newLabelName, setNewLabelName] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    }
  }, [task]);

  if (!task) return null;

  const isAdmin = !!myRole && hasMinRole(myRole, 'ADMIN');
  const canDelete = task.createdById === user?.id || isAdmin;
  const canEdit = !!myRole && hasMinRole(myRole, 'MEMBER');
  const canManageLabels = isAdmin;

  const assigneeIds = new Set(task.assignees.map((a) => a.userId));
  const labelIds = new Set(task.labels.map((l) => l.labelId));

  function handleSaveDetails() {
    if (!canEdit) return;
    updateTask.mutate({
      title,
      description,
      priority,
      ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
    });
  }

  function toggleAssignee(userId: string) {
    const next = new Set(assigneeIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    assignTask.mutate(Array.from(next));
  }

  function toggleLabel(labelId: string) {
    const next = new Set(labelIds);
    if (next.has(labelId)) next.delete(labelId);
    else next.add(labelId);
    setTaskLabels.mutate(Array.from(next));
  }

  async function handleDelete() {
    await deleteTask.mutateAsync(taskId);
    onClose();
  }

  async function handleCreateLabel(event: FormEvent) {
    event.preventDefault();
    if (!newLabelName.trim()) return;
    const color = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
    await createLabel.mutateAsync({ name: newLabelName, color });
    setNewLabelName('');
  }

  return (
    <Modal title="Task details" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveDetails}
            readOnly={!canEdit}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Description
          </label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSaveDetails}
            readOnly={!canEdit}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Priority
            </label>
            <Select
              value={priority}
              onChange={(value) => {
                const nextPriority = value as TaskPriority;
                setPriority(nextPriority);
                updateTask.mutate({ priority: nextPriority });
              }}
              disabled={!canEdit}
            >
              {PRIORITIES.map((p) => (
                <Option key={p} value={p}>
                  {p}
                </Option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Due date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleSaveDetails}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Assignees
          </label>
          <div className="flex flex-wrap gap-2">
            {members?.map((member) => (
              <button
                key={member.userId}
                type="button"
                onClick={() => toggleAssignee(member.userId)}
                disabled={!canEdit}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                  assigneeIds.has(member.userId)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted'
                }`}
              >
                <Avatar user={member.user} size={16} />
                {getFullName(member.user)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {labels?.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                disabled={!canEdit}
                className="rounded-full px-2 py-1 text-xs font-medium text-white disabled:cursor-not-allowed"
                style={{ backgroundColor: label.color, opacity: labelIds.has(label.id) ? 1 : 0.35 }}
              >
                {label.name}
              </button>
            ))}
          </div>
          {canManageLabels && (
            <form onSubmit={handleCreateLabel} className="mt-2 flex gap-2">
              <Input
                placeholder="New label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              <Button type="submit" variant="secondary" disabled={createLabel.isPending}>
                Add label
              </Button>
            </form>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <ChecklistSection taskId={taskId} canEdit={canEdit} />
        </div>

        <div className="border-t border-border pt-4">
          <AttachmentsSection taskId={taskId} canEdit={canEdit} isAdmin={isAdmin} />
        </div>

        <div className="border-t border-border pt-4">
          <CommentsSection taskId={taskId} canEdit={canEdit} />
        </div>

        {canDelete && (
          <div className="flex justify-end border-t border-border pt-4">
            <Button variant="danger" onClick={handleDelete} disabled={deleteTask.isPending}>
              Delete task
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
