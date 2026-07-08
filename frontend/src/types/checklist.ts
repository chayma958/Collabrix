export interface ChecklistItem {
  id: string;
  taskId: string;
  label: string;
  isDone: boolean;
  order: number;
  createdAt: string;
}
