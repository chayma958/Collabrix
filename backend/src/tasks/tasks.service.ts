import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { ROLE_RANK } from '../common/constants/role-rank';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { SetTaskLabelsDto } from './dto/set-task-labels.dto';

const TASK_INCLUDE = {
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
} as const;

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTaskDto, actorId: string, workspaceId: string) {
    const order = await this.nextOrder(dto.columnId);
    const task = await this.prisma.task.create({
      data: {
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        order,
        createdById: actorId,
      },
      include: TASK_INCLUDE,
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: task.id,
      action: 'created',
      metadata: { title: task.title },
    });

    return task;
  }

  async findOne(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_INCLUDE,
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    taskId: string,
    dto: UpdateTaskDto,
    actorId: string,
    workspaceId: string,
  ) {
    await this.assertExists(taskId);
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: TASK_INCLUDE,
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'updated',
      metadata: { title: task.title },
    });

    return task;
  }

  async remove(
    taskId: string,
    actorId: string,
    workspaceId: string,
    callerRole: WorkspaceRole,
  ) {
    const task = await this.assertExists(taskId);

    const isCreator = task.createdById === actorId;
    const isAdminOrAbove = ROLE_RANK[callerRole] >= ROLE_RANK.ADMIN;
    if (!isCreator && !isAdminOrAbove) {
      throw new ForbiddenException(
        'Only the task creator or a workspace admin can delete this task',
      );
    }

    await this.prisma.task.delete({ where: { id: taskId } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'deleted',
      metadata: { title: task.title },
    });
  }

  async move(
    taskId: string,
    dto: MoveTaskDto,
    actorId: string,
    workspaceId: string,
  ) {
    const task = await this.assertExists(taskId);
    const sourceColumnId = task.columnId;
    const targetColumnId = dto.targetColumnId;

    await this.prisma.$transaction(async (tx) => {
      if (sourceColumnId === targetColumnId) {
        const siblings = await tx.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { order: 'asc' },
          select: { id: true },
        });
        const ids = siblings.map((t) => t.id).filter((id) => id !== taskId);
        ids.splice(dto.targetIndex, 0, taskId);
        for (const [index, id] of ids.entries()) {
          await tx.task.update({ where: { id }, data: { order: index } });
        }
        return;
      }

      const sourceSiblings = await tx.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });
      const sourceIds = sourceSiblings
        .map((t) => t.id)
        .filter((id) => id !== taskId);
      for (const [index, id] of sourceIds.entries()) {
        await tx.task.update({ where: { id }, data: { order: index } });
      }

      const targetSiblings = await tx.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });
      const targetIds = targetSiblings.map((t) => t.id);
      targetIds.splice(dto.targetIndex, 0, taskId);
      for (const [index, id] of targetIds.entries()) {
        await tx.task.update({
          where: { id },
          data:
            id === taskId
              ? { order: index, columnId: targetColumnId }
              : { order: index },
        });
      }
    });

    if (sourceColumnId !== targetColumnId) {
      const targetColumn = await this.prisma.column.findUnique({
        where: { id: targetColumnId },
      });
      this.eventEmitter.emit(ACTIVITY_EVENT, {
        workspaceId,
        actorId,
        entityType: 'TASK',
        entityId: taskId,
        action: 'moved',
        metadata: { title: task.title, toColumn: targetColumn?.name },
      });
    }

    return this.findOne(taskId);
  }

  async assignUsers(
    taskId: string,
    dto: AssignTaskDto,
    actorId: string,
    workspaceId: string,
  ) {
    await this.assertExists(taskId);
    await this.prisma.$transaction([
      this.prisma.taskAssignee.deleteMany({ where: { taskId } }),
      this.prisma.taskAssignee.createMany({
        data: dto.userIds.map((userId) => ({ taskId, userId })),
      }),
    ]);

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'assigned',
      metadata: { userIds: dto.userIds },
    });

    return this.findOne(taskId);
  }

  async setLabels(
    taskId: string,
    dto: SetTaskLabelsDto,
    actorId: string,
    workspaceId: string,
  ) {
    await this.assertExists(taskId);
    await this.prisma.$transaction([
      this.prisma.taskLabel.deleteMany({ where: { taskId } }),
      this.prisma.taskLabel.createMany({
        data: dto.labelIds.map((labelId) => ({ taskId, labelId })),
      }),
    ]);

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'labeled',
      metadata: { labelIds: dto.labelIds },
    });

    return this.findOne(taskId);
  }

  private async nextOrder(columnId: string): Promise<number> {
    const last = await this.prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    return (last?.order ?? -1) + 1;
  }

  private async assertExists(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
