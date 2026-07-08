import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchTasksQueryDto } from './dto/search-tasks-query.dto';

const RESULT_LIMIT = 50;

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  searchTasks(workspaceId: string, query: SearchTasksQueryDto) {
    return this.prisma.task.findMany({
      where: {
        column: { board: { workspaceId } },
        ...(query.q
          ? {
              OR: [
                { title: { contains: query.q, mode: 'insensitive' } },
                { description: { contains: query.q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.assigneeId
          ? { assignees: { some: { userId: query.assigneeId } } }
          : {}),
        ...(query.labelId
          ? { labels: { some: { labelId: query.labelId } } }
          : {}),
        ...(query.columnId ? { columnId: query.columnId } : {}),
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        labels: { include: { label: true } },
        column: {
          select: {
            id: true,
            name: true,
            board: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: RESULT_LIMIT,
    });
  }
}
