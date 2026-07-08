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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { SetTaskLabelsDto } from './dto/set-task-labels.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import { CurrentWorkspaceRole } from '../common/decorators/current-workspace-role.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('column', 'columnId')
  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.create(dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @ResolveWorkspaceFrom('task', 'id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'id')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.update(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'id')
  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.move(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'id')
  @Patch(':id/assignees')
  assignUsers(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.assignUsers(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'id')
  @Patch(':id/labels')
  setLabels(
    @Param('id') id: string,
    @Body() dto: SetTaskLabelsDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.setLabels(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'id')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
    @CurrentWorkspaceRole() callerRole: WorkspaceRole,
  ) {
    return this.tasksService.remove(id, user.id, workspaceId, callerRole);
  }
}
