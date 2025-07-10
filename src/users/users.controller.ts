import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/me/get')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    // req.user.id já é a string do ObjectId
    return this.usersService.findOneById(req.user.id); // Usar findOneById
  }

  @Get('/email')
  // Nao precisa de guard aqui para esqueci senha
  async findOneByEmail(@Query('email') email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }
    return { id: user._id.toHexString(), email: user.email, name: user.name }; // Retorna string do ObjectId
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id, @Body() updatedUser) {
    return this.usersService.update(id, updatedUser);
  }

  @Delete(':id')
  delete(@Param('id') id) {
    return this.usersService.delete(id);
  }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async validateUser(@Request() req) {
    return this.authService.login(req.user);
  }
}
