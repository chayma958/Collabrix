import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { CalendarService } from './calendar.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Roles(WorkspaceRole.VIEWER)
  @Get('workspaces/:workspaceId/tasks/calendar')
  getMonthTasks(
    @Param('workspaceId') workspaceId: string,
    @Query() query: CalendarQueryDto,
  ) {
    return this.calendarService.getMonthTasks(workspaceId, query);
  }
}
