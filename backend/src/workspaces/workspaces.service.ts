import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { getFullName } from '../common/utils/user';
import { ROLE_RANK } from '../common/constants/role-rank';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        members: {
          create: { userId, role: WorkspaceRole.OWNER },
        },
      },
      include: { members: true },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId: workspace.id,
      actorId: userId,
      entityType: 'WORKSPACE',
      entityId: workspace.id,
      action: 'created',
      metadata: { name: workspace.name },
    });

    return workspace;
  }

  listForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async update(workspaceId: string, dto: UpdateWorkspaceDto, actorId: string) {
    await this.findOne(workspaceId);
    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: dto,
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'WORKSPACE',
      entityId: workspaceId,
      action: 'updated',
    });

    return workspace;
  }

  async remove(workspaceId: string) {
    await this.findOne(workspaceId);
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  async listMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    actorId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException(
        'No account exists with this email yet. Ask them to register first, then invite them again.',
      );
    }

    const existingMembership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (existingMembership) {
      throw new ConflictException(
        'This user is already a member of the workspace',
      );
    }

    const membership = await this.prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'WORKSPACE',
      entityId: workspaceId,
      action: 'member_invited',
      metadata: {
        invitedUserId: user.id,
        invitedName: getFullName(user),
        role: dto.role,
      },
    });

    return membership;
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    actorId: string,
    callerRole: WorkspaceRole,
  ) {
    const member = await this.getMemberOrThrow(workspaceId, memberId);

    this.assertCanManageOwnership(member.role, dto.role, callerRole);

    if (
      member.role === WorkspaceRole.OWNER &&
      dto.role !== WorkspaceRole.OWNER
    ) {
      await this.assertNotLastOwner(workspaceId);
    }

    const updated = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'WORKSPACE',
      entityId: workspaceId,
      action: 'member_role_changed',
      metadata: {
        memberId,
        userId: member.userId,
        from: member.role,
        to: dto.role,
      },
    });

    return updated;
  }

  async removeMember(
    workspaceId: string,
    memberId: string,
    actorId: string,
    callerRole: WorkspaceRole,
  ) {
    const member = await this.getMemberOrThrow(workspaceId, memberId);

    this.assertCanManageOwnership(member.role, member.role, callerRole);

    if (member.role === WorkspaceRole.OWNER) {
      await this.assertNotLastOwner(workspaceId);
    }

    await this.prisma.workspaceMember.delete({ where: { id: memberId } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'WORKSPACE',
      entityId: workspaceId,
      action: 'member_removed',
      metadata: { memberId, userId: member.userId },
    });
  }

  private async getMemberOrThrow(workspaceId: string, memberId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Workspace member not found');
    }
    return member;
  }

  private assertCanManageOwnership(
    currentRole: WorkspaceRole,
    newRole: WorkspaceRole,
    callerRole: WorkspaceRole,
  ) {
    const touchesOwnership =
      currentRole === WorkspaceRole.OWNER || newRole === WorkspaceRole.OWNER;
    if (touchesOwnership && ROLE_RANK[callerRole] < ROLE_RANK.OWNER) {
      throw new ForbiddenException(
        "Only a workspace owner can change another owner's role or remove them, or promote a member to owner",
      );
    }
  }

  private async assertNotLastOwner(workspaceId: string) {
    const ownerCount = await this.prisma.workspaceMember.count({
      where: { workspaceId, role: WorkspaceRole.OWNER },
    });
    if (ownerCount <= 1) {
      throw new BadRequestException('A workspace must have at least one owner');
    }
  }
}
