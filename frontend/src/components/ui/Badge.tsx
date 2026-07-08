import type { ReactNode } from 'react';
import type { TaskPriority } from '@/types/board';

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  LOW: 'bg-priority-low/10 text-priority-low ring-1 ring-inset ring-priority-low/25',
  MEDIUM: 'bg-priority-medium/10 text-priority-medium ring-1 ring-inset ring-priority-medium/25',
  HIGH: 'bg-priority-high/10 text-priority-high ring-1 ring-inset ring-priority-high/25',
  URGENT: 'bg-priority-urgent/10 text-priority-urgent ring-1 ring-inset ring-priority-urgent/25',
};

const PRIORITY_DOT_CLASSES: Record<TaskPriority, string> = {
  LOW: 'bg-priority-low',
  MEDIUM: 'bg-priority-medium',
  HIGH: 'bg-priority-high',
  URGENT: 'bg-priority-urgent',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[priority]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT_CLASSES[priority]}`} />
      {priority}
    </span>
  );
}

export function LabelBadge({
  name,
  color,
  children,
}: {
  name: string;
  color: string;
  children?: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {name}
      {children}
    </span>
  );
}
