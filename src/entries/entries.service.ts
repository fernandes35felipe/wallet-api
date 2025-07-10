// STARTOFFILE src/entries/entries.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'; // Adicionar BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, In } from 'typeorm'; // MUDANÇA: MongoRepository
import { CreateEntryDto } from './dto/createEntry.dto';
import { Entries } from './entries.entity';
import { ObjectId } from 'mongodb'; // Importar ObjectId

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entries)
    private readonly entryRepository: MongoRepository<Entries>, // MUDANÇA: MongoRepository
  ) {}

  async findAll(user: any, groupId?: string) {
    // MUDANÇA: groupId é string
    if (!ObjectId.isValid(user.id)) {
      // ID do usuário do token
      throw new BadRequestException('ID de usuário inválido.');
    }
    const userObjectId = new ObjectId(user.id);

    const queryBuilder = this.entryRepository
      .createQueryBuilder('entry')
      .where({ user_id: userObjectId }); // MUDANÇA: user_id é ObjectId

    if (groupId !== undefined && groupId !== null) {
      if (!ObjectId.isValid(groupId)) {
        // Validar groupId
        throw new BadRequestException('ID de grupo inválido.');
      }
      queryBuilder.andWhere({ group_id: new ObjectId(groupId) }); // MUDANÇA: group_id é ObjectId
    }

    const entries = await queryBuilder
      .orderBy('date', 'DESC') // Ordenar por campo
      .getMany(); // MUDANÇA: getMany para MongoDB

    if (entries.length > 0) {
      return entries;
    } else {
      throw new HttpException(
        `Não foram encontrados ganhos para esse usuário no grupo selecionado`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(id: string) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de entrada inválido.');
    }
    return this.entryRepository.findOne({ where: { _id: new ObjectId(id) } }); // MUDANÇA: _id
  }

  async create(createEntryDto: CreateEntryDto) {
    // createEntryDto.group_id e user_id serão strings
    if (!ObjectId.isValid(String(createEntryDto.user_id))) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    if (!ObjectId.isValid(String(createEntryDto.group_id))) {
      throw new BadRequestException('ID de grupo inválido.');
    }

    const entry = this.entryRepository.create({
      ...createEntryDto,
      user_id: new ObjectId(String(createEntryDto.user_id)), // Converte para ObjectId
      group_id: new ObjectId(String(createEntryDto.group_id)), // Converte para ObjectId
      value: Number(createEntryDto.value), // Garante que value é number
    });

    return this.entryRepository.save(entry);
  }

  async update(id: string, updatedUser: any) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de entrada inválido.');
    }
    const entryObjectId = new ObjectId(id);

    const entry = await this.entryRepository.findOneBy({ _id: entryObjectId });

    if (!entry) {
      throw new NotFoundException(`Entrada não encontrada`);
    }

    if (updatedUser.user_id && !ObjectId.isValid(updatedUser.user_id)) {
      throw new BadRequestException('ID de usuário inválido na atualização.');
    }
    if (updatedUser.group_id && !ObjectId.isValid(updatedUser.group_id)) {
      throw new BadRequestException('ID de grupo inválido na atualização.');
    }
    if (updatedUser.value) {
      updatedUser.value = Number(updatedUser.value);
    }
    if (updatedUser.user_id) {
      updatedUser.user_id = new ObjectId(updatedUser.user_id);
    }
    if (updatedUser.group_id) {
      updatedUser.group_id = new ObjectId(updatedUser.group_id);
    }

    await this.entryRepository.updateOne(
      { _id: entryObjectId },
      { $set: updatedUser },
    );
    return { message: 'Entrada atualizada com sucesso!' };
  }

  async delete(id: string) {
    // MUDANÇA: id é string
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('ID de entrada inválido.');
    }
    try {
      const result = await this.entryRepository.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Entrada com ID ${id} não encontrada.`);
      }
      return { message: 'Entrada excluída com sucesso.' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
