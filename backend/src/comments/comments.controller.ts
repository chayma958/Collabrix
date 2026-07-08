import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import { CurrentWorkspaceRole } from '../common/decorators/current-workspace-role.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.commentsService.create(taskId, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Get('tasks/:taskId/comments')
  list(@Param('taskId') taskId: string) {
    return this.commentsService.list(taskId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('comment', 'id')
  @Patch('comments/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.update(id, dto, user.id);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('comment', 'id')
  @Delete('comments/:id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceRole() role: WorkspaceRole,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.commentsService.remove(id, user.id, role, workspaceId);
  }
}
