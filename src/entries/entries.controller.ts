import { Controller, Get, Post, Put, Delete, Param, HttpException, HttpStatus, Body } from '@nestjs/common';
import { CreateEntryDto } from './dto/createEntry.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
    constructor(private readonly entriesService: EntriesService){}

@Get('/user/:id')
findAll(@Param() id){
    return this.entriesService.findAll(id)
}

@Get(':id')
findOne(@Param('id') id){
    const user =  this.entriesService.findOne(id)

    if(!user){
        throw new HttpException(`Usuário não encontrado`, HttpStatus.NOT_FOUND)
    }
    
    return user
}

@Post()
create(@Body() createUserDto: CreateEntryDto){
    return this.entriesService.create(createUserDto);
}

@Put(':id')
update(@Param('id') id, @Body() updatedUser){
    return this.entriesService.update(id, updatedUser)
}


@Delete(':id')
delete(@Param('id') id){
    return this.entriesService.delete(id)
}
}
