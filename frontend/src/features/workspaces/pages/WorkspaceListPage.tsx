import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useCreateWorkspace } from '@/features/workspaces/hooks/useCreateWorkspace';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/error';

export function WorkspaceListPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createWorkspace.mutateAsync({ name });
      setName('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create workspace'));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-text">Your workspaces</h1>

      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <Input
          placeholder="New workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={createWorkspace.isPending}>
          Create
        </Button>
      </form>
      {error && <p className="mb-4 text-sm text-priority-urgent">{error}</p>}

      {isLoading && <p className="text-muted">Loading…</p>}
      {!isLoading && workspaces?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-10 text-center">
          <span className="text-3xl">🗂️</span>
          <p className="mt-2 text-muted">No workspaces yet — create your first one above.</p>
        </div>
      )}

      <ul className="space-y-2">
        {workspaces?.map((workspace) => (
          <li key={workspace.id}>
            <Link
              to={`/workspaces/${workspace.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                {workspace.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <span className="block truncate font-medium text-text group-hover:text-primary">
                  {workspace.name}
                </span>
                {workspace.description && (
                  <p className="truncate text-sm text-muted">{workspace.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
