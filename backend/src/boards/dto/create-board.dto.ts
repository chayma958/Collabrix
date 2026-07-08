import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @MinLength(1)
  workspaceId: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
