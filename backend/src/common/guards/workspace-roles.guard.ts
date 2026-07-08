import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceRole } from '@prisma/client';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  RESOLVE_WORKSPACE_KEY,
  WorkspaceResolution,
} from '../decorators/resolve-workspace-from.decorator';
import type { AuthenticatedUser } from '../types/authenticated-user';
import { ROLE_RANK } from '../constants/role-rank';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  workspaceRole?: WorkspaceRole;
  workspaceId?: string;
}

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<WorkspaceRole>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException('Not authenticated');
    }

    const workspaceId = await this.resolveWorkspaceId(context, request);
    if (!workspaceId) {
      throw new NotFoundException(
        'Workspace could not be resolved for this request',
      );
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    if (ROLE_RANK[membership.role] < ROLE_RANK[requiredRole]) {
      throw new ForbiddenException(`Requires ${requiredRole} role or higher`);
    }

    request.workspaceRole = membership.role;
    request.workspaceId = workspaceId;
    return true;
  }

  private async resolveWorkspaceId(
    context: ExecutionContext,
    request: AuthenticatedRequest,
  ): Promise<string | undefined> {
    const params = request.params as Record<string, string | undefined>;
    const body = request.body as Record<string, string | undefined> | undefined;
    const query = request.query as Record<string, string | undefined>;

    if (params.workspaceId) return params.workspaceId;
    if (body?.workspaceId) return body.workspaceId;
    if (query.workspaceId) return query.workspaceId;

    const resolution = this.reflector.getAllAndOverride<WorkspaceResolution>(
      RESOLVE_WORKSPACE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!resolution) return undefined;

    const id = params[resolution.param] ?? body?.[resolution.param];
    if (!id) return undefined;

    switch (resolution.entity) {
      case 'board': {
        const board = await this.prisma.board.findUnique({
          where: { id },
          select: { workspaceId: true },
        });
        return board?.workspaceId;
      }
      case 'column': {
        const column = await this.prisma.column.findUnique({
          where: { id },
          select: { board: { select: { workspaceId: true } } },
        });
        return column?.board.workspaceId;
      }
      case 'task': {
        const task = await this.prisma.task.findUnique({
          where: { id },
          select: {
            column: { select: { board: { select: { workspaceId: true } } } },
          },
        });
        return task?.column.board.workspaceId;
      }
      case 'label': {
        const label = await this.prisma.label.findUnique({
          where: { id },
          select: { workspaceId: true },
        });
        return label?.workspaceId;
      }
      case 'comment': {
        const comment = await this.prisma.comment.findUnique({
          where: { id },
          select: {
            task: {
              select: {
                column: {
                  select: { board: { select: { workspaceId: true } } },
                },
              },
            },
          },
        });
        return comment?.task.column.board.workspaceId;
      }
      case 'checklist-item': {
        const item = await this.prisma.checklistItem.findUnique({
          where: { id },
          select: {
            task: {
              select: {
                column: {
                  select: { board: { select: { workspaceId: true } } },
                },
              },
            },
          },
        });
        return item?.task.column.board.workspaceId;
      }
      case 'attachment': {
        const attachment = await this.prisma.attachment.findUnique({
          where: { id },
          select: {
            task: {
              select: {
                column: {
                  select: { board: { select: { workspaceId: true } } },
                },
              },
            },
          },
        });
        return attachment?.task.column.board.workspaceId;
      }
      default:
        return undefined;
    }
  }
}
