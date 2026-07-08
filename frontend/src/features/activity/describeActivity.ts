import type { ActivityLogEntry } from '@/types/activity';
import { getFullName } from '@/lib/user';

export function describeActivity(entry: ActivityLogEntry): string {
  const actor = getFullName(entry.actor);
  const meta = entry.metadata ?? {};

  switch (entry.action) {
    case 'created':
      switch (entry.entityType) {
        case 'WORKSPACE':
          return `${actor} created the workspace`;
        case 'BOARD':
          return `${actor} created board "${meta.name}"`;
        case 'COLUMN':
          return `${actor} created column "${meta.name}"`;
        case 'TASK':
          return `${actor} created task "${meta.title}"`;
        default:
          return `${actor} created something`;
      }
    case 'updated':
      return entry.entityType === 'TASK'
        ? `${actor} updated task "${meta.title}"`
        : `${actor} updated the ${entry.entityType.toLowerCase()}`;
    case 'moved':
      return `${actor} moved "${meta.title}" to ${meta.toColumn}`;
    case 'deleted':
      return `${actor} deleted "${meta.title ?? meta.name ?? ''}"`;
    case 'assigned':
      return `${actor} updated assignees on a task`;
    case 'labeled':
      return `${actor} updated labels on a task`;
    case 'commented':
      return `${actor} commented on a task`;
    case 'comment_deleted':
      return `${actor} deleted a comment`;
    case 'checklist_item_added':
      return `${actor} added checklist item "${meta.label}"`;
    case 'checklist_item_checked':
      return `${actor} checked off "${meta.label}"`;
    case 'checklist_item_unchecked':
      return `${actor} unchecked "${meta.label}"`;
    case 'checklist_item_removed':
      return `${actor} removed checklist item "${meta.label}"`;
    case 'member_invited':
      return `${actor} invited ${meta.invitedName} to the workspace`;
    case 'member_role_changed':
      return `${actor} changed a member's role to ${meta.to}`;
    case 'member_removed':
      return `${actor} removed a member from the workspace`;
    default:
      return `${actor} performed ${entry.action}`;
  }
}
