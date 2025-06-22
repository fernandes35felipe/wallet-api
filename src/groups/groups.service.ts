import { HttpException, Injectable, NotFoundException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/createGroup.dto';
import { Groups } from './groups.entity';
import { Users } from 'src/users/users.entity';
import { UserGroup } from 'src/user_group/user_group.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Groups)
        private readonly groupRepository: Repository<Groups>,
        @InjectRepository(UserGroup)
        private readonly userGroupRepository: Repository<UserGroup>,
        private readonly usersService: UsersService,
    ){}
    
    findAll(){
        return this.groupRepository.find();
    }

    findByTag(tagname: string){
        return this.groupRepository.findOneBy({ tagname: tagname });
    }

    async findUserGroups(userId: number){
        const userGroupsAssociations = await this.userGroupRepository.find({
            where: { userId: userId },
        });

        if (userGroupsAssociations.length === 0) {
            return []; 
        }

        const groupIds = userGroupsAssociations.map(assoc => assoc.groupId);
        const uniqueGroupIds = [...new Set(groupIds)]; 

        const groupsDetails = await this.groupRepository.find({
            where: { id: In(uniqueGroupIds) },
        });

        const groupsMap = new Map(groupsDetails.map(group => [group.id, group]));

        return userGroupsAssociations.map(assoc => {
            const group = groupsMap.get(assoc.groupId);
            if (group) {
                return {
                    id: group.id,
                    name: group.name,
                    tagname: group.tagname,
                    descricao: group.descricao,
                    isAdmin: assoc.isAdmin 
                };
            }
            return null; 
        }).filter(group => group !== null); 
    }
    
    
    async create(createGroupsDto: CreateGroupDto){
        try{
            const groupExist = await this.groupRepository.findOneBy({tagname: createGroupsDto.tagname})

            if(groupExist){
                throw new HttpException('Já existe um grupo com essa tag!', HttpStatus.CONFLICT);
            }

            const group = this.groupRepository.create({
                name: createGroupsDto.name,
                descricao: createGroupsDto.descricao,
                tagname: createGroupsDto.tagname
            });
            const savedGroup = await this.groupRepository.save(group);

            const userGroup = this.userGroupRepository.create({
                userId: createGroupsDto.userId,
                groupId: savedGroup.id,
                isAdmin: true, 
            });
            await this.userGroupRepository.save(userGroup);

            return savedGroup;
        } catch (error) {
		    throw new HttpException(
                error.response?.message || 'Erro interno ao criar grupo.',
                error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
		);
        }
    }

    async update(id: number, updatedGroup: any){
         const group = await this.groupRepository.findOneBy({id: id})

         if(!group){
            throw new NotFoundException(`Grupo não encontrado`)
        }

        return this.groupRepository.update(id, updatedGroup)
    }

    async delete(id: number){
        try {
            await this.userGroupRepository.delete({ groupId: id });
            return await this.groupRepository.delete(id);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    async getGroupMembers(groupId: number) {
        const group = await this.groupRepository.findOneBy({ id: groupId });
        if (!group) {
            throw new NotFoundException(`Grupo com ID ${groupId} não encontrado.`);
        }

        const members = await this.userGroupRepository.find({
            where: { groupId: groupId },
            relations: ['users'],
        });

        return members.map(member => ({
            userId: member.userId,
            email: member.users[0]?.email,
            name: member.users[0]?.name,
            isAdmin: member.isAdmin,
        }));
    }

    async addUsersToGroup(groupId: number, userEmails: string[]) {
        const group = await this.groupRepository.findOneBy({ id: groupId });
        if (!group) {
            throw new NotFoundException(`Grupo com ID ${groupId} não encontrado.`);
        }

        const results: { email: string; status: string }[] = [];

        for (const email of userEmails) {
            const user = await this.usersService.findOne(email);
            if (!user) {
                results.push({ email, status: 'Usuário não encontrado' });
                continue;
            }

            const existingAssociation = await this.userGroupRepository.findOne({
                where: { userId: user.id, groupId: groupId },
            });

            if (existingAssociation) {
                results.push({ email, status: 'Já é membro do grupo' });
                continue;
            }

            const userGroup = this.userGroupRepository.create({
                userId: user.id,
                groupId: groupId,
                isAdmin: false, 
            });
            await this.userGroupRepository.save(userGroup);
            results.push({ email, status: 'Adicionado com sucesso' });
        }

        return { message: 'Processamento de usuários concluído.', details: results };
    }

    async removeUserFromGroup(groupId: number, userIdToRemove: number) {
        const association = await this.userGroupRepository.findOne({
            where: { groupId: groupId, userId: userIdToRemove },
        });

        if (!association) {
            throw new NotFoundException(`Usuário não encontrado no grupo.`);
        }

        await this.userGroupRepository.remove(association);
        return { message: 'Usuário removido do grupo com sucesso.' };
    }

    async updateUserGroupAdminStatus(groupId: number, userIdToUpdate: number, isAdmin: boolean) {
        const association = await this.userGroupRepository.findOne({
            where: { groupId: groupId, userId: userIdToUpdate },
        });

        if (!association) {
            throw new NotFoundException(`Associação de usuário e grupo não encontrada.`);
        }

        association.isAdmin = isAdmin;
        await this.userGroupRepository.save(association);
        return { message: 'Status de administrador atualizado com sucesso.' };
    }

    async isUserGroupAdmin(userId: number, groupId: number): Promise<boolean> {
        const association = await this.userGroupRepository.findOne({
            where: { userId: userId, groupId: groupId },
        });
        return association ? association.isAdmin : false;
    }
}