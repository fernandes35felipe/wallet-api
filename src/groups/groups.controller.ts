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

    @Get('/email')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('email') email){
        const user =  this.groupsService.findOne(email)

        if(!user){
            throw new HttpException(`Usuário não encontrado`, HttpStatus.NOT_FOUND)
        }
        
        return user
    }

    @Post()
    create(@Body() createUserDto: CreateGroupDto){
        return this.groupsService.create(createUserDto);
    }

    @Put(':id')
    update(@Param('id') id, @Body() updatedUser){
        return this.groupsService.update(id, updatedUser)
    }

    
    @Delete(':id')
    delete(@Param('id') id){
        return this.groupsService.delete(id)
    }

    @Post('/login')
    @UseGuards(AuthGuard('local'))
    async validateUser(@Request() req) {
       return this.authService.login(req.user);
    }

}

