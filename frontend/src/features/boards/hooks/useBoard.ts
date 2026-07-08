import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '@/features/boards/api';

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsApi.get(boardId),
    enabled: !!boardId,
  });
}
