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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const AUTHOR_INCLUDE = {
  author: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    taskId: string,
    dto: CreateCommentDto,
    actorId: string,
    workspaceId: string,
  ) {
    const comment = await this.prisma.comment.create({
      data: { taskId, authorId: actorId, body: dto.body },
      include: AUTHOR_INCLUDE,
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'COMMENT',
      entityId: comment.id,
      action: 'commented',
      metadata: { taskId },
    });

    return comment;
  }

  list(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: AUTHOR_INCLUDE,
    });
  }

  async update(commentId: string, dto: UpdateCommentDto, actorId: string) {
    const comment = await this.getOrThrow(commentId);
    if (comment.authorId !== actorId) {
      throw new ForbiddenException(
        'Only the comment author can edit this comment',
      );
    }
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { body: dto.body },
      include: AUTHOR_INCLUDE,
    });
  }

  async remove(
    commentId: string,
    actorId: string,
    callerRole: WorkspaceRole,
    workspaceId: string,
  ) {
    const comment = await this.getOrThrow(commentId);
    const isAuthor = comment.authorId === actorId;
    const isAdminOrAbove = ROLE_RANK[callerRole] >= ROLE_RANK.ADMIN;
    if (!isAuthor && !isAdminOrAbove) {
      throw new ForbiddenException(
        'Only the author or a workspace admin can delete this comment',
      );
    }
    await this.prisma.comment.delete({ where: { id: commentId } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'COMMENT',
      entityId: commentId,
      action: 'comment_deleted',
      metadata: { taskId: comment.taskId },
    });
  }

  private async getOrThrow(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }
}
