import { useState, type FormEvent } from 'react';
import {
  useChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from '@/features/checklist/hooks/useChecklistItems';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ChecklistSection({
  taskId,
  canEdit = true,
}: {
  taskId: string;
  canEdit?: boolean;
}) {
  const { data: items } = useChecklistItems(taskId);
  const createItem = useCreateChecklistItem(taskId);
  const updateItem = useUpdateChecklistItem(taskId);
  const deleteItem = useDeleteChecklistItem(taskId);
  const [label, setLabel] = useState('');

  const done = items?.filter((i) => i.isDone).length ?? 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!label.trim()) return;
    await createItem.mutateAsync(label);
    setLabel('');
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted">
        Checklist{items && items.length > 0 ? ` (${done}/${items.length})` : ''}
      </label>
      <ul className="space-y-1">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.isDone}
              onChange={(e) =>
                updateItem.mutate({ itemId: item.id, data: { isDone: e.target.checked } })
              }
              disabled={!canEdit}
              className="h-4 w-4 disabled:cursor-not-allowed"
            />
            <span
              className={`flex-1 text-sm ${item.isDone ? 'text-muted line-through' : 'text-text'}`}
            >
              {item.label}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() => deleteItem.mutate(item.id)}
                className="text-xs text-muted hover:text-priority-urgent"
                aria-label="Remove item"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Add checklist item"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={createItem.isPending}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
