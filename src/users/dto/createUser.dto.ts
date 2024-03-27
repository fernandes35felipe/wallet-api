//Basicamente é a Interface ou o layout de informações que serão recebidas pela função CreateCourse

import { IsAlphanumeric, IsString } from "class-validator";
import { Double } from "typeorm";

export class CreateUserDto {
    @IsString()
    readonly name: string;
    @IsString()
    readonly email: string;
    @IsString()
    password: string;
}
