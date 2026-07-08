import { Module } from '@nestjs/common';
import { ActivityLogListener } from './activity-log.listener';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityLogListener, ActivityService],
})
export class ActivityModule {}
