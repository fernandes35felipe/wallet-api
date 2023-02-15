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
    const entry =  this.entriesService.findOne(id)

    if(!entry){
        throw new HttpException(`Entrada não encontrada`, HttpStatus.NOT_FOUND)
    }
    
    return entry
}

@Post()
create(@Body() createEntryDto: CreateEntryDto){
    return this.entriesService.create(createEntryDto);
}

@Put(':id')
update(@Param('id') id, @Body() updatedEntry){
    return this.entriesService.update(id, updatedEntry)
}


@Delete(':id')
delete(@Param('id') id){
    return this.entriesService.delete(id)
}
}
