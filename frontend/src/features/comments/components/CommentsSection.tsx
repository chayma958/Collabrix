import { useState, type FormEvent } from 'react';
import { useComments, useCreateComment, useDeleteComment } from '@/features/comments/hooks/useComments';
import { useAuth } from '@/features/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getFullName } from '@/lib/user';

export function CommentsSection({
  taskId,
  canEdit = true,
}: {
  taskId: string;
  canEdit?: boolean;
}) {
  const { user } = useAuth();
  const { data: comments } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [body, setBody] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    await createComment.mutateAsync(body);
    setBody('');
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted">Comments</label>
      <ul className="space-y-3">
        {comments?.map((comment) => (
          <li key={comment.id} className="flex gap-2">
            <Avatar user={comment.author} size={24} />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-text">
                  {getFullName(comment.author)}
                </span>
                <span className="text-xs text-muted">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-text">{comment.body}</p>
            </div>
            {canEdit && comment.authorId === user?.id && (
              <button
                type="button"
                onClick={() => deleteComment.mutate(comment.id)}
                className="text-xs text-muted hover:text-priority-urgent"
                aria-label="Delete comment"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            rows={2}
            placeholder="Write a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" variant="secondary" disabled={createComment.isPending}>
            Post
          </Button>
        </form>
      )}
    </div>
  );
}
