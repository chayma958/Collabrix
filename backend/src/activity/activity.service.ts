import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LIMIT = 30;

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async listForWorkspace(
    workspaceId: string,
    cursor?: string,
    limit = DEFAULT_LIMIT,
  ) {
    return this.prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
