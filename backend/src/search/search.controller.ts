import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { SearchService } from './search.service';
import { SearchTasksQueryDto } from './dto/search-tasks-query.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Roles(WorkspaceRole.VIEWER)
  @Get('workspaces/:workspaceId/tasks/search')
  search(
    @Param('workspaceId') workspaceId: string,
    @Query() query: SearchTasksQueryDto,
  ) {
    return this.searchService.searchTasks(workspaceId, query);
  }
}
