import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useBoard } from '@/features/boards/hooks/useBoard';
import { useUpdateBoard, useDeleteBoard } from '@/features/boards/hooks/useBoards';
import { useMoveTask } from '@/features/tasks/hooks/useMoveTask';
import { useWorkspaceRealtime } from '@/features/realtime/useWorkspaceRealtime';
import { useWorkspaceMembers } from '@/features/workspaces/hooks/useMembers';
import { useMyWorkspaceRole } from '@/features/workspaces/hooks/useMyWorkspaceRole';
import { useLabels } from '@/features/labels/hooks/useLabels';
import { BoardColumn } from './BoardColumn';
import { AddColumnForm } from './AddColumnForm';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { Input } from '@/components/ui/Input';
import { Select, Option } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getFullName } from '@/lib/user';
import { hasMinRole } from '@/lib/roles';
import type { TaskPriority } from '@/types/board';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function BoardPage() {
  const { boardId = '' } = useParams();
  const navigate = useNavigate();
  const { data: board, isLoading } = useBoard(boardId);
  const moveTask = useMoveTask(boardId);
  const updateBoard = useUpdateBoard(boardId);
  const deleteBoard = useDeleteBoard(board?.workspaceId ?? '');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterAssigneeId, setFilterAssigneeId] = useState('');
  const [filterLabelId, setFilterLabelId] = useState('');
  const [boardName, setBoardName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useWorkspaceRealtime(board?.workspaceId ?? '', boardId);
  const { data: members } = useWorkspaceMembers(board?.workspaceId ?? '');
  const myRole = useMyWorkspaceRole(board?.workspaceId ?? '');
  const { data: labels } = useLabels(board?.workspaceId ?? '');

  useEffect(() => {
    if (board) setBoardName(board.name);
  }, [board]);

  if (isLoading || !board) {
    return <p className="p-8 text-muted">Loading board…</p>;
  }

  const canManageBoard = !!myRole && hasMinRole(myRole, 'ADMIN');
  const canEdit = !!myRole && hasMinRole(myRole, 'MEMBER');

  const hasActiveFilter = !!filterPriority || !!filterAssigneeId || !!filterLabelId;
  const dimmedTaskIds = new Set<string>();
  if (hasActiveFilter) {
    for (const column of board.columns) {
      for (const task of column.tasks) {
        const matchesPriority = !filterPriority || task.priority === filterPriority;
        const matchesAssignee =
          !filterAssigneeId || task.assignees.some((a) => a.userId === filterAssigneeId);
        const matchesLabel = !filterLabelId || task.labels.some((l) => l.labelId === filterLabelId);
        if (!(matchesPriority && matchesAssignee && matchesLabel)) {
          dimmedTaskIds.add(task.id);
        }
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !board) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = board.columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
    if (!sourceColumn) return;

    let targetColumnId: string;
    let targetIndex: number;

    const overColumn = board.columns.find((column) => column.id === overId);
    if (overColumn) {
      targetColumnId = overColumn.id;
      targetIndex = overColumn.tasks.length;
    } else {
      const overTaskColumn = board.columns.find((column) =>
        column.tasks.some((task) => task.id === overId),
      );
      if (!overTaskColumn) return;
      targetColumnId = overTaskColumn.id;
      targetIndex = overTaskColumn.tasks.findIndex((task) => task.id === overId);
    }

    if (targetColumnId === sourceColumn.id) {
      const currentIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
      if (currentIndex === targetIndex) return;
    }

    moveTask.mutate({ taskId, targetColumnId, targetIndex });
  }

  function handleSaveBoardName() {
    if (boardName.trim() && boardName !== board?.name) {
      updateBoard.mutate({ name: boardName });
    }
  }

  async function handleDeleteBoard() {
    if (!board) return;
    await deleteBoard.mutateAsync(boardId);
    navigate(`/workspaces/${board.workspaceId}`);
  }

  return (
    <div className="p-6">
      <Link
        to={`/workspaces/${board.workspaceId}`}
        className="text-sm text-muted hover:underline"
      >
        ← Back to workspace
      </Link>
      <div className="mb-4 mt-2 flex items-center justify-between gap-4">
        {canManageBoard ? (
          <Input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={handleSaveBoardName}
            className="max-w-sm text-xl font-semibold"
          />
        ) : (
          <h1 className="text-xl font-semibold text-text">{board.name}</h1>
        )}
        {canManageBoard && (
          <Button variant="danger" onClick={handleDeleteBoard} disabled={deleteBoard.isPending}>
            Delete board
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={filterPriority}
          onChange={(value) => setFilterPriority(value as TaskPriority | '')}
          className="w-36"
        >
          <Option value="">Any priority</Option>
          {PRIORITIES.map((p) => (
            <Option key={p} value={p}>
              {p}
            </Option>
          ))}
        </Select>
        <Select
          value={filterAssigneeId}
          onChange={(value) => setFilterAssigneeId(value)}
          className="w-40"
        >
          <Option value="">Any assignee</Option>
          {members?.map((m) => (
            <Option key={m.userId} value={m.userId}>
              {getFullName(m.user)}
            </Option>
          ))}
        </Select>
        <Select
          value={filterLabelId}
          onChange={(value) => setFilterLabelId(value)}
          className="w-36"
        >
          <Option value="">Any label</Option>
          {labels?.map((l) => (
            <Option key={l.id} value={l.id}>
              {l.name}
            </Option>
          ))}
        </Select>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterPriority('');
              setFilterAssigneeId('');
              setFilterLabelId('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              boardId={boardId}
              onOpenTask={setActiveTaskId}
              dimmedTaskIds={dimmedTaskIds}
              canEdit={canEdit}
              canManage={canManageBoard}
            />
          ))}
          {canManageBoard && <AddColumnForm boardId={boardId} />}
        </div>
      </DndContext>

      {activeTaskId && (
        <TaskDetailModal
          boardId={boardId}
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
        />
      )}
    </div>
  );
}
