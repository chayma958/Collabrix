import { apiClient } from '@/lib/api-client';
import type { Task } from '@/types/board';

export interface CalendarTask extends Task {
  column: {
    id: string;
    name: string;
    board: { id: string; name: string };
  };
}

export const calendarApi = {
  getMonthTasks: (workspaceId: string, month: string) =>
    apiClient
      .get<CalendarTask[]>(`/workspaces/${workspaceId}/tasks/calendar`, { params: { month } })
      .then((r) => r.data),
};
