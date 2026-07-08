import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { LabelsModule } from './labels/labels.module';
import { ActivityModule } from './activity/activity.module';
import { CommentsModule } from './comments/comments.module';
import { ChecklistModule } from './checklist/checklist.module';
import { RealtimeModule } from './realtime/realtime.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CalendarModule } from './calendar/calendar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from './common/guards/workspace-roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    LabelsModule,
    ActivityModule,
    CommentsModule,
    ChecklistModule,
    RealtimeModule,
    NotificationsModule,
    SearchModule,
    AttachmentsModule,
    CalendarModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: WorkspaceRolesGuard },
  ],
})
export class AppModule {}
