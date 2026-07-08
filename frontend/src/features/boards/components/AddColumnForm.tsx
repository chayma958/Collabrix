import { useState, type FormEvent } from 'react';
import { useCreateColumn } from '@/features/boards/hooks/useCreateColumn';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AddColumnForm({ boardId }: { boardId: string }) {
  const createColumn = useCreateColumn(boardId);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await createColumn.mutateAsync(name);
    setName('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-fit w-72 shrink-0 rounded-xl border border-dashed border-border p-3 text-left text-sm text-muted transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        + Add column
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-72 shrink-0 space-y-2 rounded-xl border border-border bg-surface p-3 shadow-sm"
    >
      <Input
        autoFocus
        placeholder="Column name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={createColumn.isPending}>
          Add
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
