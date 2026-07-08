export type ActivityEntityType =
  'WORKSPACE' | 'BOARD' | 'COLUMN' | 'TASK' | 'COMMENT';

export interface DomainEvent {
  workspaceId: string;
  actorId: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export const ACTIVITY_EVENT = 'activity';

export interface NotificationCreatedEvent {
  userId: string;
  notification: {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    readAt: string | null;
    createdAt: string;
  };
}

export const NOTIFICATION_EVENT = 'notification.created';
