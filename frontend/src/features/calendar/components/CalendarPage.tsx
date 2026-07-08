import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useCalendarTasks, useRescheduleTask } from '@/features/calendar/hooks/useCalendarTasks';
import { useWorkspaceRealtime } from '@/features/realtime/useWorkspaceRealtime';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { CalendarTask } from '@/features/calendar/api';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_BORDER_CLASSES: Record<CalendarTask['priority'], string> = {
  LOW: 'border-l-priority-low',
  MEDIUM: 'border-l-priority-medium',
  HIGH: 'border-l-priority-high',
  URGENT: 'border-l-priority-urgent',
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toDateKey(year: number, month: number, day: number) {
  const d = new Date(Date.UTC(year, month, day));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function getMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const days: { dateKey: string; day: number; inCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(year, month, 1 - startWeekday + i));
    days.push({
      dateKey: toDateKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      day: d.getUTCDate(),
      inCurrentMonth: d.getUTCMonth() === month,
    });
  }
  return days;
}

function TaskChip({ task, onOpen }: { task: CalendarTask; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'cursor-pointer rounded-md border border-l-[3px] border-border bg-bg px-1.5 py-1 text-xs shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-primary/40 hover:shadow-md',
        PRIORITY_BORDER_CLASSES[task.priority],
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <p className="truncate font-medium text-text">{task.title}</p>
      <div className="mt-0.5 flex items-center gap-1">
        <PriorityBadge priority={task.priority} />
        <span className="truncate text-muted">{task.column.board.name}</span>
      </div>
    </div>
  );
}

function DayCell({
  dateKey,
  day,
  inCurrentMonth,
  isToday,
  tasks,
  onOpenTask,
}: {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
  onOpenTask: (task: CalendarTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateKey });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[110px] border border-border p-1.5',
        !inCurrentMonth && 'bg-surface/50',
        isOver && 'bg-primary/10',
      )}
    >
      <span
        className={cn(
          'text-xs',
          inCurrentMonth ? 'text-text' : 'text-muted',
          isToday && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-white',
        )}
      >
        {day}
      </span>
      <div className="mt-1 space-y-1">
        {tasks.map((task) => (
          <TaskChip key={task.id} task={task} onOpen={() => onOpenTask(task)} />
        ))}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { workspaceId = '' } = useParams();
  useWorkspaceRealtime(workspaceId);

  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const monthKey = `${year}-${pad2(month + 1)}`;
  const todayKey = toDateKey(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const { data: tasks } = useCalendarTasks(workspaceId, monthKey);
  const rescheduleTask = useRescheduleTask(workspaceId, monthKey);
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of tasks ?? []) {
      if (!task.dueDate) continue;
      const dateKey = task.dueDate.slice(0, 10);
      const existing = map.get(dateKey) ?? [];
      existing.push(task);
      map.set(dateKey, existing);
    }
    return map;
  }, [tasks]);

  function goToPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setYear(now.getUTCFullYear());
    setMonth(now.getUTCMonth());
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const targetDateKey = String(over.id);
    const task = tasks?.find((t) => t.id === taskId);
    if (task?.dueDate?.slice(0, 10) === targetDateKey) return;
    rescheduleTask.mutate({
      taskId,
      dueDate: `${targetDateKey}T00:00:00.000Z`,
      boardId: task?.column.board.id ?? '',
    });
  }

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="p-6">
      <Link to={`/workspaces/${workspaceId}`} className="text-sm text-muted hover:underline">
        ← Back to workspace
      </Link>
      <div className="mb-4 mt-2 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-text">{monthLabel}</h1>
        <Button variant="secondary" onClick={goToPrevMonth}>
          ← Prev
        </Button>
        <Button variant="secondary" onClick={goToToday}>
          Today
        </Button>
        <Button variant="secondary" onClick={goToNextMonth}>
          Next →
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 border-l border-t border-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="border-b border-r border-border bg-surface p-1.5 text-center text-xs font-medium text-muted"
            >
              {label}
            </div>
          ))}
          {grid.map(({ dateKey, day, inCurrentMonth }) => (
            <DayCell
              key={dateKey}
              dateKey={dateKey}
              day={day}
              inCurrentMonth={inCurrentMonth}
              isToday={dateKey === todayKey}
              tasks={tasksByDay.get(dateKey) ?? []}
              onOpenTask={setActiveTask}
            />
          ))}
        </div>
      </DndContext>

      {activeTask && (
        <TaskDetailModal
          boardId={activeTask.column.board.id}
          taskId={activeTask.id}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
}
