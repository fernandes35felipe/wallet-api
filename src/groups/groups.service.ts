import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/createGroup.dto';
import { Groups } from './groups.entity';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Groups) 
        private readonly groupRepository: Repository<Groups>,
        ){}
    
        findAll(){
            return this.groupRepository.find();
        }

        findOne(tagname){
            return this.groupRepository.findOneBy({ tagname: tagname });
        }

        // async me(user) {
        //     return this.userGroupRepository.findMany({ user: user });
        // }
    
        async create(createGroupsDto: CreateGroupDto){
            try{
                const groupExist = await this.groupRepository.findOneBy({tagname: createGroupsDto.tagname})

                if(!groupExist){
                    const group = this.groupRepository.create({...createGroupsDto})
                    return this.groupRepository.save(group)
                }
            } catch (error) {
			    throw new HttpException(
                    error.response.message,
                    error.response.statusCode,
			);
		}
        }

        async update(id, updatedUser){
             const user = await this.groupRepository.findOneBy({id: id})

             if(!user){
                throw new NotFoundException(`Grupo não encontrado`)
            }

            return this.groupRepository.update(id, updatedUser)
        }

        async delete(id){
            try {
                return await this.groupRepository.delete(id);
            } catch (error) {
                throw new NotFoundException(error.message);
            }
        }
    
}
