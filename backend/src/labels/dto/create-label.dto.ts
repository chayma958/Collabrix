import { IsString, Matches, MinLength } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @MinLength(1)
  workspaceId: string;

  @IsString()
  @MinLength(1)
  name: string;

  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'color must be a hex string like #F87171',
  })
  color: string;
}
