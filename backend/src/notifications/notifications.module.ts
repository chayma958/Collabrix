import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTriggersListener } from './notification-triggers.listener';
import { DueDateCron } from './due-date.cron';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationTriggersListener, DueDateCron],
  exports: [NotificationsService],
})
export class NotificationsModule {}
