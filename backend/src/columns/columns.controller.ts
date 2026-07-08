import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('board', 'boardId')
  @Post()
  create(
    @Body() dto: CreateColumnDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.columnsService.create(dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('board', 'boardId')
  @Patch('reorder')
  reorder(@Body() dto: ReorderColumnsDto) {
    return this.columnsService.reorder(dto);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('column', 'id')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto);
  }

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('column', 'id')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.columnsService.remove(id, user.id, workspaceId);
  }
}
