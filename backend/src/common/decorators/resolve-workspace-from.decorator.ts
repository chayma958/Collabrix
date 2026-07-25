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

export const ResolveWorkspaceFrom = (
  entity: WorkspaceResolutionEntity,
  param = 'id',
) =>
  SetMetadata(RESOLVE_WORKSPACE_KEY, {
    entity,
    param,
  } satisfies WorkspaceResolution);
