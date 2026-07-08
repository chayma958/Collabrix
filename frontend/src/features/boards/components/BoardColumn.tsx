import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column } from '@/types/board';
import { useUpdateColumn, useDeleteColumn } from '@/features/boards/hooks/useCreateColumn';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';
import { Input } from '@/components/ui/Input';

interface BoardColumnProps {
  column: Column;
  boardId: string;
  onOpenTask: (taskId: string) => void;
  dimmedTaskIds?: Set<string>;
  canEdit?: boolean;
  canManage?: boolean;
}

export function BoardColumn({
  column,
  boardId,
  onOpenTask,
  dimmedTaskIds,
  canEdit = false,
  canManage = false,
}: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((task) => task.id);
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const [name, setName] = useState(column.name);

  useEffect(() => {
    setName(column.name);
  }, [column.name]);

  function handleSaveName() {
    if (name.trim() && name !== column.name) {
      updateColumn.mutate({ columnId: column.id, name });
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        {canEdit ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            className="h-7 text-sm font-semibold"
          />
        ) : (
          <h3 className="text-sm font-semibold tracking-tight text-text">{column.name}</h3>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-border/50 px-1.5 py-0.5 text-xs font-medium text-muted">
            {column.tasks.length}
          </span>
          {canManage && (
            <button
              type="button"
              onClick={() => deleteColumn.mutate(column.id)}
              disabled={deleteColumn.isPending}
              className="text-xs text-muted transition-colors hover:text-priority-urgent"
              aria-label={`Delete column ${column.name}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div ref={setNodeRef} className="min-h-10 flex-1 space-y-2 px-2 pb-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={() => onOpenTask(task.id)}
              isDimmed={dimmedTaskIds?.has(task.id)}
              canEdit={canEdit}
            />
          ))}
        </SortableContext>
      </div>
      <AddTaskForm boardId={boardId} columnId={column.id} canEdit={canEdit} />
    </div>
  );
}
