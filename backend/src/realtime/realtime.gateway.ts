import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACTIVITY_EVENT,
  NOTIFICATION_EVENT,
} from '../common/events/domain-event';
import type {
  DomainEvent,
  NotificationCreatedEvent,
} from '../common/events/domain-event';

interface AuthenticatedSocket extends Socket {
  data: { userId?: string };
}

function workspaceRoom(workspaceId: string): string {
  return `workspace:${workspaceId}`;
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
      await client.join(userRoom(payload.sub));
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('join-workspace')
  async onJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() workspaceId: string,
  ) {
    const userId = client.data.userId;
    if (!userId || !workspaceId) return;

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (membership) {
      await client.join(workspaceRoom(workspaceId));
    }
  }

  @SubscribeMessage('leave-workspace')
  onLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() workspaceId: string,
  ) {
    if (!workspaceId) return;
    void client.leave(workspaceRoom(workspaceId));
  }

  @OnEvent(ACTIVITY_EVENT)
  broadcastActivity(event: DomainEvent) {
    this.server?.to(workspaceRoom(event.workspaceId)).emit('activity', event);
  }

  @OnEvent(NOTIFICATION_EVENT)
  relayNotification(event: NotificationCreatedEvent) {
    this.server
      ?.to(userRoom(event.userId))
      .emit('notification', event.notification);
  }
}
