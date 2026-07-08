import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { WorkspaceRole } from '@prisma/client';
import type { Request } from 'express';

export const CurrentWorkspaceRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceRole | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { workspaceRole?: WorkspaceRole }>();
    return request.workspaceRole;
  },
);
