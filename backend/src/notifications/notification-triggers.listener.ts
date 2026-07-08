import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import type { DomainEvent } from '../common/events/domain-event';
import { NotificationsService } from './notifications.service';
import { getFullName } from '../common/utils/user';

@Injectable()
export class NotificationTriggersListener {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @OnEvent(ACTIVITY_EVENT)
  async handleActivity(event: DomainEvent) {
    if (event.entityType === 'TASK' && event.action === 'assigned') {
      await this.onTaskAssigned(event);
    } else if (event.entityType === 'COMMENT' && event.action === 'commented') {
      await this.onTaskCommented(event);
    } else if (
      event.entityType === 'WORKSPACE' &&
      event.action === 'member_invited'
    ) {
      await this.onMemberInvited(event);
    }
  }

  private async onTaskAssigned(event: DomainEvent) {
    const userIds = (event.metadata?.userIds as string[] | undefined) ?? [];
    const recipients = userIds.filter((id) => id !== event.actorId);
    if (recipients.length === 0) return;

    const task = await this.prisma.task.findUnique({
      where: { id: event.entityId },
      select: {
        title: true,
        column: { select: { board: { select: { id: true } } } },
      },
    });
    if (!task) return;

    const actor = await this.prisma.user.findUnique({
      where: { id: event.actorId },
    });

    for (const userId of recipients) {
      await this.notificationsService.create(userId, 'task_assigned', {
        taskId: event.entityId,
        taskTitle: task.title,
        boardId: task.column.board.id,
        workspaceId: event.workspaceId,
        actorName: actor ? getFullName(actor) : undefined,
      });
    }
  }

  private async onTaskCommented(event: DomainEvent) {
    const taskId = event.metadata?.taskId as string | undefined;
    if (!taskId) return;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        title: true,
        column: { select: { board: { select: { id: true } } } },
        assignees: { select: { userId: true } },
      },
    });
    if (!task) return;

    const recipients = task.assignees
      .map((a) => a.userId)
      .filter((id) => id !== event.actorId);
    if (recipients.length === 0) return;

    const actor = await this.prisma.user.findUnique({
      where: { id: event.actorId },
    });

    for (const userId of recipients) {
      await this.notificationsService.create(userId, 'task_commented', {
        taskId,
        taskTitle: task.title,
        boardId: task.column.board.id,
        workspaceId: event.workspaceId,
        actorName: actor ? getFullName(actor) : undefined,
      });
    }
  }

  private async onMemberInvited(event: DomainEvent) {
    const invitedUserId = event.metadata?.invitedUserId as string | undefined;
    if (!invitedUserId || invitedUserId === event.actorId) return;

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: event.workspaceId },
      select: { name: true },
    });
    const actor = await this.prisma.user.findUnique({
      where: { id: event.actorId },
    });

    await this.notificationsService.create(invitedUserId, 'workspace_invited', {
      workspaceId: event.workspaceId,
      workspaceName: workspace?.name,
      actorName: actor ? getFullName(actor) : undefined,
    });
  }
}
