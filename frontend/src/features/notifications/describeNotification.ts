import type { AppNotification } from '@/types/notification';

export function describeNotification(n: AppNotification): string {
  const p = n.payload;
  switch (n.type) {
    case 'task_assigned':
      return `${p.actorName} assigned you to "${p.taskTitle}"`;
    case 'task_commented':
      return `${p.actorName} commented on "${p.taskTitle}"`;
    case 'workspace_invited':
      return `${p.actorName} invited you to "${p.workspaceName}"`;
    case 'due_date_approaching':
      return `"${p.taskTitle}" is due soon`;
    default:
      return 'New notification';
  }
}
