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
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';

@Controller('labels')
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Roles(WorkspaceRole.ADMIN)
  @Post()
  create(@Body() dto: CreateLabelDto) {
    return this.labelsService.create(dto);
  }

  @Roles(WorkspaceRole.VIEWER)
  @Get()
  list(@Query('workspaceId') workspaceId: string) {
    return this.labelsService.listByWorkspace(workspaceId);
  }

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('label', 'id')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.labelsService.update(id, dto);
  }

  @Roles(WorkspaceRole.ADMIN)
  @ResolveWorkspaceFrom('label', 'id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labelsService.remove(id);
  }
}
