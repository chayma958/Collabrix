import type { User } from './user';

export type ActivityEntityType = 'WORKSPACE' | 'BOARD' | 'COLUMN' | 'TASK' | 'COMMENT';

export interface ActivityLogEntry {
  id: string;
  workspaceId: string;
  entityType: ActivityEntityType;
  entityId: string;
  actorId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
}
export interface DomainEvent {
  workspaceId: string;
  actorId: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}
