export type NotificationType =
  'task_assigned' | 'task_commented' | 'workspace_invited' | 'due_date_approaching';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
