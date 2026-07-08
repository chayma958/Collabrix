import { IsArray, IsString } from 'class-validator';

export class SetTaskLabelsDto {
  @IsArray()
  @IsString({ each: true })
  labelIds: string[];
}
