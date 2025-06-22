import { IsAlphanumeric, IsString } from "class-validator";
import { Double } from "typeorm";

export class CreateGroupDto {
    @IsString()
    readonly name: string;
    @IsString()
    readonly descricao: string;
    @IsString()
    tagname: string;
    users: any 
    userId: number; 
}