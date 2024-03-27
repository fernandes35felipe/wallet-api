import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
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
        ){}
    
        findAll(){
            return this.userRepository.find();
        }

        findOne(email){
            return this.userRepository.findOneBy({ email: email });
        }

        async me(req) {
            return req.user;
        }
    

        async create(createUserDto: CreateUserDto){
            try{
                const userExist = await this.userRepository.findOneBy({email: createUserDto.email})

                const exception = await this.validateUserRegister(userExist);

                if (exception) throw new NotFoundException(exception);
                
                createUserDto.password = bcrypt.hashSync(createUserDto.password, 8);
                const user = this.userRepository.create({...createUserDto})

                return this.userRepository.save(user)
            } catch (error) {
			    throw new HttpException(
                    error.response.message,
                    error.response.statusCode,
			);
		}
        }

        async update(id, updatedUser){
             const user = await this.userRepository.findOneBy({id: id})

             if(!user){
                throw new NotFoundException(`Usuario não encontrado`)
            }

            return this.userRepository.update(id, updatedUser)
        }

        async delete(id){
            try {
                return await this.userRepository.delete(id);
            } catch (error) {
                throw new NotFoundException(error.message);
            }
        }

        async validateUserRegister(user) {
            if (user)
                return {
                    statusCode: 409,
                    message:
                        'Já existe um cadastro para esse endereço de E-mail na base do Wallet',
                };
        }
    
}
