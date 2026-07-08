import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateColumnDto, actorId: string, workspaceId: string) {
    const order = dto.order ?? (await this.nextOrder(dto.boardId));
    const column = await this.prisma.column.create({
      data: { boardId: dto.boardId, name: dto.name, order },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'COLUMN',
      entityId: column.id,
      action: 'created',
      metadata: { name: column.name },
    });

    return column;
  }

  async update(columnId: string, dto: UpdateColumnDto) {
    await this.assertExists(columnId);
    return this.prisma.column.update({ where: { id: columnId }, data: dto });
  }

  async reorder(dto: ReorderColumnsDto) {
    await this.prisma.$transaction(
      dto.orderedColumnIds.map((id, index) =>
        this.prisma.column.update({ where: { id }, data: { order: index } }),
      ),
    );
    return this.prisma.column.findMany({
      where: { boardId: dto.boardId },
      orderBy: { order: 'asc' },
    });
  }

  async remove(columnId: string, actorId: string, workspaceId: string) {
    const column = await this.assertExists(columnId);
    await this.prisma.column.delete({ where: { id: columnId } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'COLUMN',
      entityId: columnId,
      action: 'deleted',
      metadata: { name: column.name },
    });
  }

  private async nextOrder(boardId: string): Promise<number> {
    const last = await this.prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
    });
    return (last?.order ?? -1) + 1;
  }

  private async assertExists(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return column;
  }
}
