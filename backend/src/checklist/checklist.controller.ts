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
import { ChecklistService } from './checklist.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller()
export class ChecklistController {
  constructor(private checklistService: ChecklistService) {}

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Post('tasks/:taskId/checklist-items')
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateChecklistItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.checklistService.create(taskId, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Get('tasks/:taskId/checklist-items')
  list(@Param('taskId') taskId: string) {
    return this.checklistService.list(taskId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('checklist-item', 'id')
  @Patch('checklist-items/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.checklistService.update(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('checklist-item', 'id')
  @Delete('checklist-items/:id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.checklistService.remove(id, user.id, workspaceId);
  }
}
