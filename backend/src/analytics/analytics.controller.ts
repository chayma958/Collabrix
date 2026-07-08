import { Controller, Get, Param } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles(WorkspaceRole.VIEWER)
  @Get('workspaces/:workspaceId/analytics')
  getDashboard(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getDashboard(workspaceId);
  }
}
