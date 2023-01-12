import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { Users } from './users.entity';


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

            const user = this.userRepository.create({...createUserDto})
    
            return this.userRepository.save(user)
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
    
}
