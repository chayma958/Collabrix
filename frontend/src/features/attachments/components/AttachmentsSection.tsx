import { useRef, useState } from 'react';
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/features/attachments/hooks/useAttachments';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsSection({
  taskId,
  canEdit = true,
  isAdmin = false,
}: {
  taskId: string;
  canEdit?: boolean;
  isAdmin?: boolean;
}) {
  const { user } = useAuth();
  const { data: attachments } = useAttachments(taskId);
  const uploadAttachment = useUploadAttachment(taskId);
  const deleteAttachment = useDeleteAttachment(taskId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    try {
      await uploadAttachment.mutateAsync(file);
    } catch {
      setError('Upload failed. Check the file type and size (max 10MB).');
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-muted">
        Attachments{attachments && attachments.length > 0 ? ` (${attachments.length})` : ''}
      </label>
      <ul className="space-y-2">
        {attachments?.map((attachment) => {
          const canRemove = canEdit && (attachment.uploadedById === user?.id || isAdmin);
          return (
            <li
              key={attachment.id}
              className="flex items-center gap-3 rounded-md border border-border p-2"
            >
              {attachment.mimeType.startsWith('image/') ? (
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  <img
                    src={attachment.url}
                    alt={attachment.originalName}
                    className="h-12 w-12 rounded object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-surface text-lg">
                  📄
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm text-text hover:underline"
                >
                  {attachment.originalName}
                </a>
                <span className="text-xs text-muted">{formatBytes(attachment.bytes)}</span>
              </div>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => deleteAttachment.mutate(attachment.id)}
                  className="text-xs text-muted hover:text-priority-urgent"
                  aria-label="Remove attachment"
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {canEdit && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAttachment.isPending}
          >
            {uploadAttachment.isPending ? 'Uploading…' : 'Add attachment'}
          </Button>
          {error && <p className="mt-1 text-xs text-priority-urgent">{error}</p>}
        </div>
      )}
    </div>
  );
}
