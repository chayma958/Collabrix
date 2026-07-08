import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/features/tasks/api';
import type { BoardWithColumns } from '@/types/board';

interface MoveTaskVars {
  taskId: string;
  targetColumnId: string;
  targetIndex: number;
}

export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, targetColumnId, targetIndex }: MoveTaskVars) =>
      tasksApi.move(taskId, { targetColumnId, targetIndex }),

    onMutate: async ({ taskId, targetColumnId, targetIndex }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });
      const previous = queryClient.getQueryData<BoardWithColumns>(['board', boardId]);

      queryClient.setQueryData<BoardWithColumns>(['board', boardId], (old) => {
        if (!old) return old;
        const columns = old.columns.map((column) => ({ ...column, tasks: [...column.tasks] }));

        let movedTask = null;
        for (const column of columns) {
          const index = column.tasks.findIndex((task) => task.id === taskId);
          if (index !== -1) {
            [movedTask] = column.tasks.splice(index, 1);
            break;
          }
        }
        if (!movedTask) return old;

        const targetColumn = columns.find((column) => column.id === targetColumnId);
        if (!targetColumn) return old;

        targetColumn.tasks.splice(targetIndex, 0, { ...movedTask, columnId: targetColumnId });
        return { ...old, columns };
      });

      return { previous };
    },

    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['board', boardId], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}
