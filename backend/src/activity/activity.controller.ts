import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('workspaces/:workspaceId/activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Roles(WorkspaceRole.VIEWER)
  @Get()
  list(
    @Param('workspaceId') workspaceId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.listForWorkspace(
      workspaceId,
      cursor,
      limit ? Number(limit) : undefined,
    );
  }
}
