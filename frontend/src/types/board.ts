import type { User } from './user';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: Label;
}

export interface TaskAssignee {
  taskId: string;
  userId: string;
  user: User;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
  createdById: string | null;
  assignees: TaskAssignee[];
  labels: TaskLabel[];
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  order: number;
  tasks: Task[];
}

export interface BoardWithColumns extends Board {
  columns: Column[];
}
