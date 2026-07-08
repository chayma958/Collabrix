import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

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
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateBoardDto, actorId: string, workspaceId: string) {
    const board = await this.prisma.board.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        description: dto.description,
      },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'BOARD',
      entityId: board.id,
      action: 'created',
      metadata: { name: board.name },
    });

    return board;
  }

  listByWorkspace(workspaceId: string) {
    return this.prisma.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' }, include: TASK_INCLUDE },
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(
    boardId: string,
    dto: UpdateBoardDto,
    actorId: string,
    workspaceId: string,
  ) {
    await this.assertExists(boardId);
    const board = await this.prisma.board.update({
      where: { id: boardId },
      data: dto,
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'BOARD',
      entityId: boardId,
      action: 'updated',
    });

    return board;
  }

  async remove(boardId: string) {
    await this.assertExists(boardId);
    await this.prisma.board.delete({ where: { id: boardId } });
  }

  private async assertExists(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }
}
