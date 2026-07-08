import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  getMonthTasks(workspaceId: string, query: CalendarQueryDto) {
    const [year, month] = query.month.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    return this.prisma.task.findMany({
      where: {
        column: { board: { workspaceId } },
        dueDate: { gte: start, lt: end },
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
      orderBy: { dueDate: 'asc' },
    });
  }
}
