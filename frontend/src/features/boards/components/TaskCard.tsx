import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskPriority } from '@/types/board';
import { PriorityBadge, LabelBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

const PRIORITY_BORDER_CLASSES: Record<TaskPriority, string> = {
  LOW: 'border-l-priority-low',
  MEDIUM: 'border-l-priority-medium',
  HIGH: 'border-l-priority-high',
  URGENT: 'border-l-priority-urgent',
};

export function TaskCard({
  task,
  onOpen,
  isDimmed = false,
  canEdit = true,
}: {
  task: Task;
  onOpen: () => void;
  isDimmed?: boolean;
  canEdit?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'cursor-pointer rounded-lg border border-l-4 border-border bg-bg p-3 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-primary/40 hover:shadow-md',
        PRIORITY_BORDER_CLASSES[task.priority],
        isDimmed && 'opacity-30',
        isDragging && 'shadow-lg',
      )}
    >
      <p className="mb-2 text-sm font-medium text-text">{task.title}</p>
      <div className="mb-2 flex flex-wrap gap-1">
        <PriorityBadge priority={task.priority} />
        {task.labels.map((taskLabel) => (
          <LabelBadge
            key={taskLabel.labelId}
            name={taskLabel.label.name}
            color={taskLabel.label.color}
          />
        ))}
      </div>
      {task.assignees.length > 0 && (
        <div className="flex -space-x-1">
          {task.assignees.map((assignee) => (
            <Avatar key={assignee.userId} user={assignee.user} size={20} />
          ))}
        </div>
      )}
    </div>
  );
}
