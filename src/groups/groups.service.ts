import {
  HttpException,
  Injectable,
  NotFoundException,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, In } from 'typeorm';
import { CreateGroupDto } from './dto/createGroup.dto';
import { Groups } from './groups.entity';
import { Users } from 'src/users/users.entity';
import { UserGroup } from 'src/user_group/user_group.entity';
import { UsersService } from 'src/users/users.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Groups)
    private readonly groupRepository: MongoRepository<Groups>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: MongoRepository<UserGroup>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.groupRepository.find();
  }

  findByTag(tagname: string) {
    return this.groupRepository.findOne({ where: { tagname: tagname } });
  }

  async findUserGroups(userId: string) {
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    const userObjectId = new ObjectId(userId);

    const userGroupsAssociations = await this.userGroupRepository.find({
      where: { userId: userObjectId },
    });

    if (userGroupsAssociations.length === 0) {
      return [];
    }

    const groupObjectIds = userGroupsAssociations.map((assoc) => assoc.groupId);
    const uniqueGroupObjectIds = [
      ...new Set(groupObjectIds.map((id) => id.toString())),
    ].map((id) => new ObjectId(id));

    const groupsDetails = await this.groupRepository.find({
      where: { _id: In(uniqueGroupObjectIds) },
    });

    const groupsMap = new Map(
      groupsDetails.map((group) => [group._id.toHexString(), group]),
    );

    return userGroupsAssociations
      .map((assoc) => {
        const group = groupsMap.get(assoc.groupId.toString());
        if (group) {
          return {
            id: group._id.toHexString(),
            name: group.name,
            tagname: group.tagname,
            descricao: group.descricao,
            isAdmin: assoc.isAdmin,
          };
        }
        return null;
      })
      .filter((group) => group !== null);
  }

  async create(createGroupsDto: CreateGroupDto) {
    if (!ObjectId.isValid((createGroupsDto as any).userId)) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    const userObjectId = new ObjectId((createGroupsDto as any).userId);

    try {
      const groupExist = await this.groupRepository.findOne({
        where: { tagname: createGroupsDto.tagname },
      });

      if (groupExist) {
        throw new HttpException(
          'Já existe um grupo com essa tag!',
          HttpStatus.CONFLICT,
        );
      }

      const group = this.groupRepository.create({
        name: createGroupsDto.name,
        descricao: createGroupsDto.descricao,
        tagname: createGroupsDto.tagname,
      });
      const savedGroup = await this.groupRepository.save(group);

      const userGroup = this.userGroupRepository.create({
        userId: userObjectId,
        groupId: savedGroup._id,
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

  async update(id: string, updatedGroup: any) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de grupo inválido.');
    }
    const groupObjectId = new ObjectId(id);

    const group = await this.groupRepository.findOneBy({ _id: groupObjectId });

    if (!group) {
      throw new NotFoundException(`Grupo não encontrado`);
    }

    await this.groupRepository.updateOne(
      { _id: groupObjectId },
      { $set: updatedGroup },
    );
    return { message: 'Grupo atualizado com sucesso!' };
  }

  async delete(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de grupo inválido.');
    }
    const groupObjectId = new ObjectId(id);
    try {
      await this.userGroupRepository.deleteMany({ groupId: groupObjectId });
      const result = await this.groupRepository.deleteOne({
        _id: groupObjectId,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Grupo com ID ${id} não encontrado.`);
      }
      return { message: 'Grupo excluído com sucesso.' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getGroupMembers(groupId: string) {
    if (!ObjectId.isValid(groupId)) {
      throw new BadRequestException('ID de grupo inválido.');
    }
    const groupObjectId = new ObjectId(groupId);

    const group = await this.groupRepository.findOneBy({ _id: groupObjectId });
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado.`);
    }

    const members = await this.userGroupRepository.find({
      where: { groupId: groupObjectId },
    });

    const userObjectIds = members.map((m) => m.userId);
    const usersDetails = await this.usersService.findManyByIds(userObjectIds);

    const usersMap = new Map(
      usersDetails.map((user) => [user._id.toHexString(), user]),
    );

    return members
      .map((member) => {
        const user = usersMap.get(member.userId.toString());
        if (user) {
          return {
            userId: user._id.toHexString(),
            email: user.email,
            name: user.name,
            isAdmin: member.isAdmin,
          };
        }
        return null;
      })
      .filter((m) => m !== null);
  }

  async addUsersToGroup(groupId: string, userEmails: string[]) {
    if (!ObjectId.isValid(groupId)) {
      throw new BadRequestException('ID de grupo inválido.');
    }
    const groupObjectId = new ObjectId(groupId);

    const group = await this.groupRepository.findOneBy({ _id: groupObjectId });
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
        where: { userId: user._id, groupId: groupObjectId },
      });

      if (existingAssociation) {
        results.push({ email, status: 'Já é membro do grupo' });
        continue;
      }

      const userGroup = this.userGroupRepository.create({
        userId: user._id,
        groupId: groupObjectId,
        isAdmin: false,
      });
      await this.userGroupRepository.save(userGroup);
    }

    return {
      message: 'Processamento de usuários concluído.',
      details: results,
    };
  }

  async removeUserFromGroup(groupId: string, userIdToRemove: string) {
    if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userIdToRemove)) {
      throw new BadRequestException('ID de grupo ou usuário inválido.');
    }
    const groupObjectId = new ObjectId(groupId);
    const userObjectIdToRemove = new ObjectId(userIdToRemove);

    const association = await this.userGroupRepository.findOne({
      where: { groupId: groupObjectId, userId: userObjectIdToRemove },
    });

    if (!association) {
      throw new NotFoundException(`Usuário não encontrado no grupo.`);
    }

    await this.userGroupRepository.deleteOne({ _id: association._id });
    return { message: 'Usuário removido do grupo com sucesso.' };
  }

  async updateUserGroupAdminStatus(
    groupId: string,
    userIdToUpdate: string,
    isAdmin: boolean,
  ) {
    if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userIdToUpdate)) {
      throw new BadRequestException('ID de grupo ou usuário inválido.');
    }
    const groupObjectId = new ObjectId(groupId);
    const userObjectIdToUpdate = new ObjectId(userIdToUpdate);

    const association = await this.userGroupRepository.findOne({
      where: { groupId: groupObjectId, userId: userObjectIdToUpdate },
    });

    if (!association) {
      throw new NotFoundException(
        `Associação de usuário e grupo não encontrada.`,
      );
    }

    association.isAdmin = isAdmin;
    await this.userGroupRepository.save(association);

    return { message: 'Status de administrador atualizado com sucesso.' };
  }

  async isUserGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(groupId)) {
      return false;
    }
    const userObjectId = new ObjectId(userId);
    const groupObjectId = new ObjectId(groupId);
    const association = await this.userGroupRepository.findOne({
      where: { userId: userObjectId, groupId: groupObjectId },
    });
    return association ? association.isAdmin : false;
  }
}
