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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceRole } from '../common/decorators/current-workspace-role.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.workspacesService.listForUser(user.id);
  }

  @Roles(WorkspaceRole.VIEWER)
  @Get(':workspaceId')
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Roles(WorkspaceRole.ADMIN)
  @Patch(':workspaceId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.update(workspaceId, dto, user.id);
  }

  @Roles(WorkspaceRole.OWNER)
  @Delete(':workspaceId')
  remove(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.remove(workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @Get(':workspaceId/members')
  listMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.listMembers(workspaceId);
  }

  @Roles(WorkspaceRole.ADMIN)
  @Post(':workspaceId/invite')
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workspacesService.inviteMember(workspaceId, dto, user.id);
  }

  @Roles(WorkspaceRole.ADMIN)
  @Patch(':workspaceId/members/:memberId')
  updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceRole() callerRole: WorkspaceRole,
  ) {
    return this.workspacesService.updateMemberRole(
      workspaceId,
      memberId,
      dto,
      user.id,
      callerRole,
    );
  }

  @Roles(WorkspaceRole.ADMIN)
  @Delete(':workspaceId/members/:memberId')
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceRole() callerRole: WorkspaceRole,
  ) {
    return this.workspacesService.removeMember(
      workspaceId,
      memberId,
      user.id,
      callerRole,
    );
  }
}
