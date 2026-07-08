import { SetMetadata } from '@nestjs/common';

export type WorkspaceResolutionEntity =
  | 'board'
  | 'column'
  | 'task'
  | 'label'
  | 'comment'
  | 'checklist-item'
  | 'attachment';

export interface WorkspaceResolution {
  entity: WorkspaceResolutionEntity;
  param: string;
}

export const RESOLVE_WORKSPACE_KEY = 'resolveWorkspaceFrom';

// Tells WorkspaceRolesGuard how to walk from a nested resource id
// (board/column/task/label) up to its owning workspaceId, without every
// module having to duplicate that lookup itself.
export const ResolveWorkspaceFrom = (
  entity: WorkspaceResolutionEntity,
  param = 'id',
) =>
  SetMetadata(RESOLVE_WORKSPACE_KEY, {
    entity,
    param,
  } satisfies WorkspaceResolution);
