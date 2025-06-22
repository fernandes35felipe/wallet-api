import { HttpException, Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { Users } from './users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users) 
        private readonly userRepository: Repository<Users>
    ) {}

    findAll() {
        return this.userRepository.find();
    }

    findOne(email: string) {
        return this.userRepository.findOneBy({ email: email });
    }

    async me(req) {
        return req.user;
    }

    async create(createUserDto: CreateUserDto) {
        try {
            const userExist = await this.userRepository.findOneBy({ email: createUserDto.email });

            const exception = await this.validateUserRegister(userExist);
            if (exception) throw new HttpException(exception.message, exception.statusCode);

            createUserDto.password = bcrypt.hashSync(createUserDto.password, 8);
            const user = this.userRepository.create({ ...createUserDto });

            return this.userRepository.save(user);
        } catch (error) {
            throw new HttpException(
                error.response?.message || 'Erro interno ao criar usuário.',
                error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, updatedUserData: any) { 
        const user = await this.userRepository.findOneBy({ id: id });

        if (!user) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }

        if (updatedUserData.password) {
            updatedUserData.password = bcrypt.hashSync(updatedUserData.password, 8);
        }

        await this.userRepository.update(id, updatedUserData);
        return { message: 'Usuário atualizado com sucesso!' }; 
    }

    async delete(id: number) {
        try {
            return await this.userRepository.delete(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    async validateUserRegister(user: Users) {
        if (user)
            return {
                statusCode: 409,
                message: 'Já existe um cadastro para esse endereço de E-mail na base do Wallet',
            };
    }
}