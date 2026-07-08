import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DueDateCron {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async notifyApproachingDueDates() {
    await this.run();
  }

  async run() {
    const now = new Date();
    const in24h = new Date(now.getTime() + DAY_MS);

    const tasks = await this.prisma.task.findMany({
      where: { dueDate: { gte: now, lte: in24h } },
      select: {
        id: true,
        title: true,
        dueDate: true,
        column: {
          select: { board: { select: { id: true, workspaceId: true } } },
        },
        assignees: { select: { userId: true } },
      },
    });

    for (const task of tasks) {
      const alreadyNotified = await this.prisma.notification.findFirst({
        where: {
          type: 'due_date_approaching',
          createdAt: { gte: new Date(now.getTime() - DAY_MS) },
          payload: { path: ['taskId'], equals: task.id },
        },
      });
      if (alreadyNotified) continue;

      for (const assignee of task.assignees) {
        await this.notificationsService.create(
          assignee.userId,
          'due_date_approaching',
          {
            taskId: task.id,
            taskTitle: task.title,
            boardId: task.column.board.id,
            workspaceId: task.column.board.workspaceId,
            dueDate: task.dueDate?.toISOString(),
          },
        );
      }
    }
  }
}
