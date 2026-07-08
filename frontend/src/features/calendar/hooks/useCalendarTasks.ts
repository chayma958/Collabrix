import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '@/features/calendar/api';
import { tasksApi } from '@/features/tasks/api';

export function useCalendarTasks(workspaceId: string, month: string) {
  return useQuery({
    queryKey: ['calendar', workspaceId, month],
    queryFn: () => calendarApi.getMonthTasks(workspaceId, month),
    enabled: !!workspaceId,
  });
}

export function useRescheduleTask(workspaceId: string, month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      dueDate,
    }: {
      taskId: string;
      dueDate: string;
      boardId: string;
    }) => tasksApi.update(taskId, { dueDate }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId, month] });
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
}
