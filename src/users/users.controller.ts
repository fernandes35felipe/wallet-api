import {Controller, Get, Post, Put, Delete, Param, Body,Request, HttpCode, HttpStatus, HttpException,UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService,
        private authService: AuthService,
        ){}

        @Get('/me/get')
        // @UseGuards(JwtAuthGuard)
        async me(@Request() req) {
          return this.usersService.me(req);
        }

    @Get()
    findAll(){
        return this.usersService.findAll()
    }

    @Get('/email')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('email') email){
        const user =  this.usersService.findOne(email)

        if(!user){
            throw new HttpException(`Usuário não encontrado`, HttpStatus.NOT_FOUND)
        }
        
        return user
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto){
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    update(@Param('id') id, @Body() updatedUser){
        return this.usersService.update(id, updatedUser)
    }

    
    @Delete(':id')
    delete(@Param('id') id){
        return this.usersService.delete(id)
    }

    @Post('/login')
    @UseGuards(AuthGuard('local'))
    async login(@Request() req) {
       return this.authService.login(req.user);
    }

}

