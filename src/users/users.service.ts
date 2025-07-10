import {
  HttpException,
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MongoRepository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { Users } from './users.entity';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: MongoRepository<Users>,
  ) {}

  async findManyByIds(ids: ObjectId[]): Promise<Users[]> {
    return this.userRepository.find({ where: { _id: In(ids) } });
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(email: string) {
    return this.userRepository.findOne({ where: { email: email } });
  }

  async findOneById(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    return this.userRepository.findOne({ where: { _id: new ObjectId(id) } });
  }

  async me(req: any) {
    if (req.user && req.user.id) {
      return this.findOneById(req.user.id);
    }
    throw new NotFoundException('Usuário não autenticado.');
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const userExist = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      const exception = await this.validateUserRegister(userExist);
      if (exception)
        throw new HttpException(exception.message, exception.statusCode);

      createUserDto.password = bcrypt.hashSync(createUserDto.password, 8);
      const user = this.userRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        phone: createUserDto.phone,
      });

      return this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Erro interno ao criar usuário.',
        error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatedUserData: any) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    const user = await this.userRepository.findOneBy({ _id: new ObjectId(id) });

    if (!user) {
      throw new NotFoundException(`Usuario com ID ${id} não encontrado`);
    }

    if (updatedUserData.password) {
      updatedUserData.password = bcrypt.hashSync(updatedUserData.password, 8);
    }

    await this.userRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUserData },
    );
    return { message: 'Usuário atualizado com sucesso!' };
  }

  async delete(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    try {
      const result = await this.userRepository.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
      }
      return { message: 'Usuário excluído com sucesso.' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async validateUserRegister(user: Users) {
    if (user)
      return {
        statusCode: 409,
        message:
          'Já existe um cadastro para esse endereço de E-mail na base do Wallet',
      };
  }
}
