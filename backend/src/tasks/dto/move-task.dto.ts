import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class MoveTaskDto {
  @IsString()
  @MinLength(1)
  targetColumnId: string;

  @IsInt()
  @Min(0)
  targetIndex: number;
}
