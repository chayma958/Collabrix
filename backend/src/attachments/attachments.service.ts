import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ACTIVITY_EVENT } from '../common/events/domain-event';
import { ROLE_RANK } from '../common/constants/role-rank';

@Injectable()
export class AttachmentsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    taskId: string,
    file: Express.Multer.File,
    actorId: string,
    workspaceId: string,
  ) {
    const uploadResult = await this.cloudinary.uploadBuffer(
      file.buffer,
      `collabrix/tasks/${taskId}`,
    );

    const attachment = await this.prisma.attachment.create({
      data: {
        taskId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        bytes: file.size,
        uploadedById: actorId,
      },
    });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: taskId,
      action: 'attachment_added',
      metadata: { fileName: file.originalname },
    });

    return attachment;
  }

  list(taskId: string) {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(
    id: string,
    actorId: string,
    workspaceId: string,
    callerRole: WorkspaceRole,
  ) {
    const attachment = await this.getOrThrow(id);

    const isUploader = attachment.uploadedById === actorId;
    const isAdminOrAbove = ROLE_RANK[callerRole] >= ROLE_RANK.ADMIN;
    if (!isUploader && !isAdminOrAbove) {
      throw new ForbiddenException(
        'Only the uploader or a workspace admin can delete this attachment',
      );
    }

    const resourceType: 'image' | 'raw' = attachment.mimeType.startsWith(
      'image/',
    )
      ? 'image'
      : 'raw';
    await this.cloudinary.destroy(attachment.publicId, resourceType);
    await this.prisma.attachment.delete({ where: { id } });

    this.eventEmitter.emit(ACTIVITY_EVENT, {
      workspaceId,
      actorId,
      entityType: 'TASK',
      entityId: attachment.taskId,
      action: 'attachment_removed',
      metadata: { fileName: attachment.originalName },
    });
  }

  private async getOrThrow(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    return attachment;
  }
}
