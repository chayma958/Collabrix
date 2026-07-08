import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class SearchTasksQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  labelId?: string;

  @IsOptional()
  @IsString()
  columnId?: string;
}
