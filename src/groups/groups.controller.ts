import {Controller, Get, Post, Put, Delete, Param, Body,Request, HttpCode, HttpStatus, HttpException,UseGuards } from '@nestjs/common';
import { CreateGroupDto } from './dto/createGroup.dto';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService,
        private authService: AuthService,
        ){}

    @Get()
    findAll(){
        return this.groupsService.findAll()
    }

    @Get('/tag')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('tagname') tagname){
        const group =  this.groupsService.findByTag(tagname)

        if(!group){
            throw new HttpException(`Usuário não encontrado`, HttpStatus.NOT_FOUND)
        }
        
        return group
    }

    @Get('/user/:id')
    findUserGroups(@Param() id){
    return this.groupsService.findUserGroups(id.id)
    }


    @Post()
    create(@Body() createUserDto: CreateGroupDto){
        return this.groupsService.create(createUserDto);
    }

    @Put(':id')
    update(@Param('id') id, @Body() updatedGroup){
        return this.groupsService.update(id, updatedGroup)
    }


    @Delete(':id')
    delete(@Param('id') id){
        return this.groupsService.delete(id)
    }

}

