import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (minRole: WorkspaceRole) =>
  SetMetadata(ROLES_KEY, minRole);
