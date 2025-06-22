import { IsAlphanumeric, IsString } from "class-validator";
import { Double } from "typeorm";

export class CreateEntryDto {
    @IsString()
    readonly name: string;
    @IsString()
    readonly description: string;

    @IsAlphanumeric()
    readonly value: Double

    @IsAlphanumeric()
    readonly recurrence_time: number

    date: string
    font: string
    user_id: number

    group_id: number; 
}