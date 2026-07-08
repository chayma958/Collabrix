import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkspaceRole } from '@prisma/client';
import { AttachmentsService } from './attachments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ResolveWorkspaceFrom } from '../common/decorators/resolve-workspace-from.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspaceId } from '../common/decorators/current-workspace-id.decorator';
import { CurrentWorkspaceRole } from '../common/decorators/current-workspace-role.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

@Controller()
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Post('tasks/:taskId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(new BadRequestException('Unsupported file type'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.attachmentsService.create(taskId, file, user.id, workspaceId);
  }

  @Roles(WorkspaceRole.VIEWER)
  @ResolveWorkspaceFrom('task', 'taskId')
  @Get('tasks/:taskId/attachments')
  list(@Param('taskId') taskId: string) {
    return this.attachmentsService.list(taskId);
  }

  @Roles(WorkspaceRole.MEMBER)
  @ResolveWorkspaceFrom('attachment', 'id')
  @Delete('attachments/:id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspaceId() workspaceId: string,
    @CurrentWorkspaceRole() callerRole: WorkspaceRole,
  ) {
    return this.attachmentsService.remove(id, user.id, workspaceId, callerRole);
  }
}
