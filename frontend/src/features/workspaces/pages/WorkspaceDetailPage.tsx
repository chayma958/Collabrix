import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useWorkspace, useDeleteWorkspace } from '@/features/workspaces/hooks/useWorkspaces';
import { useWorkspaceMembers, useInviteMember, useRemoveMember } from '@/features/workspaces/hooks/useMembers';
import { useMyWorkspaceRole } from '@/features/workspaces/hooks/useMyWorkspaceRole';
import { useBoards, useCreateBoard } from '@/features/boards/hooks/useBoards';
import { ActivityFeed } from '@/features/activity/components/ActivityFeed';
import { SearchPanel } from '@/features/search/components/SearchPanel';
import { useWorkspaceRealtime } from '@/features/realtime/useWorkspaceRealtime';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, Option } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { getErrorMessage } from '@/lib/error';
import { getFullName } from '@/lib/user';
import { hasMinRole } from '@/lib/roles';
import type { WorkspaceRole } from '@/types/workspace';

const PREVIEW_COUNT = 5;

const ROLE_BADGE_CLASSES: Record<WorkspaceRole, string> = {
  OWNER: 'bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/25 dark:text-violet-400',
  ADMIN: 'bg-sky-500/10 text-sky-600 ring-1 ring-inset ring-sky-500/25 dark:text-sky-400',
  MEMBER: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/25',
  VIEWER: 'bg-border/60 text-muted ring-1 ring-inset ring-border',
};

export function WorkspaceDetailPage() {
  const { workspaceId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: boards, isLoading: boardsLoading } = useBoards(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const createBoard = useCreateBoard(workspaceId);
  const inviteMember = useInviteMember(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();

  useWorkspaceRealtime(workspaceId);

  const myRole = useMyWorkspaceRole(workspaceId);
  const canManageBoards = !!myRole && hasMinRole(myRole, 'ADMIN');
  const canManageMembers = !!myRole && hasMinRole(myRole, 'ADMIN');
  const isOwner = myRole === 'OWNER';

  const [boardName, setBoardName] = useState('');
  const [boardError, setBoardError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('VIEWER');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [showAllBoards, setShowAllBoards] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  async function handleCreateBoard(event: FormEvent) {
    event.preventDefault();
    setBoardError(null);
    try {
      await createBoard.mutateAsync({ name: boardName });
      setBoardName('');
    } catch (err) {
      setBoardError(getErrorMessage(err, 'Could not create board'));
    }
  }

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteSuccess(`${inviteEmail} added to the workspace`);
      setInviteEmail('');
    } catch (err) {
      setInviteError(getErrorMessage(err, 'Could not invite that email'));
    }
  }

  async function handleRemoveMember(memberId: string) {
    setRemoveError(null);
    try {
      await removeMember.mutateAsync(memberId);
    } catch (err) {
      setRemoveError(getErrorMessage(err, 'Could not remove that member'));
    }
  }

  async function handleDeleteWorkspace() {
    await deleteWorkspace.mutateAsync(workspaceId);
    navigate('/workspaces');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/workspaces" className="text-sm text-muted hover:underline">
        ← All workspaces
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-base font-semibold text-primary">
            {workspace?.name?.slice(0, 1).toUpperCase()}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{workspace?.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/workspaces/${workspaceId}/calendar`}
            className="text-sm text-primary hover:underline"
          >
            Calendar
          </Link>
          <Link
            to={`/workspaces/${workspaceId}/analytics`}
            className="text-sm text-primary hover:underline"
          >
            Analytics
          </Link>
          {isOwner && (
            <Button
              variant="danger"
              onClick={handleDeleteWorkspace}
              disabled={deleteWorkspace.isPending}
            >
              Delete workspace
            </Button>
          )}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium text-text">Search tasks</h2>
        <SearchPanel workspaceId={workspaceId} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium text-text">Boards</h2>
        {canManageBoards && (
          <form onSubmit={handleCreateBoard} className="mb-4 flex gap-2">
            <Input
              placeholder="New board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              required
            />
            <Button type="submit" disabled={createBoard.isPending}>
              Create board
            </Button>
          </form>
        )}
        {boardError && <p className="mb-4 text-sm text-priority-urgent">{boardError}</p>}

        {boardsLoading && <p className="text-muted">Loading…</p>}
        {!boardsLoading && boards?.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-8 text-center">
            <span className="text-2xl">📋</span>
            <p className="mt-2 text-muted">No boards yet — create your first one above.</p>
          </div>
        )}
        <ul className="space-y-2">
          {(showAllBoards ? boards : boards?.slice(0, PREVIEW_COUNT))?.map((board) => (
            <li key={board.id}>
              <Link
                to={`/workspaces/${workspaceId}/boards/${board.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary">
                  {board.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-text group-hover:text-primary">{board.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {boards && boards.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllBoards((v) => !v)}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {showAllBoards ? 'Show less' : `View all (${boards.length})`}
          </button>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-text">Members</h2>
        <ul className="mb-2 space-y-2">
          {(showAllMembers ? members : members?.slice(0, PREVIEW_COUNT))?.map((member) => {
            const canRemove =
              canManageMembers &&
              member.userId !== user?.id &&
              (member.role !== 'OWNER' || myRole === 'OWNER');
            return (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 shadow-sm"
              >
                <Avatar user={member.user} />
                <span className="text-sm text-text">{getFullName(member.user)}</span>
                <span className="text-xs text-muted">{member.user.email}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[member.role]}`}
                >
                  {member.role}
                </span>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removeMember.isPending}
                    className="text-xs text-muted hover:text-priority-urgent"
                    aria-label={`Remove ${getFullName(member.user)}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {members && members.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllMembers((v) => !v)}
            className="mb-4 text-sm text-primary hover:underline"
          >
            {showAllMembers ? 'Show less' : `View all (${members.length})`}
          </button>
        )}
        {removeError && <p className="mb-4 text-sm text-priority-urgent">{removeError}</p>}

        {canManageMembers && (
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              placeholder="Invite by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Select
              value={inviteRole}
              onChange={(value) => setInviteRole(value as WorkspaceRole)}
              className="w-32"
            >
              <Option value="VIEWER">Viewer</Option>
              <Option value="MEMBER">Member</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>
            <Button type="submit" disabled={inviteMember.isPending}>
              Invite
            </Button>
          </form>
        )}
        {inviteError && <p className="mt-2 text-sm text-priority-urgent">{inviteError}</p>}
        {inviteSuccess && <p className="mt-2 text-sm text-priority-low">{inviteSuccess}</p>}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-medium text-text">Activity</h2>
        <ActivityFeed workspaceId={workspaceId} />
      </section>
    </div>
  );
}
