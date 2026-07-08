import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import type { DomainEvent } from '../common/events/domain-event';

@Injectable()
export class ActivityLogListener {
  constructor(private prisma: PrismaService) {}

  @OnEvent(ACTIVITY_EVENT)
  async handleActivity(event: DomainEvent) {
    await this.prisma.activityLog.create({
      data: {
        workspaceId: event.workspaceId,
        entityType: event.entityType,
        entityId: event.entityId,
        actorId: event.actorId,
        action: event.action,
        metadata: event.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
