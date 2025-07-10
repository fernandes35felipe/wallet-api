import { IsAlphanumeric, IsString, IsNumber } from 'class-validator';

export class CreateEntryDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly description: string;

  @IsNumber()
  readonly value: number;

  @IsNumber()
  readonly recurrence_time: number;

  date: string;
  font: string;

  @IsString()
  user_id: string;

  @IsString()
  group_id: string;
}
