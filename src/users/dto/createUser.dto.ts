import { IsAlphanumeric, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly email: string;
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
