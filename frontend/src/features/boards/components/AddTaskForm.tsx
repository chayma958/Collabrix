import { useState, type FormEvent } from 'react';
import { useCreateTask } from '@/features/tasks/hooks/useCreateTask';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AddTaskForm({
  boardId,
  columnId,
  canEdit = true,
}: {
  boardId: string;
  columnId: string;
  canEdit?: boolean;
}) {
  const createTask = useCreateTask(boardId);
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({ columnId, title });
    setTitle('');
    setOpen(false);
  }

  if (!canEdit) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="m-2 rounded-md p-2 text-left text-sm text-muted transition-colors hover:bg-primary/5 hover:text-primary"
      >
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="m-2 space-y-2">
      <Input
        autoFocus
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={createTask.isPending}>
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
