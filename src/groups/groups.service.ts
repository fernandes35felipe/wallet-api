import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/createGroup.dto';
import { Groups } from './groups.entity';
import { Users } from 'src/users/users.entity';
import { UserGroup } from 'src/user_group/user_group.entity';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Groups) 
        private readonly groupRepository: Repository<Groups>,
        @InjectRepository(UserGroup) 
        private readonly userGroupRepository: Repository<UserGroup>
        ){}
    
        findAll(){
            return this.groupRepository.find();
        }

        findByTag(tagname){
            return this.groupRepository.findOneBy({ tagname: tagname });
        }

        async findUserGroups(userId){
            let grupos = await this.userGroupRepository.findBy({ userId: userId })
            let gruposUser = []
            for(let grupo of grupos){
                let grupoTemp = await this.groupRepository.findBy({ id: grupo.groupId })
                gruposUser.push(grupoTemp[0])
            }

            return gruposUser
        }

    
        async create(createGroupsDto: CreateGroupDto){
            try{
                const groupExist = await this.groupRepository.findOneBy({tagname: createGroupsDto.tagname})

                if(!groupExist){
                    const group = this.groupRepository.create({...createGroupsDto})

                    return group
                }
            } catch (error) {
			    throw new HttpException(
                    error.response.message,
                    error.response.statusCode,
			);
		}
        }

        async update(id, updatedGroup){
             const group = await this.groupRepository.findOneBy({id: id})

             if(!group){
                throw new NotFoundException(`Grupo não encontrado`)
            }

            return this.groupRepository.update(id, updatedGroup)
        }

        async delete(id){
            try {
                return await this.groupRepository.delete(id);
            } catch (error) {
                throw new NotFoundException(error.message);
            }
        }
    
}
