import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

@Injectable()
export class ChecklistService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    taskId: string,
    dto: CreateChecklistItemDto,
    actorId: string,
    workspaceId: string,
  ) {
    const order = await this.nextOrder(taskId);
    const item = await this.prisma.checklistItem.create({
      data: { taskId, label: dto.label, order },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'checklist_item_added',
      metadata: { label: item.label },
    });

    return item;
  }

  list(taskId: string) {
    return this.prisma.checklistItem.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  async update(
    itemId: string,
    dto: UpdateChecklistItemDto,
    actorId: string,
    workspaceId: string,
  ) {
    const item = await this.getOrThrow(itemId);
    const updated = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { label: dto.label, isDone: dto.isDone },
    });

    if (dto.isDone !== undefined && dto.isDone !== item.isDone) {
      this.eventEmitter.emit(ACTIVITY_EVENT, {
        workspaceId,
        actorId,
        entityType: 'TASK',
        entityId: item.taskId,
        action: dto.isDone
          ? 'checklist_item_checked'
          : 'checklist_item_unchecked',
        metadata: { label: updated.label },
      });
    }

    return updated;
  }

  async remove(itemId: string, actorId: string, workspaceId: string) {
    const item = await this.getOrThrow(itemId);
    await this.prisma.checklistItem.delete({ where: { id: itemId } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: item.taskId,
      action: 'checklist_item_removed',
      metadata: { label: item.label },
    });
  }

  private async nextOrder(taskId: string): Promise<number> {
    const last = await this.prisma.checklistItem.findFirst({
      where: { taskId },
      orderBy: { order: 'desc' },
    });
    return (last?.order ?? -1) + 1;
  }

  private async getOrThrow(itemId: string) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }
    return item;
  }
}
