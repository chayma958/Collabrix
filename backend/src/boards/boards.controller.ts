import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Roles(WorkspaceRole.ADMIN)
  @Post()
  create(
    @Body() dto: CreateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.boardsService.create(dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @Get()
  list(@Query('workspaceId') workspaceId: string) {
    return this.boardsService.listByWorkspace(workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @ResolveWorkspaceFrom('board', 'id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('board', 'id')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.boardsService.update(id, dto, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('board', 'id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(id);
  }
}
