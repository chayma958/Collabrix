import { Injectable } from '@nestjs/common';
import { TaskPriority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getFullName } from '../common/utils/user';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TREND_DAYS = 30;

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(workspaceId: string) {
    const [statusBreakdown, priorityBreakdown, workload, completionTrend] =
      await Promise.all([
        this.getStatusBreakdown(workspaceId),
        this.getPriorityBreakdown(workspaceId),
        this.getWorkload(workspaceId),
        this.getCompletionTrend(workspaceId),
      ]);
    return { statusBreakdown, priorityBreakdown, workload, completionTrend };
  }

  private async getStatusBreakdown(workspaceId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { column: { board: { workspaceId } } },
      select: { column: { select: { name: true } } },
    });
    const counts = new Map<string, number>();
    for (const task of tasks) {
      counts.set(task.column.name, (counts.get(task.column.name) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }

  private async getPriorityBreakdown(workspaceId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { column: { board: { workspaceId } } },
      select: { priority: true },
    });
    const counts = new Map<TaskPriority, number>(PRIORITIES.map((p) => [p, 0]));
    for (const task of tasks) {
      counts.set(task.priority, (counts.get(task.priority) ?? 0) + 1);
    }
    return PRIORITIES.map((priority) => ({
      priority,
      count: counts.get(priority) ?? 0,
    }));
  }

  private async getWorkload(workspaceId: string) {
    const assignments = await this.prisma.taskAssignee.findMany({
      where: { task: { column: { board: { workspaceId } } } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const counts = new Map<
      string,
      { userId: string; name: string; count: number }
    >();
    for (const assignment of assignments) {
      const existing = counts.get(assignment.userId);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(assignment.userId, {
          userId: assignment.userId,
          name: getFullName(assignment.user),
          count: 1,
        });
      }
    }

    const unassignedCount = await this.prisma.task.count({
      where: { column: { board: { workspaceId } }, assignees: { none: {} } },
    });

    return [
      ...counts.values(),
      { userId: 'unassigned', name: 'Unassigned', count: unassignedCount },
    ];
  }

  private async getCompletionTrend(workspaceId: string) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));
    since.setUTCHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        column: {
          board: { workspaceId },
          name: { equals: 'Done', mode: 'insensitive' },
        },
        updatedAt: { gte: since },
      },
      select: { updatedAt: true },
    });

    const counts = new Map<string, number>();
    for (let i = 0; i < TREND_DAYS; i++) {
      const day = new Date(since);
      day.setUTCDate(day.getUTCDate() + i);
      counts.set(day.toISOString().slice(0, 10), 0);
    }
    for (const task of tasks) {
      const key = task.updatedAt.toISOString().slice(0, 10);
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
