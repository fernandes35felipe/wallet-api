//Basicamente é a Interface ou o layout de informações que serão recebidas pela função CreateCourse

import { IsAlphanumeric, IsString } from 'class-validator';
import { Double } from 'typeorm';

export class CreateGroupDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly descricao: string;
  @IsString()
  tagname: string;
  users: any;
}
