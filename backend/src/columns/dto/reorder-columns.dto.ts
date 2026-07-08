import { ArrayMinSize, IsArray, IsString, MinLength } from 'class-validator';

export class ReorderColumnsDto {
  @IsString()
  @MinLength(1)
  boardId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedColumnIds: string[];
}
